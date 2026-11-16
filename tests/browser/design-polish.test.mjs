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
const phone = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
const savedList = page => page.evaluate(() => JSON.parse(localStorage.getItem('mvm-saved-places') || '[]'));
const seed = (ctx, refs) => ctx.addInitScript(refs => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('mvm-saved-places', JSON.stringify(refs)); sessionStorage.setItem('seeded', '1'); } }, refs);
async function chooseLanguage(page, lang) {
  await page.locator('[data-language-toggle]').click();
  await page.locator(`[data-language-option][data-lang="${lang}"]`).click();
  await page.waitForFunction(tag => document.documentElement.lang === tag && !document.querySelector('[data-language-toggle][aria-busy]'), lang === 'zh' ? 'zh-Hans' : lang);
}

test('a heart on a place card saves the place without opening it', async () => {
  const { ctx, page, go } = await session();
  try {
    await go('/en/highlights/');
    const heart = page.locator('.photo-grid > .save-card .save-heart').first();
    const ref = await heart.getAttribute('data-save');
    assert.equal(await heart.getAttribute('aria-pressed'), 'false');
    assert.match(await heart.getAttribute('aria-label'), /^Save this place · /);
    await heart.click();
    await page.waitForFunction(ref => JSON.parse(localStorage.getItem('mvm-saved-places') || '[]').includes(ref), ref);
    assert.equal(await heart.getAttribute('aria-pressed'), 'true');
    assert.match(await heart.getAttribute('aria-label'), /^Remove from saved · /);
    assert.equal(new URL(page.url()).pathname, '/en/highlights/', 'saving keeps the reader on the list');
    assert.equal(await page.locator('.viewer.is-open').count(), 0);
    await page.waitForFunction(() => document.querySelector('.saved-link .saved-count')?.textContent === '1');
    await go(`/en/province/${ref.split('/')[0]}/`);
    const railHeart = page.locator(`.place-rail .save-heart[data-save="${ref}"]`);
    assert.equal(await railHeart.getAttribute('aria-pressed'), 'true', 'the same place shows as saved on its province');
    await railHeart.click();
    assert.equal(await railHeart.getAttribute('aria-pressed'), 'false');
    assert.equal(await page.locator('.viewer.is-open').count(), 0);
    assert.deepEqual(await savedList(page), []);
  } finally { await ctx.close(); }
});

test('hearts never cover category chips or AI labels on any card layout', async () => {
  for (const [options, path] of [[{}, '/en/province/bolikhamxay/'], [phone, '/th/province/bolikhamxay/'], [{}, '/en/highlights/'], [phone, '/th/highlights/'], [{}, '/th/'], [phone, '/en/']]) {
    const { ctx, page, go } = await session(options);
    try {
      await go(path);
      const problems = await page.evaluate(() => [...document.querySelectorAll('.save-card, .home-moment')].flatMap(card => {
        const heart = card.querySelector(':scope > .save-heart')?.getBoundingClientRect();
        if (!heart) return ['missing heart'];
        if (heart.width < 40 || heart.height < 40) return ['heart smaller than 40px'];
        return [...card.querySelectorAll('.chip-glass, .chip-on-photo, .generated-badge, .home-image-credit')]
          .filter(el => el.getClientRects().length && getComputedStyle(el).display !== 'none')
          .filter(el => {
            const box = el.getBoundingClientRect();
            return Math.min(heart.right, box.right) - Math.max(heart.left, box.left) > 0 && Math.min(heart.bottom, box.bottom) - Math.max(heart.top, box.top) > 0;
          }).map(el => `${card.querySelector('a[href]')?.getAttribute('href')}: ${el.className}`);
      }));
      assert.deepEqual(problems, [], path);
    } finally { await ctx.close(); }
  }
});

test('the saved list removes quietly, describes each place and suggests itineraries that visit it', async () => {
  const C = await import('../../dist/content.js');
  const refs = ['luang-prabang/kuang-si', 'luang-prabang/alms-giving', 'vientiane-province/vang-vieng'];
  const { ctx, page, go } = await session();
  try {
    await seed(ctx, refs);
    await go('/en/saved/');
    const kuangSi = C.findPlace(refs[0]).place;
    assert.ok((await page.locator('.saved-row .saved-place-facts').first().innerText()).startsWith(C.placeTypes[kuangSi.type].en));
    assert.equal(await page.locator('.saved-row .save-place').count(), 0, 'no loud remove buttons on the list');
    const first = page.locator('.saved-trips [data-saved-trip]').first();
    assert.equal(await first.getAttribute('data-saved-trip'), 'luang-prabang-discovery');
    assert.match(await first.innerText(), /Includes 2 of your places/);
    const remove = page.locator('.saved-remove[data-save="luang-prabang/alms-giving"]');
    assert.match(await remove.getAttribute('aria-label'), /Remove from saved · /);
    await remove.click();
    await page.waitForFunction(() => document.querySelectorAll('.saved-row').length === 2);
    assert.deepEqual(await savedList(page), [refs[0], refs[2]]);
    assert.match(await page.locator('.saved-trips [data-saved-trip="luang-prabang-discovery"]').innerText(), /Includes 1 of your places/);
    await page.locator('.saved-trips [data-saved-trip="luang-prabang-discovery"]').click();
    await page.waitForURL('**/en/package/luang-prabang-discovery/');
  } finally { await ctx.close(); }
});

test('touch screens get move buttons instead of a drag handle that cannot be dragged', async () => {
  const { ctx, page, go } = await session(phone);
  try {
    await seed(ctx, ['luang-prabang/kuang-si', 'vientiane-province/vang-vieng']);
    await go('/en/saved/');
    assert.equal(await page.locator('[data-saved-drag]').first().isHidden(), true);
    assert.equal(await page.locator('[data-move-saved][data-direction="1"]').first().isVisible(), true);
  } finally { await ctx.close(); }
});

test('month and interest choices survive language changes and reach the message', async () => {
  const { ctx, page, go } = await session();
  try {
    await go('/th/inquiry/?kind=package&ref=luang-prabang-discovery');
    assert.equal(await page.locator('.inquiry-group').count(), 3, 'still one short form in three groups');
    assert.equal(await page.locator('[data-inquiry-month=""]').getAttribute('aria-pressed'), 'true', 'starts as not sure yet');
    const months = await page.locator('[data-inquiry-month]:not([data-inquiry-month=""])').evaluateAll(nodes => nodes.map(node => node.dataset.inquiryMonth));
    assert.equal(months.length, 12);
    const month = months[3];
    await page.locator(`[data-inquiry-month="${month}"]`).click();
    await page.locator('[data-inquiry-interest="food"]').click();
    await page.locator('[data-inquiry-interest="nature"]').click();
    await page.locator('[data-inquiry-interest="nature"]').click();
    for (const lang of ['lo', 'en']) {
      await chooseLanguage(page, lang);
      assert.equal(await page.locator(`[data-inquiry-month="${month}"]`).getAttribute('aria-pressed'), 'true', lang);
      assert.equal(await page.locator('[data-inquiry-interest="food"]').getAttribute('aria-pressed'), 'true', lang);
      assert.equal(await page.locator('[data-inquiry-interest="nature"]').getAttribute('aria-pressed'), 'false', lang);
    }
    await page.locator('#inquiry-form button[type="submit"]').click();
    const [year, number] = month.split('-').map(Number);
    const expected = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, number - 1, 1)));
    const message = await page.locator('#inquiry-message').inputValue();
    assert.ok(message.includes(`Preferred month: ${expected}`), message);
    assert.match(message, /Interests: Food and markets/);
    assert.doesNotMatch(message, /Nature and mountains/);
    await page.fill('[name="date"]', `${month}-15`);
    assert.equal(await page.locator(`[data-inquiry-month="${month}"]`).getAttribute('aria-pressed'), 'true', 'a date selects its month');
    await page.locator('[data-inquiry-month=""]').click();
    assert.equal(await page.locator('[name="date"]').inputValue(), '', 'not sure clears a conflicting date');
    assert.equal(await page.evaluate(() => Object.values(localStorage).some(value => value.includes('food'))), false, 'choices stay out of storage');
  } finally { await ctx.close(); }
});

test('map previews open on a well-known province and show how to open it', async () => {
  const { ctx, page, go } = await session();
  try {
    await go('/en/explore/');
    const preview = page.locator('.map-preview-link').first();
    assert.equal(await preview.getAttribute('href'), '/en/province/luang-prabang/');
    assert.match(await preview.innerText(), /Explore this province/);
    await go('/en/');
    await page.locator('[data-atlas-region="south"]').click();
    assert.equal(await page.locator('.home-atlas .map-preview-link').getAttribute('href'), '/en/province/champasak/');
    await page.locator('[data-atlas-region="central"]').click();
    assert.equal(await page.locator('.home-atlas .map-preview-link').getAttribute('href'), '/en/province/vientiane-capital/');
  } finally { await ctx.close(); }
});

test('phone filters stay on one swipeable line and nearby provinces become a row', async () => {
  const { ctx, page, go } = await session(phone);
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  try {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      for (const lang of ['th', 'en', 'lo']) for (const route of ['highlights/', 'explore/', 'packages/']) {
        await go(`/${lang}/${route}`);
        const rows = await page.locator('main .pills').first().locator('.pill').evaluateAll(nodes => new Set(nodes.map(node => Math.round(node.getBoundingClientRect().top))).size);
        assert.equal(rows, 1, `${width} ${lang} ${route}: one line of filters`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${width} ${lang} ${route}: page fits`);
      }
      await go('/th/province/luang-prabang/');
      const related = page.locator('.related .prov-grid');
      assert.ok(await related.evaluate(row => row.scrollWidth > row.clientWidth), 'the other provinces scroll sideways');
      assert.equal(await related.locator('.prov-card').evaluateAll(nodes => new Set(nodes.map(node => Math.round(node.getBoundingClientRect().top))).size), 1);
      for (const lang of ['th', 'en', 'zh']) {
        await go(`/${lang}/`);
        assert.equal(await page.locator('.home-region-row a').evaluateAll(nodes => new Set(nodes.map(node => Math.round(node.getBoundingClientRect().top))).size), 1, `${width} ${lang}: region links share one line`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${width} ${lang}: home fits`);
      }
    }
    assert.deepEqual(errors, []);
  } finally { await ctx.close(); }
});

test('package pages show the route in photos, preview closed days and state the price basis once', async () => {
  const C = await import('../../dist/content.js');
  const trip = C.packages.find(pk => pk.id === 'luang-prabang-discovery');
  const { ctx, page, go } = await session();
  try {
    await go('/en/package/luang-prabang-discovery/');
    const text = await page.locator('main').innerText();
    assert.equal(text.split(trip.priceBasis.en).length - 1, 1, 'the price basis appears once, beside the price');
    assert.doesNotMatch(text, /This sample itinerary is not a confirmed schedule/, 'the repeated closing note is gone');
    assert.match(text, new RegExp(trip.itineraryNote.en.slice(0, 40).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'the planning note remains');
    const route = page.locator('.pkg-route-places a');
    assert.equal(await route.count(), trip.routeStops.length);
    assert.deepEqual(await route.evaluateAll(links => links.map(link => link.getAttribute('href'))), trip.routeStops.map(ref => `/en/province/${ref}/`));
    assert.equal(await page.locator('#program-day-1 .day-thumb').isVisible(), false, 'an open day shows its full photo instead');
    assert.equal(await page.locator('#program-day-2 .day-thumb').isVisible(), true);
    await page.locator('#program-day-2 summary').click();
    assert.equal(await page.locator('#program-day-2 .day-thumb').isVisible(), false);
    assert.equal(await page.locator('.package-page-head .duration a').count(), 0, 'no repeated province link when it matches the destination');
    await go('/en/package/vang-vieng-nature/');
    assert.equal(await page.locator('.package-page-head .duration a').getAttribute('href'), '/en/province/vientiane-province/');
    await go('/en/package/nong-khiaw-discovery/');
    assert.equal(await page.locator('.pkg-route-places').count(), 0, 'a single stop needs no strip');
  } finally { await ctx.close(); }
});

test('the day story saves its place and hides the play control when motion is reduced', async () => {
  const { ctx, page, go } = await session();
  try {
    await go('/en/');
    const play = page.locator('[data-day-play]');
    assert.equal(await play.isHidden(), true);
    assert.equal(await play.isDisabled(), true);
    const save = page.locator('[data-day-frame] [data-save]');
    assert.equal(await save.getAttribute('data-save'), 'luang-prabang/alms-giving');
    await save.click();
    assert.deepEqual(await savedList(page), ['luang-prabang/alms-giving']);
    await page.locator('[data-day-period="4"]').click();
    assert.equal(await page.locator('[data-day-frame] [data-save]').getAttribute('aria-pressed'), 'false');
    await page.locator('[data-day-period="0"]').click();
    assert.equal(await page.locator('[data-day-frame] [data-save]').getAttribute('aria-pressed'), 'true', 'a revisited stop remembers it was saved');
  } finally { await ctx.close(); }
  const motion = await session({ reducedMotion: 'no-preference' });
  try { await motion.go('/en/'); assert.equal(await motion.page.locator('[data-day-play]').isVisible(), true); }
  finally { await motion.ctx.close(); }
});

test('the city viewer names the city once on phones', async () => {
  for (const [options, titleShown] of [[phone, false], [{}, true]]) {
    const { ctx, page, go } = await session(options);
    try {
      await go('/en/');
      const card = page.locator('a.home-city-card[data-home-destination="luang-prabang"]');
      await card.scrollIntoViewIfNeeded();
      await card.click();
      await page.waitForFunction(() => document.querySelector('dialog.city-deck[open]')?.dataset.phase === 'idle');
      assert.equal(await page.locator('.city-scene-title').isVisible(), titleShown);
      assert.equal(await page.locator('#city-deck-title').isVisible(), true);
    } finally { await ctx.close(); }
  }
});
