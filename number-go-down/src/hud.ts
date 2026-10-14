import * as THREE from 'three';
import type { PartId } from './ragdoll';
import { BONE_NAMES, rankFor, type Trick } from './damage';

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

export interface Challenge {
  id: string;
  text: string;
  done: boolean;
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
  tricks: Trick[];
  challenges: Challenge[];
  maxCombo: number;
}

export type CalloutStyle = 'bonk' | 'crack' | 'points' | 'big' | 'gate' | 'whale' | 'trick' | 'slam';

export class Hud {
  private root: HTMLElement;
  private ticker: HTMLElement;
  private tickerValue: HTMLElement;
  private pct: HTMLElement;
  private comboEl: HTMLElement;
  private comboFill: HTMLElement;
  private comboLabel: HTMLElement;
  private pills: HTMLElement;
  private bones: SVGElement;
  private depthFill: HTMLElement;
  private depthDot: HTMLElement;
  private callouts: HTMLElement;
  private hint: HTMLElement;
  private slamEl: HTMLElement;
  private slamRing: SVGCircleElement;
  private slamText: HTMLElement;
  private results: HTMLElement;
  private bestEl: HTMLElement;
  private shown = 0;
  private target = 0;
  private flashEl: HTMLElement;
  private recent: { x: number; y: number; t: number }[] = [];
  private lastCombo = 0;
  onAgain: (() => void) | null = null;
  onSettings: (() => void) | null = null;

  constructor(host: HTMLElement) {
    host.innerHTML = `
      <div class="hud-top">
        <div class="ticker"><span class="ticker-sym">$NGD</span><span class="ticker-arrow">▼</span><span class="ticker-value">0</span></div>
        <div class="pct">0.00%</div>
        <div class="combo"><div class="combo-bar"><div class="combo-fill"></div></div><div class="combo-label">x1</div></div>
        <div class="pills"></div>
      </div>
      ${skeletonSvg('hud-bones')}
      <div class="depth"><div class="depth-fill"></div><div class="depth-dot"></div></div>
      <div class="best"></div>
      <button class="gear" aria-label="Settings">⚙</button>
      <div class="callouts"></div>
      <div class="hint"><div class="hint-hand"></div><div class="hint-trail"></div><div class="hint-text">PULL DOWN · LET GO</div></div>
      <div class="slam">
        <svg viewBox="0 0 64 64"><circle class="slam-track" cx="32" cy="32" r="27"/><circle class="slam-ring" cx="32" cy="32" r="27"/></svg>
        <div class="slam-text">TAP TO SLAM</div>
      </div>
      <div class="screen-flash"></div>
      <div class="results" hidden></div>
    `;
    this.root = host;
    this.ticker = host.querySelector('.ticker')!;
    this.tickerValue = host.querySelector('.ticker-value')!;
    this.pct = host.querySelector('.pct')!;
    this.comboEl = host.querySelector('.combo')!;
    this.comboFill = host.querySelector('.combo-fill')!;
    this.comboLabel = host.querySelector('.combo-label')!;
    this.pills = host.querySelector('.pills')!;
    this.bones = host.querySelector('.hud-bones')!;
    this.depthFill = host.querySelector('.depth-fill')!;
    this.depthDot = host.querySelector('.depth-dot')!;
    this.callouts = host.querySelector('.callouts')!;
    this.hint = host.querySelector('.hint')!;
    this.slamEl = host.querySelector('.slam')!;
    this.slamRing = host.querySelector('.slam-ring')!;
    this.slamText = host.querySelector('.slam-text')!;
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
    this.pct.textContent = '0.00%';
    this.bones.querySelectorAll('[data-bone]').forEach((b) => b.classList.remove('hit', 'broken'));
    this.pills.innerHTML = '';
    this.results.hidden = true;
    this.root.classList.remove('flying', 'done');
    this.bestEl.textContent = best > 0 ? `BEST ▼${fmt(best)}` : '';
    this.setCombo(1, 0);
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

  /** The combo meter: multiplier label and a draining heat bar. */
  setCombo(mult: number, heat: number): void {
    const on = mult > 1.001;
    this.comboEl.classList.toggle('on', on);
    this.comboFill.style.transform = `scaleX(${THREE.MathUtils.clamp(heat, 0, 1)})`;
    const label = `x${mult % 1 === 0 ? mult.toFixed(0) : mult.toFixed(1)}`;
    if (label !== this.comboLabel.textContent) {
      this.comboLabel.textContent = label;
      if (mult > this.lastCombo) {
        this.comboLabel.classList.remove('pop');
        void this.comboLabel.offsetWidth;
        this.comboLabel.classList.add('pop');
      }
    }
    this.comboEl.classList.toggle('hot', mult >= 4);
    this.lastCombo = mult;
  }

  setPills(leverage: number, whales: number): void {
    const pills: string[] = [];
    if (leverage > 1) pills.push(`<span class="pill lev">x${leverage} LEVERAGE</span>`);
    if (whales > 0) pills.push(`<span class="pill whale">WHALE +${whales * 0.5}x</span>`);
    const html = pills.join('');
    if (html !== this.pills.innerHTML) this.pills.innerHTML = html;
  }

  /** Slam cooldown ring: 0 = ready, 1 = just used. */
  setSlam(cooldown: number, show: boolean, coach: boolean): void {
    this.slamEl.classList.toggle('on', show);
    const c = 2 * Math.PI * 27;
    this.slamRing.style.strokeDasharray = `${c}`;
    this.slamRing.style.strokeDashoffset = `${c * cooldown}`;
    this.slamEl.classList.toggle('ready', cooldown <= 0.001);
    this.slamText.style.opacity = coach ? '1' : '0';
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
      { duration: 1700, easing: 'cubic-bezier(.2,.8,.2,1)' },
    ).onfinish = () => el.remove();
  }

  /** A comic callout at a screen position. */
  callout(text: string, x: number, y: number, style: CalloutStyle, sub?: string, scale = 1): void {
    const el = document.createElement('div');
    el.className = `callout ${style}`;
    el.innerHTML = sub ? `<span>${text}</span><small>${sub}</small>` : `<span>${text}</span>`;
    const w = window.innerWidth;
    el.style.visibility = 'hidden';
    this.callouts.appendChild(el);
    // Keep the whole callout on screen; big ones sit in the middle.
    const half = Math.min(el.offsetWidth / 2 + 8, w / 2);
    const centred = style === 'big' || style === 'trick' || style === 'slam';
    const cx = centred ? w / 2 : THREE.MathUtils.clamp(x, half, w - half);
    let cy = THREE.MathUtils.clamp(y, 150, window.innerHeight - 110);
    const now = performance.now();
    this.recent = this.recent.filter((r) => now - r.t < 450);
    for (const r of this.recent) {
      if (Math.abs(r.y - cy) < 46 && Math.abs(r.x - cx) < 160) cy = r.y - 50;
    }
    this.recent.push({ x: cx, y: cy, t: now });
    el.style.left = `${cx}px`;
    el.style.top = `${cy}px`;
    el.style.visibility = '';
    const rot = (Math.random() - 0.5) * (style === 'points' ? 6 : 12);
    el.style.setProperty('--rot', `${rot}deg`);
    const life = style === 'big' || style === 'trick' ? 1400 : style === 'points' ? 900 : 800;
    const rise = style === 'points' ? -70 : -26;
    el.animate(
      [
        { transform: `translate(-50%,-50%) rotate(var(--rot)) scale(${0.2 * scale})`, opacity: 0 },
        { transform: `translate(-50%,-50%) rotate(var(--rot)) scale(${1.22 * scale})`, opacity: 1, offset: 0.12 },
        { transform: `translate(-50%,-50%) rotate(var(--rot)) scale(${scale})`, opacity: 1, offset: 0.26 },
        { transform: `translate(-50%,calc(-50% + ${rise}px)) rotate(var(--rot)) scale(${0.96 * scale})`, opacity: 0 },
      ],
      { duration: life, easing: 'cubic-bezier(.2,.8,.2,1)' },
    ).onfinish = () => el.remove();
    while (this.callouts.childElementCount > 10) this.callouts.firstElementChild?.remove();
  }

  update(dt: number): void {
    if (this.shown !== this.target) {
      const diff = this.target - this.shown;
      this.shown += Math.sign(diff) * Math.max(Math.abs(diff) * (1 - Math.exp(-dt * 12)), 9);
      if ((diff > 0 && this.shown > this.target) || (diff < 0 && this.shown < this.target)) this.shown = this.target;
      this.tickerValue.textContent = fmt(Math.round(this.shown));
      // The "price": every 10k of damage is one more percent of the portfolio gone.
      const pct = Math.min(99.99, 100 * (1 - Math.exp(-this.shown / 6_000_000)));
      this.pct.textContent = `-${pct.toFixed(2)}%`;
    }
  }

  showResults(r: ResultData): void {
    this.root.classList.add('done');
    const [rank, rankSub] = rankFor(r.final);
    const bones = BONE_ORDER.map((id) => {
      const b = r.broken.includes(id);
      return `<li class="${b ? 'broken' : ''}">${BONE_NAMES[id]}</li>`;
    }).join('');
    const tricks = r.tricks.length
      ? `<ul class="card-tricks">${r.tricks.map((t) => `<li><span>${t.name}</span><b>+${fmt(t.points)}</b></li>`).join('')}</ul>`
      : '';
    const challenges = `<ul class="card-challenges">${r.challenges.map((c) => `<li class="${c.done ? 'done' : ''}"><i>${c.done ? '✓' : ''}</i>${c.text}</li>`).join('')}</ul>`;
    this.results.innerHTML = `
      <div class="card">
        <div class="card-rank"><small>${rankSub}</small><div class="card-title">${rank}</div></div>
        <div class="card-score"><span class="arrow">▼</span>${fmt(r.final)}</div>
        <div class="card-sub">${fmt(r.damage)} damage × ${r.well.mult} <b>${r.well.label}</b>${r.newBest ? ' · <b class="newbest">NEW BEST</b>' : ` · best ▼${fmt(r.best)}`}</div>
        <div class="card-body">
          ${skeletonSvg('card-bones')}
          <div class="card-stats">
            <div><b>${r.broken.length}</b>/12 bones</div>
            <div><b>${r.hits}</b> hits · <b>x${r.maxCombo % 1 === 0 ? r.maxCombo.toFixed(0) : r.maxCombo.toFixed(1)}</b> combo</div>
            <div><b>${r.maxImpact.toFixed(0)}</b> m/s top hit</div>
            <div><b>${r.time.toFixed(1)}</b> s run${r.whales ? ` · <b>${r.whales}</b> whale${r.whales > 1 ? 's' : ''}` : ''}</div>
          </div>
        </div>
        ${tricks}
        ${challenges}
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
