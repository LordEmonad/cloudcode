import * as THREE from 'three';
import type { PartId } from './ragdoll';
import { BONE_NAMES } from './damage';

// DOM HUD (report: chunky outlined comic numerals, animate only transform and
// opacity, no buttons during the fall).

const BONE_ORDER: PartId[] = ['head', 'chest', 'spine', 'pelvis', 'upperArmL', 'upperArmR', 'foreArmL', 'foreArmR', 'thighL', 'thighR', 'shinL', 'shinR'];

// A simple front-view skeleton: each bone is a rounded line in a 100x150 box.
const SKELETON_SVG: Record<PartId, string> = {
  head: '<circle cx="50" cy="16" r="11"/>',
  chest: '<path d="M38 34 Q50 30 62 34 L60 52 Q50 56 40 52 Z"/>',
  spine: '<line x1="50" y1="56" x2="50" y2="72"/>',
  pelvis: '<path d="M38 74 Q50 70 62 74 L58 84 Q50 88 42 84 Z"/>',
  upperArmR: '<line x1="37" y1="36" x2="27" y2="58"/>',
  upperArmL: '<line x1="63" y1="36" x2="73" y2="58"/>',
  foreArmR: '<line x1="27" y1="60" x2="21" y2="82"/>',
  foreArmL: '<line x1="73" y1="60" x2="79" y2="82"/>',
  thighR: '<line x1="44" y1="88" x2="41" y2="114"/>',
  thighL: '<line x1="56" y1="88" x2="59" y2="114"/>',
  shinR: '<line x1="41" y1="117" x2="40" y2="142"/>',
  shinL: '<line x1="59" y1="117" x2="60" y2="142"/>',
};

function skeletonSvg(cls: string): string {
  const bones = BONE_ORDER.map((id) => SKELETON_SVG[id].replace(/^<(\w+)/, `<$1 data-bone="${id}"`)).join('');
  return `<svg class="${cls}" viewBox="0 0 100 150" aria-hidden="true">${bones}</svg>`;
}

export interface ResultData {
  damage: number;
  final: number;
  well: { label: string; mult: number };
  broken: PartId[];
  hits: number;
  maxImpact: number;
  time: number;
  best: number;
  newBest: boolean;
  whales: number;
}

export class Hud {
  private root: HTMLElement;
  private ticker: HTMLElement;
  private tickerValue: HTMLElement;
  private mult: HTMLElement;
  private bones: SVGElement;
  private depthFill: HTMLElement;
  private depthDot: HTMLElement;
  private callouts: HTMLElement;
  private hint: HTMLElement;
  private results: HTMLElement;
  private bestEl: HTMLElement;
  private shown = 0;
  private target = 0;
  private flashEl: HTMLElement;
  private recent: { x: number; y: number; t: number }[] = [];
  onAgain: (() => void) | null = null;
  onSettings: (() => void) | null = null;

  constructor(host: HTMLElement) {
    host.innerHTML = `
      <div class="hud-top">
        <div class="ticker"><span class="ticker-sym">NGD</span><span class="ticker-arrow">▼</span><span class="ticker-value">0</span></div>
        <div class="mult"></div>
      </div>
      ${skeletonSvg('hud-bones')}
      <div class="depth"><div class="depth-fill"></div><div class="depth-dot"></div></div>
      <div class="best"></div>
      <button class="gear" aria-label="Settings">⚙</button>
      <div class="callouts"></div>
      <div class="hint"><div class="hint-hand"></div><div class="hint-trail"></div><div class="hint-text">PULL UP · LET GO</div></div>
      <div class="screen-flash"></div>
      <div class="results" hidden></div>
    `;
    this.root = host;
    this.ticker = host.querySelector('.ticker')!;
    this.tickerValue = host.querySelector('.ticker-value')!;
    this.mult = host.querySelector('.mult')!;
    this.bones = host.querySelector('.hud-bones')!;
    this.depthFill = host.querySelector('.depth-fill')!;
    this.depthDot = host.querySelector('.depth-dot')!;
    this.callouts = host.querySelector('.callouts')!;
    this.hint = host.querySelector('.hint')!;
    this.results = host.querySelector('.results')!;
    this.bestEl = host.querySelector('.best')!;
    this.flashEl = host.querySelector('.screen-flash')!;
    host.querySelector('.gear')!.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.onSettings?.();
    });
  }

  reset(best: number): void {
    this.shown = 0;
    this.target = 0;
    this.tickerValue.textContent = '0';
    this.bones.querySelectorAll('[data-bone]').forEach((b) => b.classList.remove('hit', 'broken'));
    this.mult.innerHTML = '';
    this.results.hidden = true;
    this.root.classList.remove('flying', 'done');
    this.bestEl.textContent = best > 0 ? `BEST ▼${fmt(best)}` : '';
  }

  showHint(on: boolean): void {
    this.hint.classList.toggle('on', on);
  }

  setFlying(on: boolean): void {
    this.root.classList.toggle('flying', on);
  }

  setDamage(total: number): void {
    if (total > this.target) {
      this.ticker.classList.remove('bump');
      void this.ticker.offsetWidth;
      this.ticker.classList.add('bump');
    }
    this.target = total;
  }

  setMultiplier(combo: number, leverage: number, whales: number): void {
    const pills: string[] = [];
    if (combo > 1.001) pills.push(`<span class="pill combo">COMBO x${combo.toFixed(2)}</span>`);
    if (leverage > 1) pills.push(`<span class="pill lev">x${leverage} LEVERAGE</span>`);
    if (whales > 0) pills.push(`<span class="pill whale">WHALE +${whales}x</span>`);
    const html = pills.join('');
    if (html !== this.mult.innerHTML) this.mult.innerHTML = html;
  }

  markBone(id: PartId, state: 'hit' | 'broken'): void {
    const el = this.bones.querySelector(`[data-bone="${id}"]`);
    if (!el) return;
    el.classList.add(state);
    if (state === 'broken') {
      this.bones.classList.remove('pop');
      void (this.bones as unknown as HTMLElement).getBoundingClientRect();
      this.bones.classList.add('pop');
    }
  }

  setDepth(fraction: number): void {
    const f = THREE.MathUtils.clamp(fraction, 0, 1);
    this.depthFill.style.transform = `scaleY(${f})`;
    this.depthDot.style.transform = `translateY(${f * 100}%)`;
  }

  flash(color: string, amount: number): void {
    if (amount <= 0) return;
    this.flashEl.style.background = color;
    this.flashEl.animate([{ opacity: amount }, { opacity: 0 }], { duration: 260, easing: 'ease-out' });
  }

  /** Big title card for entering a circle of hell. */
  banner(sub: string, title: string): void {
    const el = document.createElement('div');
    el.className = 'banner';
    el.innerHTML = `<small>${sub}</small><span>${title}</span>`;
    this.root.appendChild(el);
    el.animate(
      [
        { transform: 'translate(-50%, -50%) scale(1.6) rotate(-4deg)', opacity: 0, filter: 'blur(6px)' },
        { transform: 'translate(-50%, -50%) scale(1) rotate(-2deg)', opacity: 1, filter: 'blur(0)', offset: 0.12 },
        { transform: 'translate(-50%, -50%) scale(0.98) rotate(-2deg)', opacity: 1, offset: 0.8 },
        { transform: 'translate(-50%, -60%) scale(0.9) rotate(-2deg)', opacity: 0 },
      ],
      { duration: 1900, easing: 'cubic-bezier(.2,.8,.2,1)' },
    ).onfinish = () => el.remove();
  }

  /** A comic callout at a screen position. */
  callout(text: string, x: number, y: number, style: 'bonk' | 'crack' | 'points' | 'big' | 'gate' | 'whale', sub?: string): void {
    const el = document.createElement('div');
    el.className = `callout ${style}`;
    el.innerHTML = sub ? `<span>${text}</span><small>${sub}</small>` : `<span>${text}</span>`;
    const w = window.innerWidth;
    el.style.visibility = 'hidden';
    this.callouts.appendChild(el);
    // Keep the whole callout on screen; big ones sit in the middle.
    const half = Math.min(el.offsetWidth / 2 + 8, w / 2);
    const cx = style === 'big' ? w / 2 : THREE.MathUtils.clamp(x, half, w - half);
    let cy = THREE.MathUtils.clamp(y, 120, window.innerHeight - 90);
    const now = performance.now();
    this.recent = this.recent.filter((r) => now - r.t < 450);
    for (const r of this.recent) {
      if (Math.abs(r.y - cy) < 46 && Math.abs(r.x - cx) < 160) cy = r.y - 48;
    }
    this.recent.push({ x: cx, y: cy, t: now });
    el.style.left = `${cx}px`;
    el.style.top = `${cy}px`;
    el.style.visibility = '';
    const rot = (Math.random() - 0.5) * (style === 'points' ? 6 : 14);
    el.style.setProperty('--rot', `${rot}deg`);
    const life = style === 'big' ? 1300 : style === 'points' ? 900 : 750;
    const rise = style === 'points' ? -60 : -24;
    el.animate(
      [
        { transform: `translate(-50%,-50%) rotate(var(--rot)) scale(0.2)`, opacity: 0 },
        { transform: `translate(-50%,-50%) rotate(var(--rot)) scale(1.18)`, opacity: 1, offset: 0.14 },
        { transform: `translate(-50%,-50%) rotate(var(--rot)) scale(1)`, opacity: 1, offset: 0.28 },
        { transform: `translate(-50%,calc(-50% + ${rise}px)) rotate(var(--rot)) scale(0.96)`, opacity: 0 },
      ],
      { duration: life, easing: 'cubic-bezier(.2,.8,.2,1)' },
    ).onfinish = () => el.remove();
    while (this.callouts.childElementCount > 9) this.callouts.firstElementChild?.remove();
  }

  update(dt: number): void {
    if (this.shown !== this.target) {
      const diff = this.target - this.shown;
      this.shown += Math.sign(diff) * Math.max(Math.abs(diff) * (1 - Math.exp(-dt * 10)), 7);
      if ((diff > 0 && this.shown > this.target) || (diff < 0 && this.shown < this.target)) this.shown = this.target;
      this.tickerValue.textContent = fmt(Math.round(this.shown));
    }
  }

  showResults(r: ResultData): void {
    this.root.classList.add('done');
    const bones = BONE_ORDER.map((id) => {
      const b = r.broken.includes(id);
      return `<li class="${b ? 'broken' : ''}">${BONE_NAMES[id]}</li>`;
    }).join('');
    this.results.innerHTML = `
      <div class="card">
        <div class="card-title">${r.broken.length >= 10 ? 'TOTALLY REKT' : r.broken.length >= 6 ? 'REKT' : r.broken.length >= 2 ? 'PAPER HANDS' : 'BARELY A DIP'}</div>
        <div class="card-well">landed in <b>${r.well.label}</b> · x${r.well.mult}</div>
        <div class="card-score"><span class="arrow">▼</span>${fmt(r.final)}</div>
        <div class="card-sub">${fmt(r.damage)} damage × ${r.well.mult}${r.newBest ? ' · <b class="newbest">NEW BEST</b>' : ` · best ▼${fmt(r.best)}`}</div>
        <div class="card-body">
          ${skeletonSvg('card-bones')}
          <div class="card-stats">
            <div><b>${r.broken.length}</b>/12 bones</div>
            <div><b>${r.hits}</b> hits</div>
            <div><b>${r.maxImpact.toFixed(0)}</b> m/s top hit</div>
            <div><b>${r.time.toFixed(1)}</b> s fall</div>
            ${r.whales ? `<div><b>${r.whales}</b> whale${r.whales > 1 ? 's' : ''} bonked</div>` : ''}
          </div>
        </div>
        <ul class="card-list">${bones}</ul>
        <button class="again">FLING AGAIN</button>
      </div>`;
    const svg = this.results.querySelector('.card-bones')!;
    for (const id of r.broken) svg.querySelector(`[data-bone="${id}"]`)?.classList.add('broken');
    this.results.hidden = false;
    this.results.querySelector('.again')!.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.onAgain?.();
    });
  }

  project(p: THREE.Vector3, camera: THREE.Camera): { x: number; y: number } {
    const v = p.clone().project(camera);
    return { x: (v.x * 0.5 + 0.5) * window.innerWidth, y: (-v.y * 0.5 + 0.5) * window.innerHeight };
  }
}

export function fmt(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}
