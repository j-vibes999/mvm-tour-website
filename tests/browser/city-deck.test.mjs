import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';

let browser, server, base;
const root = resolve('build');
const artifacts = resolve('.artifacts/city-cinema-2026-10-22');
before(async () => {
  await mkdir(artifacts, { recursive: true });
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
const cardFor = (page, id) => page.locator(`a.home-city-card[data-home-destination="${id}"]`);
async function waitForCity(page, id) {
  await page.waitForFunction(id => {
    const deck = document.querySelector('dialog.city-deck[open]');
    return deck?.dataset.city === id && deck.dataset.phase === 'idle';
  }, id);
}
async function openCity(page, id = 'vientiane-capital') {
  const opener = cardFor(page, id);
  await opener.scrollIntoViewIfNeeded();
  await opener.click();
  await waitForCity(page, id);
  return opener;
}
async function assertClosed(page, opener, y) {
  await page.waitForFunction(() => !document.querySelector('dialog.city-deck[open]'));
  assert.ok(await opener.evaluate(el => el === document.activeElement), 'closing restores focus to the original city link');
  assert.ok(await page.evaluate(() => [document.body, document.documentElement].every(el => !el.classList.contains('city-deck-open')) && getComputedStyle(document.body).position !== 'fixed'), 'closing releases the page scroll lock');
  if (y !== undefined) assert.ok(Math.abs(await page.evaluate(() => scrollY) - y) <= 2, 'closing restores the homepage scroll position');
}
async function assertPhotoVisible(deck) {
  const image = deck.locator('.city-scene-media > img');
  await image.evaluate(img => img.decode());
  assert.ok(await image.evaluate(img => {
    const box = img.getBoundingClientRect();
    if (!img.complete || !img.naturalWidth || new URL(img.currentSrc).origin !== location.origin || box.width <= 100 || box.height <= 100) return false;
    for (let el = img; el && el !== document.body; el = el.parentElement) {
      const style = getComputedStyle(el);
      if (style.visibility !== 'visible' || style.display === 'none' || Number(style.opacity) <= .95) return false;
    }
    return true;
  }), 'the selected city keeps a decoded local landscape visible while details are shown');
}
async function assertNoSpatialAnimation(deck) {
  assert.equal(await deck.evaluate(el => el.getAnimations({ subtree: true }).filter(animation => {
    if (animation.playState !== 'running' || Number(animation.effect?.getTiming().duration) <= 1) return false;
    return animation.effect.getKeyframes().some(frame => ['transform', 'translate', 'rotate', 'scale'].some(key => frame[key] && frame[key] !== 'none'));
  }).length), 0, 'reduced motion and keyboard input remove spatial transitions');
}

// A lost interception or hidden image would discard the homepage or the scenic context.
test('city card opens a large scenic modal with readable details while the homepage stays in place', async () => {
  const { ctx, page, go } = await session();
  try {
    await go('/en/');
    const originalUrl = page.url();
    await openCity(page);
    assert.equal(page.url(), originalUrl);
    assert.equal(await page.locator('main .home-destinations').count(), 1);
    const deck = page.locator('dialog.city-deck[open]');
    assert.equal(await deck.evaluate(el => el.matches(':modal')), true);
    assert.equal(await deck.locator('.city-deck-stage .city-scene .city-scene-media > img').count(), 1, 'the new viewer keeps a dedicated scenic photo beside its details');
    const shell = await deck.locator('.city-deck-shell').boundingBox();
    const stage = await deck.locator('.city-deck-stage').boundingBox();
    const photo = await deck.locator('.city-scene-media').boundingBox();
    const info = await deck.locator('.city-deck-info').boundingBox();
    assert.ok(shell.width > 900 && shell.width <= 1424, 'the desktop viewer gives landscape and details room to breathe');
    assert.ok(Math.abs(photo.x - stage.x) <= 2 && photo.width >= stage.width - 2, 'the landscape fills the desktop cinema stage');
    assert.ok(info.x >= stage.x + stage.width * .5 && info.x + info.width <= stage.x + stage.width + 2, 'the opaque details sit on the right with a large unobstructed landscape to the left');
    assert.ok(photo.y >= 0 && info.y >= 0 && photo.y + photo.height <= 1000 && info.y + info.height <= 1000, 'both landscape and details are in the viewport');
    assert.match(await deck.locator('h2#city-deck-title').innerText(), /Vientiane/);
    assert.ok((await deck.locator('p.city-deck-intro').innerText()).length > 40);
    assert.equal(await deck.locator('.city-deck-highlights ul li').count(), 3);
    assert.equal(await deck.locator('.city-deck-facts').count(), 0, 'unavailable capital timing facts stay absent');
    assert.equal(await deck.locator('a[data-city-explore]').count(), 1);
    assert.match(await deck.locator('a[data-city-explore]').innerText(), /Vientiane/);
    assert.equal(await deck.locator('[data-city-flip], .city-deck-reading, .city-deck-neighbor').count(), 0);
    assert.ok(await deck.locator('.city-deck-info').evaluate(el => { const style = getComputedStyle(el); return Number(style.opacity) === 1 && style.backgroundColor !== 'transparent' && !/rgba\([^)]*,\s*0\)/.test(style.backgroundColor); }), 'details have their own opaque reading surface');
    await assertPhotoVisible(deck);
    const y = await page.evaluate(() => scrollY);
    await page.mouse.move(5, 5);
    await page.mouse.wheel(0, 500);
    assert.equal(await page.evaluate(() => scrollY), y, 'the page behind the modal cannot scroll');
    await page.locator('[data-language-toggle]').evaluate(el => el.focus());
    assert.ok(await deck.evaluate(el => el.contains(document.activeElement)), 'background controls cannot receive focus');
    await page.screenshot({ path: resolve(artifacts, 'desktop-en.png') });
  } finally { await ctx.close(); }
});

// Stale transitions must not override the latest selection or discard persistent controls.
test('previous, next and direct city controls wrap and rapid navigation keeps the latest city and focus', async () => {
  const { ctx, page, go } = await session({ reducedMotion: 'no-preference' });
  try {
    await go('/en/');
    await openCity(page);
    const deck = page.locator('dialog.city-deck[open]');
    assert.equal(await deck.locator('.city-deck-footer nav.city-deck-controls').count(), 1);
    const cities = deck.locator('.city-deck-footer nav.city-deck-cities button[data-city-select]');
    assert.deepEqual(await cities.evaluateAll(nodes => nodes.map(el => el.dataset.citySelect)), ['vientiane-capital', 'vang-vieng', 'luang-prabang', 'nong-khiaw', 'muang-ngoi']);
    for (const step of ['-1', '1']) {
      const control = deck.locator(`nav.city-deck-controls button[data-city-step="${step}"]`);
      assert.equal(await control.count(), 1);
      assert.ok(await control.evaluate(el => Boolean(el.getAttribute('aria-label')?.trim() || el.textContent.trim())), 'city navigation has a spoken name');
    }
    assert.match(await deck.locator('.city-deck-counter').innerText(), /0?1\D+0?5/);
    await page.keyboard.press('ArrowLeft');
    await waitForCity(page, 'muang-ngoi');
    const next = deck.locator('nav.city-deck-controls button[data-city-step="1"]');
    await next.focus();
    const persistentNext = await next.elementHandle();
    await page.keyboard.press('Enter');
    await waitForCity(page, 'vientiane-capital');
    assert.ok(await persistentNext.evaluate(el => el === document.activeElement && el.isConnected));
    for (let i = 0; i < 7; i++) await page.keyboard.press('ArrowRight');
    await waitForCity(page, 'luang-prabang');
    await deck.locator('[data-city-select="vang-vieng"]').click();
    await deck.locator('[data-city-select="muang-ngoi"]').click();
    await deck.locator('[data-city-select="nong-khiaw"]').click();
    await waitForCity(page, 'nong-khiaw');
    await page.waitForTimeout(500);
    assert.equal(await deck.getAttribute('data-city'), 'nong-khiaw', 'the last direct selection survives earlier transitions');
    assert.deepEqual(await cities.evaluateAll(nodes => nodes.filter(el => el.getAttribute('aria-pressed') === 'true').map(el => el.dataset.citySelect)), ['nong-khiaw']);
    assert.ok(await deck.locator('[data-city-select="nong-khiaw"]').evaluate(el => el === document.activeElement));
    assert.match(await deck.locator('#city-deck-title').innerText(), /Nong Khiaw/);
    await assertPhotoVisible(deck);
    assert.equal(new URL(page.url()).pathname, '/en/');
  } finally { await ctx.close(); }
});

// Every dismissal path must recover the original position and native link focus.
test('the modal traps keyboard focus and Escape, native cancel and close restore the original city link and scroll', async () => {
  const { ctx, page, go } = await session();
  try {
    await go('/en/');
    const opener = cardFor(page, 'vang-vieng');
    for (const method of ['Escape', 'cancel', 'button']) {
      await opener.scrollIntoViewIfNeeded();
      const y = await page.evaluate(() => scrollY);
      await opener.press('Enter');
      await waitForCity(page, 'vang-vieng');
      const deck = page.locator('dialog.city-deck[open]');
      assert.equal(await deck.locator('.city-deck-facts li').count(), 2, 'Vang Vieng retains both available timing facts');
      const explore = deck.locator('a[data-city-explore]');
      await explore.focus();
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press('Tab');
        assert.ok(await deck.evaluate(el => el.contains(document.activeElement)), 'Tab remains within the modal');
      }
      if (method === 'Escape') await page.keyboard.press('Escape');
      else if (method === 'cancel') await deck.evaluate(el => el.dispatchEvent(new Event('cancel', { cancelable: true })));
      else await deck.locator('.city-deck-close').click();
      await assertClosed(page, opener, y);
    }
  } finally { await ctx.close(); }
});

// Enhancement preserves real routes; the explicit guide action must leave the modal cleanly.
test('native destination links survive modified clicks and the named full-guide action opens the selected route', async () => {
  const { ctx, page, go } = await session();
  try {
    await go('/en/');
    assert.deepEqual(await page.locator('a.home-city-card[data-home-destination]').evaluateAll(nodes => nodes.map(el => [el.dataset.homeDestination, new URL(el.href).pathname])), [
      ['vientiane-capital', '/en/province/vientiane-capital/'],
      ['vang-vieng', '/en/province/vientiane-province/vang-vieng/'],
      ['luang-prabang', '/en/province/luang-prabang/'],
      ['nong-khiaw', '/en/province/luang-prabang/nong-khiaw/'],
      ['muang-ngoi', '/en/province/luang-prabang/muang-ngoi/'],
    ]);
    const opener = cardFor(page, 'nong-khiaw');
    await opener.scrollIntoViewIfNeeded();
    const popupPromise = ctx.waitForEvent('page');
    await opener.click({ modifiers: ['ControlOrMeta'] });
    const popup = await popupPromise;
    await popup.waitForLoadState('domcontentloaded');
    assert.equal(new URL(popup.url()).pathname, '/en/province/luang-prabang/nong-khiaw/');
    await popup.close();
    assert.equal(new URL(page.url()).pathname, '/en/');
    assert.equal(await page.locator('dialog.city-deck[open]').count(), 0);
    await openCity(page, 'vang-vieng');
    const explore = page.locator('dialog.city-deck[open] a[data-city-explore]');
    assert.equal(new URL(await explore.getAttribute('href'), base).pathname, '/en/province/vientiane-province/vang-vieng/');
    assert.match(await explore.innerText(), /Vang Vieng/);
    await explore.click();
    await page.waitForURL('**/en/province/vientiane-province/vang-vieng/');
    assert.equal(await page.locator('dialog.city-deck[open]').count(), 0);
    assert.ok(await page.evaluate(() => !document.documentElement.classList.contains('city-deck-open') && getComputedStyle(document.body).position !== 'fixed'));
    await go('/en/');
    await openCity(page);
    await page.evaluate(() => { history.pushState({}, '', '/en/explore/'); dispatchEvent(new PopStateEvent('popstate')); });
    await page.waitForFunction(() => !document.querySelector('dialog.city-deck[open]'));
    assert.equal(new URL(page.url()).pathname, '/en/explore/');
    assert.equal(await page.locator('[data-month-chooser]').count(), 1);
  } finally { await ctx.close(); }
});

// Motion preferences and keyboard input retain the same visible content and controls.
test('reduced motion and keyboard navigation keep photo and details visible without spatial animation', async () => {
  for (const reducedMotion of ['reduce', 'no-preference']) {
    const { ctx, page, go } = await session({ reducedMotion });
    try {
      await go('/en/');
      const opener = cardFor(page, 'vientiane-capital');
      await opener.scrollIntoViewIfNeeded();
      await opener.press('Enter');
      await waitForCity(page, 'vientiane-capital');
      const deck = page.locator('dialog.city-deck[open]');
      await assertNoSpatialAnimation(deck);
      await page.keyboard.press('ArrowRight');
      await waitForCity(page, 'vang-vieng');
      await assertNoSpatialAnimation(deck);
      assert.equal(await deck.locator('[data-city-flip]').count(), 0);
      assert.ok(await deck.locator('.city-deck-stage').evaluate(el => [el, ...el.querySelectorAll('*')].every(node => !/matrix3d/.test(getComputedStyle(node).transform))), 'the scenic stage never rotates a reading face');
      await assertPhotoVisible(deck);
    } finally { await ctx.close(); }
  }
});

// Cancelling exit motion must still finish closing, unlock the page, and recover focus.
test('closing completes when reduced motion or document visibility changes during the exit', async () => {
  for (const interruption of ['reduced motion', 'hidden document']) {
    const { ctx, page, go } = await session({ reducedMotion: 'no-preference' });
    try {
      await go('/en/');
      const opener = await openCity(page, 'vang-vieng');
      if (interruption === 'reduced motion') {
        await page.locator('.city-deck-close').evaluate(el => el.click());
        await page.emulateMedia({ reducedMotion: 'reduce' });
      } else {
        await page.locator('.city-deck-close').evaluate(el => { el.click(); Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
      }
      await assertClosed(page, opener);
    } finally { await ctx.close(); }
  }
});

// Long translations must flow through one shell, keeping the entire summary and action reachable.
test('all four languages keep the scenic summary and one guide action reachable from 320px to desktop', async () => {
  for (const width of [320, 390, 768, 1440]) {
    const height = width < 600 ? 844 : 1000;
    const { ctx, page, go } = await session({ viewport: { width, height }, isMobile: width < 600, hasTouch: width < 600 });
    try {
      await go('/en/');
      for (const lang of ['lo', 'en', 'zh', 'th']) {
        await page.locator('[data-language-toggle]').click();
        await page.locator(`[data-language-option][data-lang="${lang}"]`).click();
        await page.waitForFunction(lang => document.documentElement.lang === (lang === 'zh' ? 'zh-Hans' : lang), lang);
        const name = await cardFor(page, 'luang-prabang').locator('h3').innerText();
        await openCity(page, 'luang-prabang');
        const deck = page.locator('dialog.city-deck[open]');
        const shell = deck.locator('.city-deck-shell');
        assert.ok((await deck.locator('#city-deck-title').innerText()).includes(name), `${width}px ${lang}: the city name is translated`);
        assert.equal(await deck.locator('.city-deck-highlights li').count(), 3);
        assert.equal(await deck.locator('a[data-city-explore]').count(), 1);
        assert.ok((await deck.locator('a[data-city-explore]').innerText()).includes(name), `${width}px ${lang}: the guide action names its city`);
        assert.equal(await deck.locator('.city-deck-facts').count(), 0, 'province summaries do not invent place timing facts');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px ${lang}: no horizontal page overflow`);
        assert.ok(await shell.evaluate(el => el.scrollWidth <= el.clientWidth + 1), `${width}px ${lang}: no horizontal modal overflow`);
        assert.ok(await deck.locator('.city-deck-info').evaluate(el => !['auto', 'scroll'].includes(getComputedStyle(el).overflowY) && el.scrollHeight <= el.clientHeight + 2), `${width}px ${lang}: details do not create a nested reading scroll`);
        if (width < 600) {
          const photo = await deck.locator('.city-scene-media').boundingBox();
          const info = await deck.locator('.city-deck-info').boundingBox();
          assert.ok(photo.y + photo.height <= info.y + 2, `${width}px ${lang}: mobile places the photo above the details`);
          assert.ok(await shell.evaluate(el => ['auto', 'scroll'].includes(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight), `${width}px ${lang}: one shell scroll holds the full scene and details`);
        }
        await deck.locator('a[data-city-explore]').focus();
        const action = await deck.locator('a[data-city-explore]').boundingBox();
        assert.ok(action.x >= 0 && action.x + action.width <= width && action.y >= 0 && action.y + action.height <= height, `${width}px ${lang}: the named guide action is reachable`);
        const firstHighlight = deck.locator('.city-deck-highlights li').first();
        await firstHighlight.scrollIntoViewIfNeeded();
        assert.ok(await firstHighlight.isVisible());
        if (width === 390 && lang === 'lo') await page.screenshot({ path: resolve(artifacts, 'mobile-lo.png') });
        await deck.locator('.city-deck-close').click();
        await assertClosed(page, cardFor(page, 'luang-prabang'));
      }
    } finally { await ctx.close(); }
  }
});

async function touchGesture(cdp, start, end) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: start.x, y: start.y }] });
  for (let i = 1; i <= 5; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start.x + (end.x - start.x) * i / 5, y: start.y + (end.y - start.y) * i / 5 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

// Only deliberate photo swipes navigate; details retain native vertical scrolling and selection.
test('photo swipes change cities while detail gestures scroll naturally without changing the city', async () => {
  const { ctx, page, go } = await session({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const cdp = await ctx.newCDPSession(page);
  try {
    await go('/en/');
    await openCity(page);
    const deck = page.locator('dialog.city-deck[open]');
    let photo = await deck.locator('.city-scene-media').boundingBox();
    let start = { x: photo.x + photo.width * .65, y: photo.y + photo.height * .5 };
    await touchGesture(cdp, start, { x: start.x - 30, y: start.y + 2 });
    assert.equal(await deck.getAttribute('data-city'), 'vientiane-capital', 'short photo gestures do not navigate');
    await touchGesture(cdp, start, { x: start.x - 100, y: start.y + 2 });
    await waitForCity(page, 'vang-vieng');
    const shell = deck.locator('.city-deck-shell');
    const intro = deck.locator('.city-deck-intro');
    await intro.scrollIntoViewIfNeeded();
    const box = await intro.boundingBox();
    start = { x: box.x + box.width * .65, y: Math.min(740, Math.max(120, box.y + box.height * .5)) };
    await touchGesture(cdp, start, { x: start.x - 100, y: start.y + 2 });
    assert.equal(await deck.getAttribute('data-city'), 'vang-vieng', 'horizontal text gestures do not navigate');
    await shell.evaluate(el => { el.scrollTop = 0; });
    const info = await deck.locator('.city-deck-info').boundingBox();
    start = { x: info.x + info.width * .5, y: Math.min(760, info.y + 140) };
    await touchGesture(cdp, start, { x: start.x + 3, y: start.y - 180 });
    await page.waitForFunction(() => document.querySelector('.city-deck-shell')?.scrollTop > 0);
    assert.equal(await deck.getAttribute('data-city'), 'vang-vieng');
    await deck.locator('a[data-city-explore]').focus();
    assert.ok(await deck.locator('a[data-city-explore]').evaluate(el => el === document.activeElement));
  } finally { await cdp.detach(); await ctx.close(); }
});

// An open viewer must reflow without a stale mobile card size or hidden reading area.
test('an open scenic viewer remains readable while resizing from mobile to tablet and desktop', async () => {
  const { ctx, page, go } = await session({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    await go('/en/');
    await openCity(page, 'vang-vieng');
    const deck = page.locator('dialog.city-deck[open]');
    for (const viewport of [{ width: 768, height: 844 }, { width: 1440, height: 1000 }, { width: 844, height: 390 }, { width: 320, height: 844 }]) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const shell = deck.locator('.city-deck-shell');
      assert.ok(await shell.evaluate(el => el.clientWidth >= 280 && el.scrollWidth <= el.clientWidth + 1), `${viewport.width}px: the shell fits and remains readable`);
      assert.ok(await deck.locator('.city-deck-info').evaluate(el => el.clientHeight > 100));
      await deck.locator('a[data-city-explore]').scrollIntoViewIfNeeded();
      await deck.locator('a[data-city-explore]').focus();
      const action = await deck.locator('a[data-city-explore]').boundingBox();
      assert.ok(action.y >= 0 && action.y + action.height <= viewport.height + 1, `${viewport.width}px: the guide remains reachable`);
      assert.equal(await deck.getAttribute('data-city'), 'vang-vieng');
    }
    await page.keyboard.press('Escape');
    await assertClosed(page, cardFor(page, 'vang-vieng'));
  } finally { await ctx.close(); }
});

// A release on the backdrop is insufficient when the original press began on readable text.
test('dragging selected detail text onto the backdrop keeps the city open and a deliberate backdrop click closes it', async () => {
  const { ctx, page, go } = await session();
  try {
    await go('/en/');
    const opener = await openCity(page, 'vang-vieng');
    const shell = await page.locator('.city-deck-shell').boundingBox();
    const intro = await page.locator('.city-deck-intro').boundingBox();
    await page.mouse.move(intro.x + 12, intro.y + 14);
    await page.mouse.down();
    await page.mouse.move(shell.x - 28, intro.y + 14, { steps: 6 });
    await page.mouse.up();
    assert.equal(await page.locator('dialog.city-deck[open]').count(), 1, 'text selection does not count as a backdrop press');
    await page.mouse.click(5, 5);
    await assertClosed(page, opener);
  } finally { await ctx.close(); }
});

// A delayed photo must never replace a newer city's photo or details after it resolves.
test('a delayed scenic photo cannot replace the latest selected city after its request resolves', async () => {
  const { ctx, page, go } = await session();
  let releasePhoto;
  const photoGate = new Promise(resolve => { releasePhoto = resolve; });
  try {
    await go('/en/');
    await openCity(page);
    await page.route('**/assets/images/photos/nam-song-1600.webp', async route => { await photoGate; await route.continue(); });
    const delayedRequest = page.waitForRequest('**/assets/images/photos/nam-song-1600.webp');
    const deck = page.locator('dialog.city-deck[open]');
    await deck.locator('[data-city-select="vang-vieng"]').click();
    await delayedRequest;
    assert.equal(await deck.locator('.city-deck-stage').getAttribute('aria-busy'), 'true');
    await deck.locator('[data-city-select="nong-khiaw"]').click();
    await waitForCity(page, 'nong-khiaw');
    const staleFinished = page.waitForEvent('requestfinished', { predicate: request => request.url().endsWith('/nam-song-1600.webp') });
    releasePhoto();
    await staleFinished;
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await deck.getAttribute('data-city'), 'nong-khiaw');
    assert.match(await deck.locator('#city-deck-title').innerText(), /Nong Khiaw/);
    assert.equal(await deck.locator('.city-scene-media > img').getAttribute('data-photo'), 'nong-khiaw');
    assert.match(await deck.locator('.city-scene-media > img').evaluate(img => img.currentSrc), /\/nong-khiaw-\d+\.webp$/);
    assert.equal(await deck.locator('[data-city-select="nong-khiaw"]').getAttribute('aria-pressed'), 'true');
    assert.equal(await deck.locator('.city-deck-stage').getAttribute('aria-busy'), null);
    await assertPhotoVisible(deck);
  } finally { releasePhoto(); await ctx.close(); }
});

// An unavailable photo must explain its state without blocking the useful city guide.
test('a failed scenic photo shows an accessible readable unavailable state and keeps its guide action working', async () => {
  const { ctx, page, go } = await session();
  try {
    await go('/en/');
    await page.route('**/assets/images/photos/nam-song-1600.webp', route => route.abort('failed'));
    await openCity(page, 'vang-vieng');
    const deck = page.locator('dialog.city-deck[open]');
    const notice = deck.locator('.city-scene-unavailable');
    assert.equal(await notice.count(), 1);
    assert.equal(await notice.getAttribute('role'), 'status', 'failed scenic images expose an accessible status message');
    assert.match(await notice.innerText(), /image is unavailable/i);
    assert.ok(await notice.isVisible());
    assert.ok(await notice.evaluate(el => {
      const rgb = value => value.match(/[\d.]+/g)?.map(Number);
      const text = rgb(getComputedStyle(el).color);
      let background;
      for (let surface = el; surface && !background; surface = surface.parentElement) {
        const color = rgb(getComputedStyle(surface).backgroundColor);
        if (color && (color.length < 4 || color[3] === 1)) background = color;
      }
      if (!text || !background) return false;
      const luminance = color => color.slice(0, 3).map(value => value / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0);
      const light = luminance(text), dark = luminance(background);
      const contrast = (Math.max(light, dark) + .05) / (Math.min(light, dark) + .05);
      const box = el.getBoundingClientRect();
      return contrast >= 4.5 && box.width > 100 && box.height >= 44;
    }), 'the failure message is large enough and has readable text contrast');
    const explore = deck.locator('a[data-city-explore]');
    assert.match(await explore.innerText(), /Vang Vieng/);
    await page.screenshot({ path: resolve(artifacts, 'photo-unavailable.png') });
    await explore.click();
    await page.waitForURL('**/en/province/vientiane-province/vang-vieng/');
    assert.equal(await page.locator('dialog.city-deck[open]').count(), 0);
    assert.ok(await page.evaluate(() => !document.documentElement.classList.contains('city-deck-open')));
  } finally { await ctx.close(); }
});

// Initial image decode must not undo reading or focus changes made while the image loads.
test('a delayed initial photo preserves mobile guide focus and shell scroll after it appears', async () => {
  const { ctx, page } = await session({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  let releasePhoto;
  const photoGate = new Promise(resolve => { releasePhoto = resolve; });
  try {
    await page.route('**/assets/images/photos/that-luang-*.webp', async route => { await photoGate; await route.continue(); });
    await page.goto(base + '/en/', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__mvmReady);
    const opener = cardFor(page, 'vientiane-capital');
    await opener.scrollIntoViewIfNeeded();
    await opener.click();
    const deck = page.locator('dialog.city-deck[open]');
    await deck.waitFor({ state: 'visible' });
    assert.equal(await deck.locator('.city-deck-stage').getAttribute('aria-busy'), 'true');
    const guide = deck.locator('a[data-city-explore]');
    await guide.focus();
    const shell = deck.locator('.city-deck-shell');
    await shell.evaluate(el => { el.scrollTop = Math.min(160, el.scrollHeight - el.clientHeight); });
    const readingY = await shell.evaluate(el => el.scrollTop);
    assert.ok(readingY > 0, 'the pending-photo summary is already usable through the shell scroll');
    releasePhoto();
    await waitForCity(page, 'vientiane-capital');
    assert.ok(await guide.evaluate(el => el === document.activeElement), 'a decoded image does not move focus away from the guide action');
    assert.equal(await shell.evaluate(el => el.scrollTop), readingY, 'a decoded image does not reset the current reading position');
    await assertPhotoVisible(deck);
  } finally { releasePhoto(); await ctx.close(); }
});

// The modal's fixed body must not overwrite the homepage history entry with scroll zero.
test('Back and Forward restore the homepage reading position after opening a city from SPA navigation', async () => {
  const { ctx, page, go } = await session();
  try {
    await go('/en/about/');
    await page.locator('.desktop-nav a[href="/en/"]').click();
    await page.waitForURL('**/en/');
    const opener = cardFor(page, 'vang-vieng');
    await opener.scrollIntoViewIfNeeded();
    await page.waitForTimeout(220);
    const readingY = await page.evaluate(() => scrollY);
    assert.ok(readingY > 100, 'the homepage entry records a real destination-section position');
    await opener.click();
    await waitForCity(page, 'vang-vieng');
    await page.waitForTimeout(300);
    await page.goBack();
    await page.waitForURL('**/en/about/');
    assert.equal(await page.locator('dialog.city-deck[open]').count(), 0);
    await page.goForward();
    await page.waitForURL('**/en/');
    await cardFor(page, 'vang-vieng').waitFor({ state: 'visible' });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.ok(Math.abs(await page.evaluate(() => scrollY) - readingY) <= 2, 'the restored homepage retains the pre-modal reading position');
  } finally { await ctx.close(); }
});
