import * as THREE from 'three';
import type { Ragdoll } from './ragdoll';

// Face timing (report): Surprise ~150 ms before a predicted impact, a
// squeeze-blink on contact, then Sorrow. Hair: a damped spring fed by the
// head's motion drives the four sway morphs.

type Expr = 'Blink' | 'Joy' | 'Angry' | 'Sorrow' | 'Surprise';
export type Mood = 'smug' | 'tense' | 'falling' | 'dazed';

export class Face {
  private body: THREE.SkinnedMesh;
  private hair: THREE.Mesh | null;
  private idx = new Map<string, number>();
  private hairIdx = new Map<string, number>();
  private target: Record<Expr, number> = { Blink: 0, Joy: 0, Angry: 0, Sorrow: 0, Surprise: 0 };
  private value: Record<Expr, number> = { Blink: 0, Joy: 0, Angry: 0, Sorrow: 0, Surprise: 0 };
  mood: Mood = 'smug';
  private squeezeUntil = 0;
  private hurtUntil = 0;
  private braceUntil = 0;
  private nextBlink = 1.5;
  private t = 0;
  private hairPos = new THREE.Vector3();
  private hairVel = new THREE.Vector3();
  private prevHeadVel = new THREE.Vector3();
  private kick = new THREE.Vector3();

  constructor(private ragdoll: Ragdoll) {
    this.body = ragdoll.body;
    this.hair = ragdoll.hair;
    const dict = this.body.morphTargetDictionary ?? {};
    for (const [k, v] of Object.entries(dict)) this.idx.set(k, v);
    const hd = this.hair?.morphTargetDictionary ?? {};
    for (const [k, v] of Object.entries(hd)) this.hairIdx.set(k, v);
  }

  reset(): void {
    this.mood = 'smug';
    this.squeezeUntil = 0;
    this.hurtUntil = 0;
    this.braceUntil = 0;
    this.hairPos.set(0, 0, 0);
    this.hairVel.set(0, 0, 0);
  }

  brace(): void {
    this.braceUntil = this.t + 0.25;
  }

  impact(strength: number): void {
    this.squeezeUntil = this.t + 0.12 + strength * 0.12;
    this.kick.set((Math.random() - 0.5) * 2, -1, (Math.random() - 0.5)).multiplyScalar(strength * 3);
  }

  hurt(): void {
    this.hurtUntil = this.t + 1.1;
    this.impact(1);
  }

  update(dt: number, alpha: number): void {
    this.t += dt;
    const tg = this.target;
    tg.Blink = 0; tg.Joy = 0; tg.Angry = 0; tg.Sorrow = 0; tg.Surprise = 0;
    switch (this.mood) {
      case 'smug': tg.Joy = 0.55; break;
      case 'tense': tg.Surprise = 0.55; tg.Joy = 0.15; break;
      case 'falling': tg.Surprise = 0.7; break;
      case 'dazed': tg.Sorrow = 0.85; tg.Blink = 0.35; break;
    }
    if (this.t < this.braceUntil) { tg.Surprise = 1; tg.Joy = 0; }
    if (this.t < this.hurtUntil) { tg.Sorrow = 1; tg.Surprise = 0.2; tg.Joy = 0; }
    if (this.t < this.squeezeUntil) { tg.Blink = 1; tg.Angry = 0.6; tg.Surprise = 0; }
    // Idle blinks.
    if (this.t > this.nextBlink) {
      if (this.t < this.nextBlink + 0.12) tg.Blink = Math.max(tg.Blink, 1);
      else this.nextBlink = this.t + 1.8 + Math.random() * 2.5;
    }
    const inf = this.body.morphTargetInfluences;
    if (inf) {
      for (const k of Object.keys(tg) as Expr[]) {
        const rate = k === 'Blink' ? 40 : 12;
        this.value[k] += (tg[k] - this.value[k]) * (1 - Math.exp(-dt * rate));
        const i = this.idx.get(k);
        if (i !== undefined) inf[i] = this.value[k];
      }
    }
    this.updateHair(dt, alpha);
  }

  private updateHair(dt: number, alpha: number): void {
    if (!this.hair?.morphTargetInfluences || dt <= 0) return;
    const head = this.ragdoll.get('head');
    const v = head.body.linvel();
    const vel = new THREE.Vector3(v.x, v.y, v.z);
    const acc = vel.clone().sub(this.prevHeadVel).divideScalar(Math.max(dt, 1e-3));
    this.prevHeadVel.copy(vel);
    const rot = this.ragdoll.renderRot(head, alpha).invert();
    // The hair lags behind: inertial force opposite the head's acceleration, in head space.
    const local = acc.clamp(new THREE.Vector3(-80, -80, -80), new THREE.Vector3(80, 80, 80)).applyQuaternion(rot).multiplyScalar(-0.012);
    local.add(this.kick);
    this.kick.multiplyScalar(Math.exp(-dt * 10));
    const k = 120;
    const c = 9;
    const force = local.multiplyScalar(k).addScaledVector(this.hairPos, -k).addScaledVector(this.hairVel, -c);
    this.hairVel.addScaledVector(force, dt);
    this.hairPos.addScaledVector(this.hairVel, dt);
    this.hairPos.clampScalar(-1.2, 1.2);
    const inf = this.hair.morphTargetInfluences;
    const set = (name: string, value: number) => {
      const i = this.hairIdx.get(name);
      if (i !== undefined) inf[i] = THREE.MathUtils.clamp(value, 0, 1);
    };
    // Head-local X is Emonad's left, so a positive lag swings the hair left.
    set('Sway_Left', this.hairPos.x);
    set('Sway_Right', -this.hairPos.x);
    set('Sway_Forward', Math.abs(this.hairPos.z) * 0.8);
    set('Bounce', Math.abs(this.hairPos.y));
  }
}
