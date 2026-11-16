import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildStatic } from '../scripts/build-static.mjs';

let outDir;
before(async () => {
  outDir = await mkdtemp(join(tmpdir(), 'mvm-delivery-'));
  await buildStatic({ outDir, siteUrl: 'https://travel.example/' });
});
after(async () => { if (outDir) await rm(outDir, { recursive: true, force: true }); });
const page = path => readFile(join(outDir, path, 'index.html'), 'utf8');
const head = html => html.split('</head>')[0];

test('every static package title identifies its destination before JavaScript', async () => {
  for (const [lang, destination] of [['th', 'หลวงพระบาง'], ['lo', 'ຫຼວງພະບາງ'], ['en', 'Luang Prabang'], ['zh', '琅勃拉邦']]) {
    const html = head(await page(`${lang}/package/luang-prabang-discovery`));
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    const description = html.match(/name="description" content="([^"]+)"/)?.[1];
    assert.ok(title?.includes(destination), `${lang}: package title identifies the destination`);
    assert.ok(description?.includes(destination), `${lang}: description identifies the destination`);
    assert.ok(!description.startsWith('·'), `${lang}: no missing destination before trip duration`);
    assert.ok(html.includes(`property="og:title" content="${title}"`));
  }
});

test('direct place first paint requests the place photo instead of the province hero', async () => {
  const html = await page('en/province/luang-prabang/kuang-si');
  assert.match(head(html), /rel="preload" as="image"[^>]+href="assets\/images\/photos\/kuang-si-960\.webp"/);
  assert.doesNotMatch(head(html), /phousi-\d+\.webp/);
  const shell = html.match(/<template id="page-shell">([\s\S]*?)<\/template>/)?.[1] || '';
  assert.match(shell, /src="assets\/images\/photos\/kuang-si-960\.webp"/);
  assert.doesNotMatch(shell, /phousi-\d+\.webp/);
  assert.equal([...shell.matchAll(/<img\b[^>]*\bsrc="/g)].length, 1, 'only requested image has a source before app boot');
});

test('font preloads follow the script used by the initial language', async () => {
  const th = head(await page('th'));
  assert.match(th, /rel="preload"[^>]+href="assets\/fonts\/noto-sans-thai-thai-400\.woff2"/);
  const en = head(await page('en'));
  assert.match(en, /rel="preload"[^>]+href="assets\/fonts\/noto-sans-thai-latin-400\.woff2"/);
  assert.doesNotMatch(en, /rel="preload"[^>]+href="assets\/fonts\/[^"]*-thai-\d+\.woff2"/);
  const lo = head(await page('lo'));
  assert.match(lo, /rel="preload"[^>]+href="assets\/fonts\/noto-sans-lao-400\.woff2"/);
  assert.doesNotMatch(lo, /rel="preload"[^>]+href="assets\/fonts\/[^"]*-thai-\d+\.woff2"/);
  assert.doesNotMatch(head(await page('zh')), /rel="preload"[^>]+as="font"/);
});

test('production HTML loads content-addressed scripts and CSS with existing dependencies', async () => {
  const html = head(await page('en'));
  const script = html.match(/<script type="module" src="([^"]+)"/)?.[1];
  assert.match(script || '', /^assets\/js\/app-[a-zA-Z0-9]+\.js$/);
  const css = html.match(/<link rel="stylesheet" href="([^"]+)"/)?.[1];
  assert.match(css || '', /^assets\/css\/site-[a-f0-9]+\.css$/);
  for (const path of [script, css, ...[...html.matchAll(/rel="modulepreload" href="([^"]+)"/g)].map(match => match[1])]) {
    assert.ok((await readFile(join(outDir, path))).length > 0, `${path}: emitted resource exists`);
  }
  assert.ok((await readFile(join(outDir, 'content.js'), 'utf8')).includes('export'), 'public content import remains available');
});

test('generated delivery contains no unreferenced copied source stylesheets', async () => {
  const files = await readdir(outDir);
  assert.deepEqual(files.filter(file => file.endsWith('.css')), []);
});

test('precompressed release assets decode to the original resource bytes', async () => {
  const { gunzipSync, brotliDecompressSync } = await import('node:zlib');
  const html = await page('en');
  const paths = ['en/index.html', head(html).match(/<script type="module" src="([^"]+)"/)?.[1], head(html).match(/<link rel="stylesheet" href="([^"]+)"/)?.[1]];
  for (const path of paths) {
    const raw = await readFile(join(outDir, path));
    assert.deepEqual(gunzipSync(await readFile(join(outDir, `${path}.gz`))), raw);
    assert.deepEqual(brotliDecompressSync(await readFile(join(outDir, `${path}.br`))), raw);
  }
});


test('release CSP admits its exact boot scripts without permitting inline script attributes', async () => {
  const { createHash } = await import('node:crypto');
  const headers = await readFile(join(outDir, '_headers'), 'utf8');
  const policy = headers.match(/Content-Security-Policy: (.*)/)?.[1];
  assert.ok(policy, 'a release policy is emitted');
  assert.doesNotMatch(policy.match(/script-src ([^;]+)/)?.[1] || '', /unsafe-inline/);
  for (const route of ['en', 'lo/province/luang-prabang/kuang-si', 'zh/package/luang-prabang-discovery']) {
    const html = await page(route);
    assert.doesNotMatch(html, /\sonerror=/);
    for (const [, attrs, code] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (/\bsrc=/.test(attrs)) continue;
      const hash = createHash('sha256').update(code).digest('base64');
      assert.ok(policy.includes(`'sha256-${hash}'`), `${route}: boot script admitted`);
    }
  }
  const blocks = headers.split(/\n(?=\/)/);
  assert.ok(blocks.find(block => block.startsWith('/assets/js/*\n'))?.includes('immutable'));
  assert.ok(!blocks.find(block => block.startsWith('/assets/images/*\n'))?.includes('immutable'), 'mutable image names must revalidate');
});

test('initial locale pages preload only their own content-addressed catalog', async () => {
  for (const lang of ['lo', 'zh']) {
    const html = head(await page(lang));
    const preloads = [...html.matchAll(/rel="modulepreload" href="([^"]+)"/g)].map(match => match[1]);
    assert.ok(preloads.some(path => new RegExp(`^assets/js/${lang}-[a-zA-Z0-9]+\\.js$`).test(path)), `${lang}: hashed catalog preloaded`);
    assert.ok(!preloads.some(path => new RegExp(`^assets/js/${lang === 'lo' ? 'zh' : 'lo'}-`).test(path)), `${lang}: other language is not requested`);
    assert.ok(!preloads.some(path => path.startsWith('locales/')), 'immutable app graph does not depend on mutable catalog loaders');
  }
});
