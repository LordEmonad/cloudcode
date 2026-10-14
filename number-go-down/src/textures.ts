import * as THREE from 'three';

// Procedural canvas textures, so the first load stays tiny.

function canvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!];
}

function finish(c: HTMLCanvasElement, repeat = false, srgb = true): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

/** Back wall: a price chart grid with faint candles, tiled vertically. */
export function chartGridTexture(): THREE.CanvasTexture {
  const [c, g] = canvas(512, 512);
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = 'rgba(0,0,0,0.16)';
  g.lineWidth = 2;
  for (let i = 0; i <= 512; i += 64) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(512, i); g.stroke();
  }
  g.strokeStyle = 'rgba(0,0,0,0.07)';
  g.lineWidth = 1;
  for (let i = 32; i < 512; i += 64) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(512, i); g.stroke();
  }
  // Ghost candles drifting downward.
  let y = 120;
  for (let x = 24; x < 512; x += 40) {
    const h = 30 + ((x * 37) % 70);
    y = (y + ((x * 53) % 90) - 30 + 512) % 400 + 40;
    g.fillStyle = 'rgba(0,0,0,0.13)';
    g.fillRect(x, y, 16, h);
    g.fillRect(x + 7, y - 14, 2, h + 28);
  }
  return finish(c, true);
}

/** Side walls: riveted panels with a bright seam every tile (reads speed). */
export function wallPanelTexture(): THREE.CanvasTexture {
  const [c, g] = canvas(256, 256);
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, 256, 256);
  const grad = g.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, 'rgba(0,0,0,0.25)');
  grad.addColorStop(0.5, 'rgba(0,0,0,0.0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.25)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  g.fillStyle = 'rgba(0,0,0,0.55)';
  g.fillRect(0, 0, 256, 10);
  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.fillRect(0, 10, 256, 3);
  g.fillStyle = 'rgba(0,0,0,0.35)';
  for (const x of [24, 128, 232]) {
    g.beginPath(); g.arc(x, 30, 5, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x, 226, 5, 0, Math.PI * 2); g.fill();
  }
  return finish(c, true);
}

/** Studded black leather belt for the slingshot band. */
export function studdedBeltTexture(): THREE.CanvasTexture {
  const [c, g] = canvas(512, 64);
  g.fillStyle = '#141018';
  g.fillRect(0, 0, 512, 64);
  g.strokeStyle = 'rgba(255,255,255,0.18)';
  g.setLineDash([6, 6]);
  g.lineWidth = 2;
  g.beginPath(); g.moveTo(0, 6); g.lineTo(512, 6); g.stroke();
  g.beginPath(); g.moveTo(0, 58); g.lineTo(512, 58); g.stroke();
  g.setLineDash([]);
  for (let x = 16; x < 512; x += 32) {
    // Pyramid stud: four shaded triangles.
    const cx = x, cy = 32, r = 11;
    const faces: [string, number[]][] = [
      ['#f4f4f8', [cx - r, cy - r, cx + r, cy - r]],
      ['#9a9aa6', [cx + r, cy - r, cx + r, cy + r]],
      ['#5e5e68', [cx + r, cy + r, cx - r, cy + r]],
      ['#c8c8d2', [cx - r, cy + r, cx - r, cy - r]],
    ];
    for (const [col, p] of faces) {
      g.fillStyle = col;
      g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(p[2], p[3]); g.lineTo(cx, cy); g.closePath(); g.fill();
    }
  }
  return finish(c, true);
}

/** Guitar neck: dark rosewood, frets and pearl inlays. */
export function guitarNeckTexture(): THREE.CanvasTexture {
  const [c, g] = canvas(128, 1024);
  const grad = g.createLinearGradient(0, 0, 128, 0);
  grad.addColorStop(0, '#2a1410');
  grad.addColorStop(0.5, '#3d1d15');
  grad.addColorStop(1, '#2a1410');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 1024);
  // Frets get closer together toward the body (bottom of the texture is the nut).
  let y = 24;
  let gap = 92;
  const fretYs: number[] = [];
  while (y < 1024) {
    g.fillStyle = '#d9d9e2';
    g.fillRect(0, y, 128, 5);
    fretYs.push(y);
    y += gap;
    gap *= 0.944;
  }
  g.fillStyle = '#efe8ff';
  [2, 4, 6, 8, 11].forEach((i) => {
    if (i + 1 >= fretYs.length) return;
    const my = (fretYs[i] + fretYs[i + 1]) / 2;
    if (i === 11) {
      g.beginPath(); g.arc(40, my, 9, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.arc(88, my, 9, 0, Math.PI * 2); g.fill();
    } else {
      g.beginPath(); g.arc(64, my, 10, 0, Math.PI * 2); g.fill();
    }
  });
  // Strings.
  for (let s = 0; s < 6; s++) {
    g.fillStyle = s < 3 ? 'rgba(230,230,240,0.9)' : 'rgba(210,190,140,0.9)';
    g.fillRect(14 + s * 20, 0, s < 3 ? 2 : 3, 1024);
  }
  return finish(c);
}

export interface SignOptions {
  color?: string;
  glow?: string;
  stroke?: string;
  font?: string;
  width?: number;
  height?: number;
  background?: string | null;
  border?: string | null;
}

/** Text on a transparent canvas, styled as a neon or comic sign. */
export function signTexture(text: string, opts: SignOptions = {}): THREE.CanvasTexture {
  const w = opts.width ?? 512;
  const h = opts.height ?? 128;
  const [c, g] = canvas(w, h);
  if (opts.background) {
    g.fillStyle = opts.background;
    roundRect(g, 6, 6, w - 12, h - 12, 18);
    g.fill();
  }
  if (opts.border) {
    g.strokeStyle = opts.border;
    g.lineWidth = 8;
    roundRect(g, 6, 6, w - 12, h - 12, 18);
    g.stroke();
  }
  const lines = text.split('\n');
  let size = Math.floor((h * 0.78) / lines.length);
  g.font = `${size}px ${opts.font ?? 'Bangers, Impact, sans-serif'}`;
  const widest = Math.max(...lines.map((l) => g.measureText(l).width));
  if (widest > w * 0.9) {
    size = Math.floor((size * w * 0.9) / widest);
    g.font = `${size}px ${opts.font ?? 'Bangers, Impact, sans-serif'}`;
  }
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  lines.forEach((line, i) => {
    const y = h / 2 + (i - (lines.length - 1) / 2) * size * 1.02 + size * 0.04;
    if (opts.glow) {
      g.shadowColor = opts.glow;
      g.shadowBlur = size * 0.35;
    }
    if (opts.stroke) {
      g.lineJoin = 'round';
      g.strokeStyle = opts.stroke;
      g.lineWidth = size * 0.16;
      g.strokeText(line, w / 2, y);
    }
    g.fillStyle = opts.color ?? '#ffffff';
    g.fillText(line, w / 2, y);
    g.shadowBlur = 0;
  });
  return finish(c);
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** Soft round sprite for particles and glows. */
export function softDotTexture(): THREE.CanvasTexture {
  const [c, g] = canvas(64, 64);
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.6)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return finish(c, false, false);
}

/** Four-point comic impact star. */
export function starTexture(): THREE.CanvasTexture {
  const [c, g] = canvas(128, 128);
  g.translate(64, 64);
  const spikes = 8;
  g.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? 60 : 22;
    const a = (i / (spikes * 2)) * Math.PI * 2;
    g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.closePath();
  g.fillStyle = '#ffffff';
  g.fill();
  return finish(c, false, false);
}
