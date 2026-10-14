// Turns dist/index.html into a claude.ai artifact page: no doctype/html/head/
// body wrapper (the host adds one), CSS inlined, JS and the model kept as
// supporting files at the same relative paths.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist-artifact');
const out = path.resolve(process.argv[2] ?? 'dist-artifact-page');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const cssHref = html.match(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"[^>]*>/)?.[1];
const jsSrc = html.match(/<script type="module"[^>]*src="\.\/(assets\/[^"]+\.js)"[^>]*><\/script>/)?.[1];
const body = html.match(/<body>([\s\S]*?)<\/body>/)?.[1] ?? '';
if (!cssHref || !jsSrc) throw new Error('Could not find the built CSS or JS in dist/index.html');
const css = fs.readFileSync(path.join(dist, cssHref), 'utf8');
const bodyWithoutScripts = body.replace(/<script[\s\S]*?<\/script>/g, '').trim();

const page = `<title>Number Go Down</title>
<meta name="theme-color" content="#0b0410">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bangers&family=JetBrains+Mono:wght@700;800&display=swap">
<style>
:root { color-scheme: dark; }
html, body { height: 100%; }
${css}
</style>
${bodyWithoutScripts}
<script type="module" src="./${jsSrc}"></script>
`;

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'index.html'), page);
const files = {};
for (const dir of ['assets', 'models']) {
  for (const f of fs.readdirSync(path.join(dist, dir))) {
    if (f.endsWith('.css')) continue;
    if (f.endsWith('.glb')) {
      // Artifacts do not serve .glb; ship it as base64 text instead.
      const b64 = fs.readFileSync(path.join(dist, dir, f)).toString('base64');
      fs.mkdirSync(path.join(out, dir), { recursive: true });
      fs.writeFileSync(path.join(out, dir, `${f}.txt`), b64);
      files[`${dir}/${f}.txt`] = path.join(out, dir, `${f}.txt`);
      continue;
    }
    fs.mkdirSync(path.join(out, dir), { recursive: true });
    fs.copyFileSync(path.join(dist, dir, f), path.join(out, dir, f));
    files[`${dir}/${f}`] = path.join(out, dir, f);
  }
}
console.log(JSON.stringify(files, null, 2));
