import { chromium } from 'playwright';
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.on('pageerror', (e) => console.log('pageerror:', e.message));
await page.goto('http://127.0.0.1:5173/');
await page.waitForFunction(() => window.__game && window.__game.state === 'aim', null, { timeout: 90000 });
await page.waitForTimeout(500);
const probe = () => page.evaluate(() => {
  const g = window.__gameObj;
  const r = g.renderer;
  r.info.autoReset = false;
  r.info.reset();
  g.post.render(0.016);
  const out = { calls: r.info.render.calls, tris: r.info.render.triangles, geos: r.info.memory.geometries, tex: r.info.memory.textures, programs: r.info.programs?.length };
  r.info.autoReset = true;
  out.colliders = g.world.colliders.len();
  return out;
});
console.log('aim', JSON.stringify(await probe()));
for (const [n, t] of [['dip', 0.3], ['whale', 0.4], ['engine', 0.4], ['fall', 0.5]]) {
  await page.evaluate(() => window.__ngd.fling(0, 300));
  await page.evaluate(([n, t]) => window.__ngd.warp(n, t), [n, t]);
  await page.waitForTimeout(700);
  console.log(n, JSON.stringify(await probe()));
}
await browser.close();
