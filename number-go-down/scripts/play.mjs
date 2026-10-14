// Plays one scripted run in headless Chromium and screenshots it.
// Usage: node scripts/play.mjs <url> <outPrefix> [--drag dx,dy] [--every ms] [--count n] [--steer "t:x,t:x"]
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const [url, prefix] = args;
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const [dx, dy] = opt('drag', '0,-320').split(',').map(Number);
const every = Number(opt('every', '700'));
const count = Number(opt('count', '12'));
const steers = (opt('steer', '') || '').split(',').filter(Boolean).map((s) => s.split(':').map(Number));
const [w, h] = opt('size', '390x844').split('x').map(Number);

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
page.on('pageerror', (e) => console.log('pageerror:', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.log('console.error:', m.text()); });
await page.goto(url);
await page.waitForFunction(() => window.__game && window.__game.state === 'aim', null, { timeout: 90000 });
await page.waitForTimeout(800);
if (opt('aimshot', '')) {
  await page.evaluate(([x, y]) => window.__ngd.aim(x, y), [dx, dy]);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${prefix}_aim.png` });
}
await page.evaluate(([x, y]) => window.__ngd.fling(x, y), [dx, dy]);
if (opt('warp', '')) {
  const [name, t] = opt('warp', '').split(':');
  await page.waitForTimeout(300);
  await page.evaluate(([n, f]) => window.__ngd.warp(n, Number(f || 0)), [name, t]);
}
const start = Date.now();
const log = [];
for (let i = 0; i < count; i++) {
  const target = (i + 1) * every;
  for (const [t, x] of steers) {
    if (t <= target && t > target - every) await page.evaluate((v) => window.__ngd.steer(v), x);
  }
  const wait = target - (Date.now() - start);
  if (wait > 0) await page.waitForTimeout(wait);
  const file = `${prefix}_${String(i).padStart(2, '0')}.png`;
  await page.screenshot({ path: file });
  const s = await page.evaluate(() => window.__game);
  log.push(`${file.split('/').pop()} t=${s.simT} y=${s.y} state=${s.state} dmg=${s.damage} broken=${s.broken.length} ts=${s.timeScale} xray=${s.xray} fps=${s.fps}`);
}
console.log(log.join('\n'));
const final = await page.evaluate(() => window.__game);
console.log('final:', JSON.stringify(final));
await browser.close();
