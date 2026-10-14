import * as THREE from 'three';

// The descent as a list of sections (summit, stairs, banked road, drop, fall)
// integrated into one sampled centreline. The physics surface, the visuals,
// the camera, steering and progress all read these samples, so every section
// joins the next without a seam to snag on.

export type ZoneId = 'top' | 'dip' | 'whale' | 'inferno' | 'abyss';
export type SectionKind = 'summit' | 'stairs' | 'road' | 'drop' | 'fall';

export interface Section {
  kind: SectionKind;
  /** Horizontal length (road, stairs, summit, drop) or vertical drop (fall). */
  len: number;
  /** Slope at the end of the section, degrees (negative is downhill). */
  pitch?: number;
  /** Metres over which the slope eases from the previous section's. */
  ease?: number;
  /** Total heading change across the section, degrees (positive turns right). */
  turn?: number;
  /** Height lost in a drop. */
  drop?: number;
  width: number;
  /** Height of the banked walls (road only). */
  bank?: number;
  zone: ZoneId;
  name?: string;
}

export interface Sample {
  p: THREE.Vector3;
  f: THREE.Vector3; // along the track
  r: THREE.Vector3; // across, horizontal
  n: THREE.Vector3; // up off the surface
  s: number;
  section: number;
  width: number;
  bank: number;
}

export interface SectionInfo extends Section {
  index: number;
  s0: number;
  s1: number;
  i0: number; // first sample
  i1: number; // last sample
}

const UP = new THREE.Vector3(0, 1, 0);
const DEG = Math.PI / 180;

export class Track {
  readonly samples: Sample[] = [];
  readonly sections: SectionInfo[] = [];
  readonly length: number;
  private hint = 0;

  constructor(defs: Section[], start: THREE.Vector3, ds = 1) {
    const pos = start.clone();
    let yaw = 0; // 0 faces -z
    let pitch = 0;
    const pts: { p: THREE.Vector3; section: number; width: number; bank: number }[] = [{ p: pos.clone(), section: 0, width: defs[0].width, bank: defs[0].bank ?? 0 }];
    defs.forEach((d, si) => {
      const info: SectionInfo = { ...d, index: si, s0: 0, s1: 0, i0: pts.length - 1, i1: 0 };
      if (d.kind === 'fall') {
        const n = Math.ceil(d.len / ds);
        for (let k = 1; k <= n; k++) pts.push({ p: pos.clone().add(new THREE.Vector3(0, (-d.len * k) / n, 0)), section: si, width: d.width, bank: 0 });
        pos.y -= d.len;
      } else if (d.kind === 'drop') {
        const fwd = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
        const end = pos.clone().addScaledVector(fwd, d.len).add(new THREE.Vector3(0, -(d.drop ?? 0), 0));
        const n = Math.ceil(end.distanceTo(pos) / ds);
        for (let k = 1; k <= n; k++) pts.push({ p: pos.clone().lerp(end, k / n), section: si, width: d.width, bank: 0 });
        pos.copy(end);
      } else {
        const p0 = pitch;
        const p1 = (d.pitch ?? 0) * DEG;
        const ease = d.kind === 'stairs' ? 0 : d.ease ?? Math.min(d.len, 12);
        const n = Math.ceil(d.len / ds);
        const dh = d.len / n;
        const turn = (d.turn ?? 0) * DEG;
        for (let k = 1; k <= n; k++) {
          const along = k * dh;
          const e = ease > 0 ? THREE.MathUtils.smoothstep(along, 0, ease) : 1;
          pitch = p0 + (p1 - p0) * e;
          // Turn along a smooth S so the heading has no kink at either end.
          const tw = THREE.MathUtils.smootherstep(along, 0, d.len) - THREE.MathUtils.smootherstep(along - dh, 0, d.len);
          yaw -= turn * tw;
          pos.x += -Math.sin(yaw) * dh;
          pos.z += -Math.cos(yaw) * dh;
          pos.y += Math.tan(pitch) * dh;
          pts.push({ p: pos.clone(), section: si, width: d.width, bank: d.bank ?? 0 });
        }
      }
      info.i1 = pts.length - 1;
      this.sections.push(info);
    });

    // Frames and arc length.
    let s = 0;
    let lastR = new THREE.Vector3(1, 0, 0);
    pts.forEach((pt, i) => {
      if (i > 0) s += pt.p.distanceTo(pts[i - 1].p);
      const a = pts[Math.max(0, i - 1)].p;
      const b = pts[Math.min(pts.length - 1, i + 1)].p;
      // Use the incoming segment at section ends, so a lip stays a lip.
      const sameNext = i + 1 < pts.length && pts[i + 1].section === pt.section;
      const f = (sameNext ? b.clone().sub(a) : pt.p.clone().sub(a)).normalize();
      if (f.lengthSq() < 0.5) f.set(0, 0, -1);
      const r = new THREE.Vector3().crossVectors(f, UP);
      if (r.lengthSq() < 1e-4) r.copy(lastR); else r.normalize();
      lastR = r.clone();
      const n = new THREE.Vector3().crossVectors(r, f).normalize();
      this.samples.push({ p: pt.p, f, r, n, s, section: pt.section, width: pt.width, bank: pt.bank });
    });
    this.length = s;
    for (const info of this.sections) {
      info.s0 = this.samples[info.i0].s;
      info.s1 = this.samples[info.i1].s;
    }
  }

  section(name: string): SectionInfo {
    const sec = this.sections.find((x) => x.name === name);
    if (!sec) throw new Error(`no section ${name}`);
    return sec;
  }

  /** Index of the sample at or before arc length s. */
  indexAt(s: number): number {
    const c = THREE.MathUtils.clamp(s, 0, this.length);
    let lo = 0, hi = this.samples.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (this.samples[mid].s <= c) lo = mid; else hi = mid;
    }
    return lo;
  }

  pointAt(s: number, out = new THREE.Vector3()): THREE.Vector3 {
    const i = this.indexAt(s);
    const a = this.samples[i];
    const b = this.samples[Math.min(i + 1, this.samples.length - 1)];
    const t = b.s > a.s ? THREE.MathUtils.clamp((s - a.s) / (b.s - a.s), 0, 1) : 0;
    return out.copy(a.p).lerp(b.p, t);
  }

  /** Position and frame at arc length s, x across and h above the surface. */
  at(s: number, x = 0, h = 0): { p: THREE.Vector3; f: THREE.Vector3; r: THREE.Vector3; n: THREE.Vector3; sample: Sample } {
    const i = this.indexAt(s);
    const a = this.samples[i];
    const b = this.samples[Math.min(i + 1, this.samples.length - 1)];
    const t = b.s > a.s ? THREE.MathUtils.clamp((s - a.s) / (b.s - a.s), 0, 1) : 0;
    const f = a.f.clone().lerp(b.f, t).normalize();
    const r = a.r.clone().lerp(b.r, t).normalize();
    const n = a.n.clone().lerp(b.n, t).normalize();
    const p = a.p.clone().lerp(b.p, t).addScaledVector(r, x).addScaledVector(n, h);
    return { p, f, r, n, sample: a };
  }

  /** Nearest centreline point: arc length and sample index. Searches near the last answer first. */
  nearest(pos: THREE.Vector3): { s: number; i: number; d2: number } {
    const n = this.samples.length;
    const scan = (from: number, to: number) => {
      let best = { s: 0, i: 0, d2: Infinity };
      for (let i = Math.max(0, from); i < Math.min(n - 1, to); i++) {
        const a = this.samples[i].p;
        const b = this.samples[i + 1].p;
        const abx = b.x - a.x, aby = b.y - a.y, abz = b.z - a.z;
        const len2 = abx * abx + aby * aby + abz * abz;
        let t = len2 > 0 ? ((pos.x - a.x) * abx + (pos.y - a.y) * aby + (pos.z - a.z) * abz) / len2 : 0;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const dx = a.x + abx * t - pos.x, dy = a.y + aby * t - pos.y, dz = a.z + abz * t - pos.z;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < best.d2) best = { s: this.samples[i].s + t * (this.samples[i + 1].s - this.samples[i].s), i, d2 };
      }
      return best;
    };
    let best = scan(this.hint - 40, this.hint + 40);
    if (best.d2 > 100 || best.i <= this.hint - 39 || best.i >= this.hint + 38) best = scan(0, n);
    this.hint = best.i;
    return best;
  }
}
