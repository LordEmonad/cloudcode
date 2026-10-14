import * as THREE from 'three';
import { SHOW } from './config';
import type { ImpactEvent } from './damage';

// Presentation tiers from the report:
//  T1 bump   : no freeze, small trauma, tiny popup
//  T2 slam   : 40-80 ms freeze, directional kick, BONK, chroma pulse
//  T3 break  : 20 + 15 x bone size ms freeze, X-ray blink, CRACK!
//  T4 cinema : freeze -> ease to 0.25x -> hold -> ease out, zoom + orbit, full X-ray
// T4 is rationed: max(2, run / 12 s) per run, 6.5 s cooldown, novelty gate.

export type Tier = 1 | 2 | 3 | 4;

export interface Settings {
  shake: number; // 0..1
  flashing: boolean;
  cinematics: 'always' | 'big' | 'off';
  reducedMotion: boolean;
}

interface Slowmo {
  start: number; // real time
  easeIn: number;
  hold: number;
  easeOut: number;
  scale: number;
  finale: boolean;
}

export class Director {
  timeScale = 1;
  xray = 0; // 0..1 how X-rayed the body is
  cinematic = 0; // 0..1 camera close-up blend
  vibrate = 0; // visual-only mesh vibration amount (Sakurai: shake the victim)
  readonly closeUp = new THREE.Vector3();
  orbitSign = 1;
  grade = { desat: 0, cool: 0, grain: 0, flash: 0, chroma: 0, vignette: 0.35 };
  steeringBoost = 1;
  inCinematic = false;
  private freezeUntil = 0;
  private slowmo: Slowmo | null = null;
  private xrayUntil = 0;
  private cinematicCount = 0;
  private lastCinematicSimT = -100;
  private biggest = 0;
  private now = 0;
  private flashBudget: number[] = [];

  constructor(public settings: Settings) {}

  reset(): void {
    this.timeScale = 1;
    this.xray = 0;
    this.cinematic = 0;
    this.freezeUntil = 0;
    this.slowmo = null;
    this.xrayUntil = 0;
    this.cinematicCount = 0;
    this.lastCinematicSimT = -100;
    this.biggest = 0;
    this.inCinematic = false;
  }

  /** Decide each event's presentation tier. Returns the tiers for the FX layer. */
  handle(events: ImpactEvent[], simT: number): { ev: ImpactEvent; tier: Tier }[] {
    const out: { ev: ImpactEvent; tier: Tier }[] = [];
    // Biggest first so one dramatic moment wins the frame.
    const sorted = [...events].sort((a, b) => b.strength + (b.broke ? 10 : 0) - (a.strength + (a.broke ? 10 : 0)));
    let tookCinematic = false;
    for (const ev of sorted) {
      let tier: Tier = ev.tier === 3 ? 3 : ev.tier === 2 ? 2 : 1;
      if (ev.tier === 0) continue;
      if (tier === 3 && !tookCinematic && this.cinematicAllowed(ev, simT)) {
        tier = 4;
        tookCinematic = true;
        this.startCinematic(ev, simT, false);
      }
      if (tier === 3) this.breakBeat(ev);
      if (tier === 2) this.slamBeat(ev);
      out.push({ ev, tier });
    }
    return out;
  }

  private cinematicAllowed(ev: ImpactEvent, simT: number): boolean {
    if (this.settings.cinematics === 'off') return false;
    if (this.slowmo) return false;
    const budget = Math.max(2, Math.floor(simT / 12) + 1);
    if (this.cinematicCount >= budget) return false;
    if (simT - this.lastCinematicSimT < SHOW.cinematicCooldown) return false;
    const novel = ev.firstBreakOfBone || ev.strength >= this.biggest * 1.25;
    if (!novel) return false;
    if (this.settings.cinematics === 'big' && ev.strength < 0.9) return false;
    return true;
  }

  private startCinematic(ev: ImpactEvent, simT: number, finale: boolean): void {
    this.cinematicCount++;
    this.lastCinematicSimT = simT;
    this.biggest = Math.max(this.biggest, ev.strength);
    // Later cinematics in a run run shorter (report: 15-20% each).
    const shrink = finale ? 1.35 : Math.pow(0.83, this.cinematicCount - 1);
    this.freezeUntil = this.now + 0.1;
    this.slowmo = {
      start: this.now + 0.1,
      easeIn: SHOW.slowmoEaseIn,
      hold: SHOW.slowmoHold * shrink,
      easeOut: SHOW.slowmoEaseOut,
      scale: SHOW.slowmoScale,
      finale,
    };
    this.closeUp.copy(ev.point);
    this.orbitSign = ev.normal.x >= 0 ? 1 : -1;
    this.xrayUntil = this.now + 0.1 + SHOW.slowmoEaseIn + SHOW.slowmoHold * shrink;
    this.vibrate = 1;
    this.flash(0.9);
    this.grade.chroma = 1;
  }

  private breakBeat(ev: ImpactEvent): void {
    const size = THREE.MathUtils.clamp(ev.part.spec.points / 300, 2.5, 8);
    this.freeze((20 + 15 * size) / 1000);
    this.xrayUntil = Math.max(this.xrayUntil, this.now + 0.22);
    this.vibrate = Math.max(this.vibrate, 0.8);
    this.grade.chroma = Math.max(this.grade.chroma, 0.8);
    this.flash(0.35);
  }

  private slamBeat(ev: ImpactEvent): void {
    this.freeze(THREE.MathUtils.lerp(0.04, 0.08, THREE.MathUtils.clamp((ev.strength - 0.35) / 0.35, 0, 1)));
    this.vibrate = Math.max(this.vibrate, 0.5);
    this.grade.chroma = Math.max(this.grade.chroma, 0.5);
  }

  /** The final crater impact always gets a cinematic (Peggle's last-peg rule). */
  finale(ev: ImpactEvent): void {
    this.slowmo = null;
    this.startCinematic(ev, 1e9, true);
  }

  freeze(seconds: number): void {
    // Celeste: no freeze while time is already slowed.
    if (this.slowmo) return;
    this.freezeUntil = Math.max(this.freezeUntil, this.now + seconds);
  }

  liftOff(): void {
    // A short slow beat as he leaves the slingshot.
    this.slowmo = { start: this.now, easeIn: 0.02, hold: 0.16, easeOut: 0.22, scale: 0.45, finale: false };
  }

  /** Tap to skip a cinematic (report). */
  skip(): void {
    if (!this.slowmo || this.slowmo.finale) return;
    const s = this.slowmo;
    const elapsed = this.now - s.start;
    if (elapsed < s.easeIn + s.hold) s.hold = Math.max(0, elapsed - s.easeIn);
    this.xrayUntil = Math.min(this.xrayUntil, this.now + 0.05);
  }

  private flash(amount: number): void {
    if (!this.settings.flashing) return;
    // WCAG 2.3.1: at most three flashes in any second.
    this.flashBudget = this.flashBudget.filter((t) => this.now - t < 1);
    if (this.flashBudget.length >= 3) return;
    this.flashBudget.push(this.now);
    this.grade.flash = Math.max(this.grade.flash, amount);
  }

  update(realDt: number): void {
    this.now += realDt;
    let scale = 1;
    let cine = 0;
    this.inCinematic = false;
    if (this.slowmo) {
      const s = this.slowmo;
      const e = this.now - s.start;
      if (e < 0) scale = 1;
      else if (e < s.easeIn) scale = THREE.MathUtils.lerp(1, s.scale, easeOut(e / s.easeIn));
      else if (e < s.easeIn + s.hold) scale = s.scale;
      else if (e < s.easeIn + s.hold + s.easeOut) scale = THREE.MathUtils.lerp(s.scale, 1, easeIn((e - s.easeIn - s.hold) / s.easeOut));
      else this.slowmo = null;
      if (this.slowmo) {
        const total = s.easeIn + s.hold + s.easeOut;
        const k = THREE.MathUtils.clamp(e / s.easeIn, 0, 1) * THREE.MathUtils.clamp((total - e) / s.easeOut, 0, 1);
        cine = s.finale || s.scale < 0.4 ? k : 0;
        this.inCinematic = cine > 0.05;
      }
    }
    if (this.now < this.freezeUntil) scale = Math.min(scale, SHOW.hitstopScale);
    this.timeScale = scale;
    if (this.settings.reducedMotion) cine *= 0.4;
    this.cinematic += (cine - this.cinematic) * (1 - Math.exp(-realDt * 14));
    this.steeringBoost = this.inCinematic ? 2 : 1;

    const xrayTarget = this.now < this.xrayUntil ? 1 : 0;
    this.xray += (xrayTarget - this.xray) * (1 - Math.exp(-realDt * (xrayTarget ? 40 : 10)));
    this.vibrate = Math.max(0, this.vibrate - realDt * 5);
    const g = this.grade;
    g.desat += ((this.inCinematic ? 0.3 : 0) - g.desat) * (1 - Math.exp(-realDt * 10));
    g.cool += ((this.inCinematic ? 0.6 : 0) - g.cool) * (1 - Math.exp(-realDt * 10));
    g.grain += ((this.inCinematic ? 1 : 0) - g.grain) * (1 - Math.exp(-realDt * 10));
    g.vignette += ((this.inCinematic ? 0.75 : 0.35) - g.vignette) * (1 - Math.exp(-realDt * 6));
    g.flash = Math.max(0, g.flash - realDt * 7);
    g.chroma = Math.max(0, g.chroma - realDt * 4);
  }
}

function easeOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

function easeIn(t: number): number {
  return t * t;
}
