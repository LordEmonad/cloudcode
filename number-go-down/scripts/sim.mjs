// Fast course-flow test: physics only, many flings, no rendering.
// Usage: node scripts/sim.mjs <url> [--runs "dx,dy;dx,dy"] [--seconds 60] [--trace 1]
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const url = args[0];
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const runs = opt('runs', '0,320;0,200;0,120;-120,300;120,300;0,90').split(';').map((r) => r.split(',').map(Number));
const seconds = Number(opt('seconds', '60'));
const showTrace = !!opt('trace', '');
const steer = JSON.parse(opt('steer', '[]'));

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.goto(url);
await page.waitForFunction(() => window.__game && window.__game.state === 'aim', null, { timeout: 90000 });
for (const [dx, dy] of runs) {
  await page.evaluate(() => window.__ngd.again());
  await page.evaluate(([x, y]) => window.__ngd.fling(x, y), [dx, dy]);
  const t0 = Date.now();
  const r = await page.evaluate(([s, st]) => window.__ngd.simulate(s, st), [seconds, steer]);
  const wall = ((Date.now() - t0) / 1000).toFixed(1);
  // Stalls: windows of 1.5 s where track distance advanced < 1.5 m (before landing).
  const stalls = [];
  for (let i = 0; i + 6 < r.trace.length; i++) {
    const a = r.trace[i], b = r.trace[i + 6];
    if (b.s - a.s < 1.5 && b.name !== 'fall' && (r.landedT < 0 || a.t < r.landedT)) stalls.push(`${a.t}s@${a.name}(s=${a.s})`);
  }
  const maxS = Math.max(...r.trace.map((p) => p.s));
  console.log(`fling ${dx},${dy}: ${r.state} landed=${r.landedT}s maxS=${maxS}/${r.trackLength} dmg=${r.damage} hits=${r.hits} broken=${r.broken.join('+') || '-'} well=${r.well} com=${r.com} wall=${wall}s`);
  if (stalls.length) console.log('  stalls:', [...new Set(stalls.map((s) => s.split('(')[0].replace(/^[\d.]+s@/, '')))].join(' '), '| first:', stalls.slice(0, 4).join(' '));
  if (showTrace) {
    const segTimes = {};
    for (const p of r.trace) segTimes[p.name] ??= p.t;
    console.log('  seg entry times:', JSON.stringify(segTimes));
    console.log('  trace:', r.trace.filter((_, i) => i % 4 === 0).map((p) => `${p.t}:${p.name}/${p.s}/v${p.v}`).join(' '));
  }
}
await browser.close();
