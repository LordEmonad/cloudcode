// Procedural audio: every sound is synthesised, so there is nothing to download.
// Report: layered transient + body + tail per hit, round-robin variation, one
// unmistakable BREAK sound, slow-mo = low-pass + pitch-down + heartbeat, and a
// Balatro-style 1.6% pitch climb per scoring event in a chain.

type Ctx = AudioContext;

const NOTE = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

export class GameAudio {
  ctx: Ctx | null = null;
  private master!: GainNode;
  private sfx!: GainNode;
  private music!: GainNode;
  private lowpass!: BiquadFilterNode;
  private reverbSend!: GainNode;
  private noise!: AudioBuffer;
  private plucks = new Map<number, AudioBuffer>();
  private dist!: WaveShaperNode;
  private distMusic!: WaveShaperNode;
  private wind: { gain: GainNode; filter: BiquadFilterNode } | null = null;
  private creak: { gain: GainNode; osc: OscillatorNode; filter: BiquadFilterNode } | null = null;
  private musicOn = false;
  private musicIntensity = 0;
  private nextBeat = 0;
  private beat = 0;
  private breakCount = 0;
  private chain = 0;
  private lastChainT = 0;
  enabled = true;
  musicEnabled = true;
  haptics = true;

  /** Must run inside a real touch handler on iOS. */
  unlock(): void {
    if (this.ctx) {
      if (this.ctx.state !== 'running') void this.ctx.resume();
      return;
    }
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    // Play through the iPhone silent switch (Safari 16.4+).
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    try { if (nav.audioSession) nav.audioSession.type = 'playback'; } catch { /* unsupported */ }
    const ctx = new AC({ latencyHint: 'interactive' });
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 8;
    comp.ratio.value = 6;
    comp.attack.value = 0.002;
    comp.release.value = 0.18;
    this.lowpass = ctx.createBiquadFilter();
    this.lowpass.type = 'lowpass';
    this.lowpass.frequency.value = 20000;
    this.lowpass.Q.value = 0.8;
    this.master.connect(this.lowpass).connect(comp).connect(ctx.destination);
    this.sfx = ctx.createGain();
    this.sfx.connect(this.master);
    this.music = ctx.createGain();
    this.music.gain.value = 0.42;
    this.music.connect(this.master);
    // Small synthetic room for slow-mo swells.
    const reverb = ctx.createConvolver();
    reverb.buffer = this.impulse(1.6);
    this.reverbSend = ctx.createGain();
    this.reverbSend.gain.value = 0.08;
    this.reverbSend.connect(reverb).connect(this.master);
    this.sfx.connect(this.reverbSend);

    const len = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    this.dist = ctx.createWaveShaper();
    this.dist.curve = distortionCurve(60);
    this.dist.oversample = '2x';
    const guitarTone = ctx.createBiquadFilter();
    guitarTone.type = 'lowpass';
    guitarTone.frequency.value = 3200;
    const guitarGain = ctx.createGain();
    guitarGain.gain.value = 0.32;
    this.dist.connect(guitarTone).connect(guitarGain).connect(this.sfx);
    // A second amp for the music bus so the music toggle mutes its guitar too.
    this.distMusic = ctx.createWaveShaper();
    this.distMusic.curve = distortionCurve(45);
    const musicTone = ctx.createBiquadFilter();
    musicTone.type = 'lowpass';
    musicTone.frequency.value = 2600;
    const musicGuitar = ctx.createGain();
    musicGuitar.gain.value = 0.22;
    this.distMusic.connect(musicTone).connect(musicGuitar).connect(this.music);

    this.startWind();
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      // iOS can leave the context "interrupted"; suspend and resume to recover.
      if (document.hidden) void this.ctx.suspend();
      else void this.ctx.resume();
    });
  }

  private impulse(seconds: number): AudioBuffer {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    return buf;
  }

  /** Karplus-Strong plucked string, cached per note. */
  private pluck(midi: number, muted = false): AudioBuffer {
    const key = midi + (muted ? 1000 : 0);
    const cached = this.plucks.get(key);
    if (cached) return cached;
    const ctx = this.ctx!;
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * (muted ? 0.18 : 1.4));
    const buf = ctx.createBuffer(1, len, sr);
    const out = buf.getChannelData(0);
    const period = Math.max(2, Math.round(sr / NOTE(midi)));
    const ring = new Float32Array(period);
    for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1;
    const decay = muted ? 0.94 : 0.996;
    let idx = 0;
    for (let i = 0; i < len; i++) {
      const next = (idx + 1) % period;
      const v = (ring[idx] + ring[next]) * 0.5 * decay;
      out[i] = ring[idx];
      ring[idx] = v;
      idx = next;
    }
    this.plucks.set(key, buf);
    return buf;
  }

  private noiseBurst(t: number, dur: number, type: BiquadFilterType, freq: number, q: number, gain: number, dest: AudioNode = this.sfx, rate = 1): void {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.playbackRate.value = rate;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(dest);
    src.start(t, Math.random() * 1.5);
    src.stop(t + dur + 0.05);
  }

  private tone(t: number, type: OscillatorType, f0: number, f1: number, dur: number, gain: number, dest: AudioNode = this.sfx): void {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  private chord(t: number, roots: number[], gain: number, muted = false, amp: AudioNode = this.dist): void {
    const ctx = this.ctx!;
    for (const m of roots) {
      const src = ctx.createBufferSource();
      src.buffer = this.pluck(m, muted);
      src.detune.value = (Math.random() - 0.5) * 8;
      const g = ctx.createGain();
      g.gain.value = gain;
      src.connect(g).connect(amp);
      src.start(t + Math.random() * 0.012);
    }
  }

  private now(): number {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  private ready(): boolean {
    return !!this.ctx && this.enabled && this.ctx.state === 'running';
  }

  vibrate(pattern: number | number[]): void {
    if (!this.haptics) return;
    // Android only; iOS Safari has no Vibration API (and patched the switch trick in 26.5).
    try { navigator.vibrate?.(pattern); } catch { /* ignore */ }
  }

  // ---------------------------------------------------------------- one-shots

  /** A body hitting something; strength ~0..2. */
  hit(strength: number, soft: boolean): void {
    if (!this.ready()) return;
    const t = this.now();
    const s = Math.min(1.6, strength);
    // Body thump.
    this.tone(t, 'sine', 140 + Math.random() * 40, 48, 0.12 + s * 0.12, 0.35 + s * 0.4);
    this.noiseBurst(t, 0.08 + s * 0.1, 'lowpass', 500 + s * 600, 0.7, 0.25 + s * 0.35);
    if (!soft && s > 0.3) {
      // Cartoon bonk on bigger hits: woodblock-ish pitched click.
      const f = 520 + Math.random() * 380;
      this.tone(t, 'triangle', f, f * 0.55, 0.09, 0.22 + s * 0.12);
    }
    this.vibrate(s > 0.7 ? 32 : s > 0.35 ? 22 : 12);
  }

  /** The signature break: crack + crunch + a descending power-chord stab. */
  crack(size: number): void {
    if (!this.ready()) return;
    const t = this.now();
    // Dry snap: a handful of sharp transients (celery, not squelch).
    const snaps = 3 + Math.floor(Math.random() * 3);
    for (let i = 0; i < snaps; i++) {
      this.noiseBurst(t + i * (0.006 + Math.random() * 0.01), 0.025 + Math.random() * 0.02, 'bandpass', 2400 + Math.random() * 2600, 2.5, 0.8);
    }
    this.noiseBurst(t, 0.16, 'bandpass', 1200 + Math.random() * 500, 1.2, 0.5);
    this.tone(t, 'sine', 110, 40, 0.25 + size * 0.03, 0.7);
    // Number go down: each break steps the chord down the progression.
    const prog = [50, 46, 41, 48, 45, 43, 38];
    const root = prog[this.breakCount % prog.length];
    this.breakCount++;
    this.chord(t + 0.02, [root, root + 7, root + 12], 0.9);
    this.vibrate([35, 40, 15]);
  }

  /** Balatro: each scoring tick in a chain plays 1.6% higher. */
  scoreTick(t0: number): void {
    if (!this.ready()) return;
    if (t0 - this.lastChainT > 1.2) this.chain = 0;
    this.lastChainT = t0;
    const t = this.now();
    const f = 880 * Math.pow(1.016, this.chain++);
    this.tone(t, 'square', f, f, 0.05, 0.05);
  }

  launch(power: number): void {
    if (!this.ready()) return;
    const t = this.now();
    // Belt twang: open power chord plucked hard.
    this.chord(t, [40, 47, 52], 0.7 + power * 0.3);
    this.noiseBurst(t, 0.5, 'bandpass', 900, 0.8, 0.4 + power * 0.4, this.sfx, 1.3);
    this.tone(t, 'sawtooth', 220, 70, 0.22, 0.12);
    this.stopCreak();
    this.vibrate(14);
  }

  stretch(amount: number): void {
    if (!this.ready()) return;
    const ctx = this.ctx!;
    if (!this.creak) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 6;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      osc.connect(filter).connect(gain).connect(this.sfx);
      osc.start();
      this.creak = { gain, osc, filter };
    }
    const t = this.now();
    this.creak.osc.frequency.setTargetAtTime(45 + amount * 70, t, 0.05);
    this.creak.filter.frequency.setTargetAtTime(400 + amount * 900, t, 0.05);
    this.creak.gain.gain.setTargetAtTime(amount > 0.02 ? 0.035 + amount * 0.05 : 0, t, 0.06);
  }

  stopCreak(): void {
    if (!this.creak || !this.ctx) return;
    this.creak.gain.gain.setTargetAtTime(0, this.now(), 0.03);
  }

  gate(mult: number): void {
    if (!this.ready()) return;
    const t = this.now();
    const notes = mult >= 5 ? [72, 76, 79, 84, 88] : [72, 76, 79, 84];
    notes.forEach((m, i) => this.tone(t + i * 0.055, 'square', NOTE(m), NOTE(m), 0.12, 0.08));
    this.vibrate(18);
  }

  boost(): void {
    if (!this.ready()) return;
    const t = this.now();
    this.tone(t, 'sawtooth', 900, 60, 0.6, 0.18);
    this.noiseBurst(t, 0.7, 'highpass', 1200, 0.7, 0.35, this.sfx, 0.7);
  }

  whale(): void {
    if (!this.ready()) return;
    const t = this.now();
    this.tone(t, 'sine', 90, 42, 0.5, 0.8);
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(260, t + 0.05);
    o.frequency.exponentialRampToValueAtTime(520, t + 0.25);
    o.frequency.exponentialRampToValueAtTime(330, t + 0.5);
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 18;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 22;
    lfo.connect(lfoGain).connect(o.frequency);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.25, t + 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
    o.connect(g).connect(this.sfx);
    o.start(t); lfo.start(t);
    o.stop(t + 0.65); lfo.stop(t + 0.65);
  }

  shatter(): void {
    if (!this.ready()) return;
    const t = this.now();
    for (let i = 0; i < 14; i++) {
      this.noiseBurst(t + Math.random() * 0.25, 0.04 + Math.random() * 0.08, 'bandpass', 3000 + Math.random() * 5000, 4, 0.35);
    }
    this.tone(t, 'sine', 160, 50, 0.3, 0.5);
  }

  crater(): void {
    if (!this.ready()) return;
    const t = this.now();
    this.tone(t, 'sine', 70, 28, 1.4, 1.0);
    this.noiseBurst(t, 1.2, 'lowpass', 900, 0.6, 0.9);
    const root = 38;
    this.chord(t + 0.05, [root, root + 7, root + 12, root + 19], 1);
    this.vibrate([60, 40, 90]);
  }

  ui(): void {
    if (!this.ready()) return;
    const t = this.now();
    this.tone(t, 'square', 660, 990, 0.06, 0.06);
  }

  // ---------------------------------------------------------------- continuous

  private startWind(): void {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 0.6;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(filter).connect(gain).connect(this.master);
    src.start();
    this.wind = { gain, filter };
  }

  /** Called every frame. speed in m/s, slowmo 0..1 (1 = fully slowed). */
  update(speed: number, slowmo: number, flying: boolean): void {
    if (!this.ctx || this.ctx.state !== 'running') return;
    const t = this.now();
    if (this.wind) {
      const w = flying ? Math.min(1, speed / 30) : 0;
      this.wind.gain.gain.setTargetAtTime(this.enabled ? w * w * 0.32 : 0, t, 0.08);
      this.wind.filter.frequency.setTargetAtTime(300 + w * 1600, t, 0.1);
    }
    // Slow-mo: sound like a slowed recording (low-pass toward ~800 Hz, more room).
    const lp = 20000 * Math.pow(800 / 20000, slowmo);
    this.lowpass.frequency.setTargetAtTime(lp, t, 0.04);
    this.reverbSend.gain.setTargetAtTime(0.08 + slowmo * 0.35, t, 0.05);
    this.musicIntensity += ((flying ? 1 : 0.35) - this.musicIntensity) * 0.02;
    this.music.gain.setTargetAtTime(this.musicEnabled && this.enabled ? 0.42 : 0, t, 0.1);
    this.sfx.gain.setTargetAtTime(this.enabled ? 1 : 0, t, 0.05);
    this.scheduleMusic();
  }

  heartbeat(): void {
    if (!this.ready()) return;
    const t = this.now();
    this.tone(t, 'sine', 70, 40, 0.14, 0.7);
    this.tone(t + 0.22, 'sine', 62, 38, 0.16, 0.55);
  }

  swell(): void {
    if (!this.ready()) return;
    const t = this.now();
    // Reverse swell into the hit.
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(2400, t + 0.35);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.4, t + 0.33);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    src.connect(f).connect(g).connect(this.sfx);
    src.start(t);
    src.stop(t + 0.45);
  }

  // ---------------------------------------------------------------- music

  startMusic(): void {
    if (!this.ctx) return;
    this.musicOn = true;
    this.nextBeat = Math.max(this.nextBeat, this.now() + 0.05);
  }

  stopMusic(): void {
    this.musicOn = false;
  }

  /** Pop-punk loop at 168 BPM: i-VI-III-VII power chords, kick/snare/hats, bass. */
  private scheduleMusic(): void {
    if (!this.musicOn || !this.ctx) return;
    const eighth = 60 / 168 / 2;
    const prog = [50, 46, 41, 48];
    while (this.nextBeat < this.now() + 0.15) {
      const t = this.nextBeat;
      const step = this.beat % 8;
      const bar = Math.floor(this.beat / 8) % prog.length;
      const root = prog[bar];
      const full = this.musicIntensity > 0.6;
      // Palm-muted eighths, open accent on the downbeat.
      this.chord(t, [root, root + 7], step === 0 ? 0.55 : 0.35, step !== 0, this.distMusic);
      // Bass.
      this.tone(t, 'sawtooth', NOTE(root - 12), NOTE(root - 12), eighth * 0.9, 0.06, this.music);
      if (full) {
        if (step === 0 || step === 3 || step === 4) this.tone(t, 'sine', 120, 42, 0.16, 0.6, this.music);
        if (step === 2 || step === 6) this.noiseBurst(t, 0.14, 'bandpass', 1800, 0.8, 0.45, this.music);
        this.noiseBurst(t, 0.03, 'highpass', 7000, 0.7, step % 2 ? 0.08 : 0.14, this.music);
      } else if (step === 0) {
        this.noiseBurst(t, 0.03, 'highpass', 7000, 0.7, 0.06, this.music);
      }
      this.nextBeat += eighth;
      this.beat++;
    }
  }

  resetRun(): void {
    this.breakCount = 0;
    this.chain = 0;
  }
}

function distortionCurve(k: number): Float32Array<ArrayBuffer> {
  const n = 1024;
  const curve = new Float32Array(new ArrayBuffer(n * 4));
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}
