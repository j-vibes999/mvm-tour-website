import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

let browser, server, base;
const root = resolve('build');
before(async () => {
  server = createServer(async (req, res) => {
    try {
      let path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://local').pathname));
      if (!path.startsWith(root + '/') && path !== root) throw Error();
      if ((await stat(path)).isDirectory()) path += '/index.html';
      const data = await readFile(path);
      res.writeHead(200, { 'Content-Type': ({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.woff2': 'font/woff2' })[extname(path)] || 'application/octet-stream' });
      res.end(data);
    } catch { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
});
after(async () => { await browser?.close(); await new Promise(r => server.close(r)); });
async function session(options = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', ...options });
  const page = await ctx.newPage();
  page.setDefaultTimeout(5000);
  return { ctx, page, go: async path => { await page.goto(base + path); await page.waitForFunction(() => window.__mvmReady); } };
}
async function choose(page, lang) {
  await page.locator('[data-language-toggle]').click();
  await page.locator(`[data-language-option][data-lang="${lang}"]`).click();
}

// A delayed earlier choice must never replace a more recent choice, even the current language.
for (const latest of ['en', 'th']) test(`latest language ${latest} survives an earlier delayed Lao choice`, async () => {
  const { ctx, page, go } = await session();
  let release;
  const held = new Promise(r => { release = r; });
  let started;
  const loading = new Promise(r => { started = r; });
  try {
    await ctx.route('**/assets/js/lo-*.js', async route => { started(); await held; await route.continue(); });
    await go('/en/');
    await choose(page, 'lo');
    await loading;
    await choose(page, latest);
    release();
    await page.waitForFunction(async () => Object.keys((await import('/i18n.js')).translationCatalog).length > 0);
    await page.waitForTimeout(120);
    assert.equal(await page.locator('html').getAttribute('lang'), latest);
    assert.equal(new URL(page.url()).pathname, `/${latest}/`);
    assert.equal(await page.evaluate(() => localStorage.getItem('mvm-language')), latest);
    assert.equal(await page.locator('[data-language-toggle][aria-busy]').count(), 0);
  } finally { release(); await ctx.close(); }
});

for (const lang of ['lo', 'zh']) test(`direct ${lang} pages fetch only their language catalogue and can switch immediately`, async () => {
  const { ctx, page, go } = await session();
  const catalogRequests = [];
  page.on('request', req => { if (/\/assets\/js\/(?:lo|zh)-[a-zA-Z0-9]+\.js(?:\?|$)/.test(req.url())) catalogRequests.push(new URL(req.url()).pathname); });
  try {
    await go(`/${lang}/`);
    const other = lang === 'lo' ? 'zh' : 'lo';
    assert.ok(catalogRequests.some(path => new RegExp(`/assets/js/${lang}-[a-zA-Z0-9]+\\.js$`).test(path)), 'the current language loads');
    assert.ok(!catalogRequests.some(path => new RegExp(`/assets/js/${other}-[a-zA-Z0-9]+\\.js$`).test(path)), 'the other language stays deferred');
    assert.ok(!catalogRequests.some(path => path.endsWith('/locales/all.js')), 'the paired catalogue stays off the browser path');
    await choose(page, other);
    await page.waitForFunction(expected => document.documentElement.lang === expected, other === 'zh' ? 'zh-Hans' : 'lo');
    assert.equal(new URL(page.url()).pathname, `/${other}/`);
    await choose(page, lang);
    await page.waitForFunction(expected => document.documentElement.lang === expected, lang === 'zh' ? 'zh-Hans' : 'lo');
    assert.equal(new URL(page.url()).pathname, `/${lang}/`);
  } finally { await ctx.close(); }
});

// The name index must work without downloading the descriptive translation catalog.
test('cross-language destination search works before the language menu is opened', async () => {
  const { ctx, page, go } = await session();
  const catalogRequests = [];
  page.on('request', req => { if (/\/assets\/js\/(?:lo|zh)-[a-zA-Z0-9]+\.js(?:\?|$)/.test(req.url())) catalogRequests.push(req.url()); });
  try {
    await go('/en/explore/');
    for (const query of ['万荣', 'ວັງວຽງ', 'วังเวียง', 'Vang Vieng']) {
      await page.locator('#destination-search').fill(query);
      await page.waitForFunction(q=>new URL(location.href).searchParams.get('q')===q,query);
      assert.ok(await page.locator('#search-results a[href="/en/province/vientiane-province/vang-vieng/"]').count() > 0, query);
    }
    assert.deepEqual(catalogRequests, []);
  } finally { await ctx.close(); }
});

// Failure removes the early interactive shell and leaves one readable native-link fallback.
test('module startup failure leaves one heading and no dead shell controls', async () => {
  const { ctx, page } = await session();
  try {
    await ctx.route('**/assets/js/app-*.js', route => route.abort());
    await page.goto(base + '/en/');
    await page.waitForFunction(() => !document.documentElement.classList.contains('js'));
    assert.equal(await page.locator('h1:visible').count(), 1);
    assert.equal(await page.locator('button:visible').count(), 0);
    const destination = page.locator('main a[href="/en/province/luang-prabang/"]').first();
    await destination.click();
    await page.waitForURL('**/en/province/luang-prabang/');
    assert.equal(await page.locator('h1:visible').count(), 1);
  } finally { await ctx.close(); }
});

async function interiorPoint(path) {
  return path.evaluate(path => {
    const b = path.getBBox(), m = path.getScreenCTM(), points = [];
    for (let x = 1; x < 10; x++) for (let y = 1; y < 10; y++) points.push({ x: b.x + b.width * x / 10, y: b.y + b.height * y / 10, distance: (x - 5) ** 2 + (y - 5) ** 2 });
    for (const p of points.sort((a, b) => a.distance - b.distance)) if (path.isPointInFill(new DOMPoint(p.x, p.y))) {
      const q = new DOMPoint(p.x, p.y).matrixTransform(m);
      if (q.y > 90 && q.y < innerHeight - 90 && document.elementFromPoint(q.x, q.y)?.closest('[data-province]') === path.parentElement) return { x: q.x, y: q.y };
    }
    return null;
  });
}

for (const width of [390, 1440]) test(`map province navigates on the first real ${width === 390 ? 'tap' : 'click'}`, async () => {
  const { ctx, page, go } = await session({ viewport: { width, height: 1000 }, isMobile: width === 390, hasTouch: width === 390 });
  try {
    for (const id of ['luang-prabang', 'phongsaly', 'champasak']) {
      await go('/en/explore/');
      const link = page.locator(`.map-wrap [data-province="${id}"]`);
      await link.evaluate(el => el.scrollIntoView({ block: 'center' }));
      const point = await interiorPoint(link.locator('path'));
      assert.ok(point, `${id}: visible point inside the province`);
      if (width === 390) await page.touchscreen.tap(point.x, point.y);
      else { await page.mouse.move(point.x, point.y); await page.mouse.click(point.x, point.y); }
      await page.waitForURL(`**/en/province/${id}/`);
    }
  } finally { await ctx.close(); }
});

test('adjacent map preview follows focus, dismisses with Escape, and regions zoom', async () => {
  const { ctx, page, go } = await session();
  try {
    await go('/en/explore/');
    const trigger = page.locator('.map-wrap [data-province="luang-prabang"]');
    await trigger.focus();
    const preview = page.locator('.map-preview');
    assert.equal(await preview.locator('a[href="/en/province/luang-prabang/"]').isVisible(), true);
    assert.equal(await preview.locator('img').isVisible(), true);
    const svgBox = await page.locator('.map-wrap svg').boundingBox(), previewBox = await preview.boundingBox();
    assert.ok(previewBox.y >= svgBox.y + svgBox.height || previewBox.x >= svgBox.x + svgBox.width, 'preview stays outside the SVG');
    await page.keyboard.press('Escape');
    assert.equal(await preview.locator('a').isVisible(), false);
    assert.equal(await trigger.evaluate(el => el === document.activeElement), true);
    await page.locator('#destination-search').focus();
    await trigger.focus();
    assert.equal(await preview.locator('a').isVisible(), true);
    const full = await page.locator('.map-wrap svg').getAttribute('viewBox');
    await page.locator('.explore-tabs a[href="/en/explore/north/"]').click();
    const framed = await page.locator('.map-wrap svg').getAttribute('viewBox');
    assert.notEqual(framed, full);
    assert.ok(Number(framed.split(' ')[2]) < Number(full.split(' ')[2]), 'selected region uses a tighter view');
  } finally { await ctx.close(); }
});

test('inline All filters use the active Lao and Chinese language', async () => {
  const { ctx, page, go } = await session();
  try {
    for (const [lang, label] of [['lo', 'ທັງໝົດ'], ['zh', '全部']]) for (const route of ['explore', 'highlights', 'packages']) {
      await go(`/${lang}/${route}/`);
      const first = page.locator('main .pills a, main .pills button').first();
      assert.ok((await first.innerText()).startsWith(label), `${lang}/${route}`);
    }
  } finally { await ctx.close(); }
});

test('Escape from a map preview link returns focus to its province', async () => {
  const { ctx, page, go } = await session();
  try {
    await go('/en/explore/');
    const trigger = page.locator('.map-wrap [data-province="luang-prabang"]');
    await trigger.focus();
    await page.locator('.map-preview-link').focus();
    await page.keyboard.press('Escape');
    assert.equal(await trigger.evaluate(el => el === document.activeElement), true);
    assert.equal(await page.locator('.map-preview-link').count(), 0);
  } finally { await ctx.close(); }
});

test('about gallery links announce their destination once', async () => {
  const { ctx, page, go } = await session();
  try {
    await go('/en/about/');
    for (const shot of await page.locator('.about-shot').all()) {
      assert.equal(await shot.locator('img').getAttribute('alt'), '');
      assert.ok((await shot.locator('.about-shot-label').innerText()).trim().length > 0);
    }
  } finally { await ctx.close(); }
});
