import * as THREE from 'three';
import type { World } from './physics';
import type { Ragdoll, Part, PartId } from './ragdoll';
import type { Course, Obstacle } from './course';
import { DAMAGE } from './config';

export interface ImpactEvent {
  part: Part;
  speed: number; // m/s along the contact normal
  strength: number; // 0..~2, speed relative to the reference impact
  obstacle: Obstacle;
  point: THREE.Vector3;
  normal: THREE.Vector3; // from the obstacle toward Emonad
  points: number;
  tier: 0 | 1 | 2 | 3;
  broke: boolean;
  firstBreakOfBone: boolean;
  groin: boolean;
  slam: boolean; // landed inside the SLAM window
  t: number;
}

export interface Trick {
  id: string;
  name: string;
  sub: string;
  points: number;
}

const _r = new THREE.Vector3();
const _w = new THREE.Vector3();
const _vPre = new THREE.Vector3();
const _vObs = new THREE.Vector3();

export class DamageModel {
  total = 0;
  hits = 0;
  maxImpact = 0;
  broken = new Set<PartId>();
  breakOrder: PartId[] = [];
  tricks: Trick[] = [];
  private tricksDone = new Set<string>();
  private stress = new Map<PartId, number>();
  private lastHit = new Map<PartId, number>();
  private lastBreak = new Map<PartId, number>();
  private recentBreaks: number[] = [];
  private recentHits: number[] = [];
  /** Combo chain: hits in quick succession push the multiplier up; silence drains it. */
  chain = 0;
  chainHeat = 0; // 0..1 meter shown in the HUD
  private lastChainT = -10;
  leverage = 1;
  leverageUntil = 0;
  whales = 0;
  private lastWhale = -10;
  lastEventT = 0;
  slamUntil = -1;
  obstaclesHit = new Set<string>();

  reset(): void {
    this.total = 0;
    this.hits = 0;
    this.maxImpact = 0;
    this.broken.clear();
    this.breakOrder = [];
    this.tricks = [];
    this.tricksDone.clear();
    this.stress.clear();
    this.lastHit.clear();
    this.lastBreak.clear();
    this.recentBreaks = [];
    this.recentHits = [];
    this.chain = 0;
    this.chainHeat = 0;
    this.lastChainT = -10;
    this.leverage = 1;
    this.leverageUntil = 0;
    this.whales = 0;
    this.lastWhale = -10;
    this.slamUntil = -1;
    this.obstaclesHit.clear();
  }

  /** Combo multiplier from the chain: x1 at 0, +0.5 per link, capped. */
  comboMult(): number {
    return Math.min(DAMAGE.comboCap, 1 + this.chain * DAMAGE.comboPerLink);
  }

  multiplier(t: number): number {
    const lev = t < this.leverageUntil ? this.leverage : 1;
    return this.comboMult() * lev * (1 + this.whales * DAMAGE.whaleBonus);
  }

  setLeverage(mult: number, t: number, seconds = 4): void {
    this.leverage = Math.max(t < this.leverageUntil ? this.leverage : 1, mult);
    this.leverageUntil = t + seconds;
  }

  /** Called every fixed step: the chain cools when nothing is hit. */
  tick(t: number, dt: number): void {
    const since = t - this.lastChainT;
    if (since > DAMAGE.chainWindow) {
      this.chainHeat = Math.max(0, this.chainHeat - dt / DAMAGE.chainDecay);
      if (this.chainHeat <= 0 && this.chain > 0) this.chain = 0;
    }
  }

  /** Bonus points from outside the contact model (gates, glass, tricks). */
  addBonus(points: number): number {
    const p = Math.round(points / 10) * 10;
    this.total += p;
    return p;
  }

  /** Award a named trick once per run. Returns it, or null if already done. */
  trick(id: string, name: string, sub: string, points: number, t: number): Trick | null {
    if (this.tricksDone.has(id)) return null;
    this.tricksDone.add(id);
    const p = this.addBonus(points * this.multiplier(t));
    const tr = { id, name, sub, points: p };
    this.tricks.push(tr);
    return tr;
  }

  /** Inspect this step's contacts; returns scored impact events. */
  detect(world: World, ragdoll: Ragdoll, course: Course, t: number): ImpactEvent[] {
    const events: ImpactEvent[] = [];
    for (const part of ragdoll.parts) {
      part.contact = false;
      let best: { speed: number; obstacle: Obstacle; point: THREE.Vector3; normal: THREE.Vector3 } | null = null;
      const com = part.body.worldCom();
      for (const collider of part.colliders) {
        world.contactPairsWith(collider, (other) => {
          const obstacle = course.obstacleOf(other.handle);
          if (!obstacle) return;
          world.contactPair(collider, other, (manifold, flipped) => {
            if (manifold.numSolverContacts() === 0) return;
            part.contact = true;
            const n = manifold.normal();
            // The manifold normal points from its first collider to its second.
            const normal = new THREE.Vector3(n.x, n.y, n.z).multiplyScalar(flipped ? 1 : -1);
            const p = manifold.solverContactPoint(0)!;
            const point = new THREE.Vector3(p.x, p.y, p.z);
            _r.set(p.x - com.x, p.y - com.y, p.z - com.z);
            _vPre.copy(part.preLinvel).add(_w.copy(part.preAngvel).cross(_r));
            const parent = other.parent();
            if (parent && parent.isKinematic()) {
              const v = parent.velocityAtPoint(p);
              _vObs.set(v.x, v.y, v.z);
            } else _vObs.set(0, 0, 0);
            const speed = -_vPre.sub(_vObs).dot(normal);
            if (!best || speed > best.speed) best = { speed, obstacle, point, normal };
          });
        });
      }
      if (!best) continue;
      const hit = best as { speed: number; obstacle: Obstacle; point: THREE.Vector3; normal: THREE.Vector3 };
      const ev = this.score(part, hit.speed, hit.obstacle, hit.point, hit.normal, t);
      if (ev) events.push(ev);
    }
    return events;
  }

  private score(part: Part, speed: number, obstacle: Obstacle, point: THREE.Vector3, normal: THREE.Vector3, t: number): ImpactEvent | null {
    if (speed < DAMAGE.ignoreBelow || obstacle.kind === 'soft') return null;
    const id = part.spec.id;
    if (t - (this.lastHit.get(id) ?? -1) < DAMAGE.hitCooldown) return null;
    this.lastHit.set(id, t);

    const slam = t < this.slamUntil;
    const eff = speed * obstacle.damageScale * (slam ? DAMAGE.slamDamage : 1);
    const strength = eff / DAMAGE.refImpact;
    const groin = id === 'pelvis' && this.isGroin(part, point);
    const mult = this.multiplier(t);
    const f = Math.pow(Math.max(0, eff - 2) / 10, 1.5);
    let points = part.spec.points * f * mult * (groin ? 3 : 1) * (slam ? DAMAGE.slamPoints : 1);

    // Bone stress: one huge hit or several medium ones break a bone.
    const fragility = part.spec.fragility;
    const stress = (this.stress.get(id) ?? 0) + Math.max(0, eff - 4);
    this.stress.set(id, stress);
    let broke = false;
    let firstBreakOfBone = false;
    // Ration breaks: at most two new fractures in any 0.3 s, so one slam reads as one event.
    this.recentBreaks = this.recentBreaks.filter((bt) => t - bt < 0.3);
    const canBreak = t - (this.lastBreak.get(id) ?? -10) > DAMAGE.breakCooldown && this.recentBreaks.length < 2;
    if (canBreak && (eff >= DAMAGE.breakAt * fragility || stress >= 40 * fragility)) {
      this.recentBreaks.push(t);
      broke = true;
      firstBreakOfBone = !this.broken.has(id);
      this.lastBreak.set(id, t);
      this.stress.set(id, 0);
      if (firstBreakOfBone) {
        this.broken.add(id);
        this.breakOrder.push(id);
      }
      points += part.spec.points * (firstBreakOfBone ? 3 : 1.2) * mult;
    }

    const tier: ImpactEvent['tier'] = broke ? 3 : strength >= 0.35 ? 2 : strength >= 0.08 ? 1 : 0;
    if (tier >= 1) {
      // Every real hit feeds the chain; breaks feed it more.
      this.chain += broke ? 2 : tier === 2 ? 1 : 0.5;
      this.chainHeat = 1;
      this.lastChainT = t;
      this.recentHits.push(t);
      this.recentHits = this.recentHits.filter((ht) => t - ht < 1);
    }
    if (obstacle.kind === 'whale' && t - this.lastWhale > 1.2) {
      this.whales++;
      this.lastWhale = t;
    }
    if (obstacle.label) this.obstaclesHit.add(obstacle.label);
    points = Math.round(points / 10) * 10;
    this.total += points;
    this.hits++;
    this.maxImpact = Math.max(this.maxImpact, speed);
    this.lastEventT = t;
    return { part, speed, strength, obstacle, point, normal, points, tier, broke, firstBreakOfBone, groin, slam, t };
  }

  /** How many real hits landed in the last second (for FULL SEND). */
  hitsLastSecond(): number {
    return this.recentHits.length;
  }

  private isGroin(part: Part, point: THREE.Vector3): boolean {
    // Bodies are world-aligned at bind with Emonad facing +Z, so in the pelvis
    // frame the groin is the front-lower region.
    const r = part.body.rotation();
    const t = part.body.translation();
    const local = point.clone().sub(new THREE.Vector3(t.x, t.y, t.z)).applyQuaternion(new THREE.Quaternion(r.x, r.y, r.z, r.w).invert());
    return local.z > 0.02 && local.y < -0.02;
  }
}

export const BONE_NAMES: Record<PartId, string> = {
  head: 'SKULL', chest: 'RIBS', spine: 'SPINE', pelvis: 'PELVIS',
  upperArmL: 'L HUMERUS', upperArmR: 'R HUMERUS', foreArmL: 'L FOREARM', foreArmR: 'R FOREARM',
  thighL: 'L FEMUR', thighR: 'R FEMUR', shinL: 'L TIBIA', shinR: 'R TIBIA',
};

/** Rank titles by final score. */
export const RANKS: [number, string, string][] = [
  [0, 'BARELY A DIP', 'buy the dip they said'],
  [150_000, 'PAPER HANDS', 'folded on the first red candle'],
  [400_000, 'DEGEN', 'leverage was a choice'],
  [900_000, 'LIQUIDATED', 'margin call answered'],
  [1_800_000, 'WHALE FOOD', 'eaten alive'],
  [3_500_000, 'TOTALLY REKT', 'every bone, every candle'],
  [7_000_000, 'REKT LEGEND', 'number went all the way down'],
];

export function rankFor(score: number): [string, string] {
  let best = RANKS[0];
  for (const r of RANKS) if (score >= r[0]) best = r;
  return [best[1], best[2]];
}
