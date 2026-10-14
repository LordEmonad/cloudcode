// Drives the game in headless Chromium for automated checks and screenshots.
// Usage:
//   node scripts/browse.mjs <url> --wait "<js condition>" [--shots out.png@ms,...] [--size 390x844] [--timeout ms] [--eval "<js>"]
// Prints window.__lab / window.__game (whichever exists) as JSON at the end.
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const url = args[0];
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const [w, h] = opt('size', '390x844').split('x').map(Number);
const waitFor = opt('wait', 'true');
const timeout = Number(opt('timeout', '120000'));
const shots = (opt('shots', '') || '').split(',').filter(Boolean).map((s) => {
  const [file, at] = s.split('@');
  return { file, at: Number(at ?? 0) };
});
const evalJs = opt('eval', '');

const browser = await chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log(`console.${m.type()}:`, m.text()); });
page.on('pageerror', (e) => { errors.push(e.message); console.log('pageerror:', e.message); });
await page.goto(url);
const start = Date.now();
for (const shot of shots.sort((a, b) => a.at - b.at)) {
  const delay = shot.at - (Date.now() - start);
  if (delay > 0) await page.waitForTimeout(delay);
  await page.screenshot({ path: shot.file });
  console.log('shot', shot.file, 'at', Date.now() - start, 'ms');
}
try {
  await page.waitForFunction(waitFor, null, { timeout, polling: 500 });
} catch (e) {
  console.log('wait timed out:', waitFor);
}
if (evalJs) console.log('eval:', JSON.stringify(await page.evaluate(evalJs)));
const out = await page.evaluate(() => window.__lab ?? window.__game ?? null);
console.log('result:', JSON.stringify(out));
if (errors.length) console.log('errors:', errors.length);
await browser.close();
