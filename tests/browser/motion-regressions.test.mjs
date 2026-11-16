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
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true });
});
after(async () => { await browser?.close(); await new Promise(resolve => server.close(resolve)); });

async function session(options = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'no-preference', ...options });
  const page = await ctx.newPage();
  page.setDefaultTimeout(5000);
  await page.goto(base + '/en/');
  await page.waitForFunction(() => document.querySelector('#home-hero')?.dataset.heroPlaying === 'true');
  return { ctx, page };
}

const heroTimes = page => page.evaluate(() => {
  const root = document.querySelector('#home-hero');
  const drift = root.querySelector('#hero-img').getAnimations()[0];
  const progress = root.querySelector('[data-slide][aria-pressed="true"] .slide-progress').getAnimations()[0];
  return { drift: drift?.currentTime, progress: progress?.currentTime, driftState: drift?.playState, playing: root.dataset.heroPlaying };
});

test('Pause freezes photograph drift and progress, and Play resumes from that frame', async () => {
  const { ctx, page } = await session();
  try {
    await page.locator('[data-hero-play]').click();
    await page.waitForTimeout(80);
    const paused = await heroTimes(page);
    await page.waitForTimeout(300);
    const still = await heroTimes(page);
    assert.equal(still.driftState, 'paused');
    assert.ok(Math.abs(still.drift - paused.drift) < 1, 'the photo must stay on the paused frame');
    assert.ok(Math.abs(still.progress - paused.progress) < 1, 'the progress must stay on the paused frame');
    await page.locator('[data-hero-play]').click();
    // WAAPI starts on a rendering frame, which can be delayed by parallel browser tests.
    // Wait for the same retained animations to advance rather than assuming a fixed frame budget.
    await page.waitForFunction(({drift,progress}) => {
      const root=document.querySelector('#home-hero');
      const photo=root.querySelector('#hero-img').getAnimations()[0];
      const bar=root.querySelector('[data-slide][aria-pressed="true"] .slide-progress').getAnimations()[0];
      return root.dataset.heroPlaying==='true'&&photo?.currentTime>drift+100&&bar?.currentTime>progress+100;
    }, paused, {timeout:2500});
    const resumed = await heroTimes(page);
    assert.equal(resumed.playing, 'true');
    assert.ok(resumed.drift > paused.drift + 100, 'Play resumes the retained photo animation');
    assert.ok(resumed.progress > paused.progress + 100, 'Play resumes the retained slide time');
  } finally { await ctx.close(); }
});

test('offscreen and hidden holds freeze the photograph; reduced motion keeps it stopped', async () => {
  const { ctx, page } = await session();
  try {
    await page.locator('#destinations').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('#home-hero').dataset.heroPlaying === 'false');
    await page.waitForTimeout(80);
    const offscreen = await heroTimes(page);
    await page.waitForTimeout(180);
    assert.ok(Math.abs((await heroTimes(page)).drift - offscreen.drift) < 1, 'offscreen drift stays still');
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForFunction(() => document.querySelector('#home-hero').dataset.heroPlaying === 'true');
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.waitForTimeout(80);
    const hidden = await heroTimes(page);
    await page.waitForTimeout(180);
    assert.ok(Math.abs((await heroTimes(page)).drift - hidden.drift) < 1, 'hidden drift stays still');
    await page.evaluate(() => {
      delete document.hidden;
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => !document.querySelector('#hero-img').getAnimations().length);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForTimeout(80);
    const reduced = await heroTimes(page);
    assert.equal(reduced.playing, 'false');
    assert.equal(reduced.driftState, 'paused', 'motion preference changes must not restart a paused slideshow');
  } finally { await ctx.close(); }
});

for (const [path, selector] of [['/en/', '.home-city-card'], ['/en/highlights/', '.photo-card']]) {
  test(`${selector} lifts through intermediate frames instead of jumping`, async () => {
    const { ctx, page } = await session();
    try {
      if (path !== '/en/') await page.goto(base + path);
      const card = page.locator(selector).first();
      await card.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      await page.waitForTimeout(100);
      await card.hover();
      const state = await card.evaluate(element => ({
        transitions: element.getAnimations().filter(run => run instanceof CSSTransition).map(run => run.transitionProperty),
        lift: new DOMMatrix(getComputedStyle(element).transform).m42,
      }));
      assert.ok(state.transitions.includes('transform'), 'lift needs an actual transform transition');
      assert.ok(state.lift > -6 && state.lift <= 0, `lift starts between its endpoints: ${state.lift}`);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await card.evaluate(element => getComputedStyle(element).transform), 'none');
    } finally { await ctx.close(); }
  });
}

async function gestureFixture(page) {
  await page.evaluate(async () => {
    const { attachViewerGestures } = await import('/viewer-gestures.js');
    const viewer = document.createElement('div');
    viewer.id = 'gesture-fixture';
    viewer.className = 'viewer is-open';
    viewer.style.cssText = 'display:block;inset:100px 20px auto;height:400px';
    viewer.innerHTML = '<div class="v-info" style="width:100%;height:350px;max-height:350px;overflow-y:auto"><div data-sheet-handle class="v-sheet-handle"><span></span></div><button id="fixture-close">Close</button><p style="height:1000px">Readable scrollable content</p></div>';
    document.body.append(viewer);
    window.fixtureCloses = 0;
    window.cleanupGestureFixture = attachViewerGestures(viewer, { onClose: () => window.fixtureCloses++ });
  });
}

async function pointerDrag(page, selector, distance, end = 'pointerup') {
  const target = page.locator(selector);
  await target.dispatchEvent('pointerdown', { pointerId: 9, pointerType: 'touch', isPrimary: true, button: 0, clientX: 100, clientY: 150 });
  await target.dispatchEvent('pointermove', { pointerId: 9, pointerType: 'touch', isPrimary: true, clientX: 104, clientY: 150 + distance });
  await target.dispatchEvent(end, { pointerId: 9, pointerType: 'touch', isPrimary: true, clientX: 104, clientY: 150 + distance });
}

test('only the dedicated sheet handle dismisses after its distance threshold', async () => {
  const { ctx, page } = await session({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    await gestureFixture(page);
    await pointerDrag(page, '#gesture-fixture p', 180);
    await pointerDrag(page, '[data-sheet-handle]', 35);
    assert.equal(await page.evaluate(() => window.fixtureCloses), 0);
    await pointerDrag(page, '[data-sheet-handle]', 150, 'pointercancel');
    assert.equal(await page.evaluate(() => window.fixtureCloses), 0);
    await pointerDrag(page, '[data-sheet-handle]', 150);
    assert.equal(await page.evaluate(() => window.fixtureCloses), 1);
  } finally { await ctx.close(); }
});

test('gesture cancellation and cleanup restore the sheet and preserve scrolling and keyboard', async () => {
  const { ctx, page } = await session({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    await gestureFixture(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await pointerDrag(page, '[data-sheet-handle]', 150, 'pointercancel');
    assert.equal(await page.locator('#gesture-fixture .v-info').evaluate(element => element.style.transform), '');
    assert.equal(await page.locator('#gesture-fixture .v-info').evaluate(element => element.getAnimations().length), 0);
    await page.locator('#fixture-close').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#fixture-close').evaluate(element => document.activeElement === element), true);
    const info = page.locator('#gesture-fixture .v-info');
    const box = await info.boundingBox();
    const touch = await ctx.newCDPSession(page);
    const x = box.x + box.width / 2, y = box.y + box.height * .7;
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let step = 1; step <= 5; step++) {
      await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y - step * 35 }] });
      await page.waitForTimeout(20);
    }
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(120);
    assert.ok(await info.evaluate(element => element.scrollTop) > 0, 'normal content retains native touch scrolling');
    await info.evaluate(element => element.scrollTop = 0);
    await page.evaluate(() => window.cleanupGestureFixture());
    await pointerDrag(page, '[data-sheet-handle]', 150);
    assert.equal(await page.evaluate(() => window.fixtureCloses), 0, 'cleanup removes gesture listeners');
  } finally { await ctx.close(); }
});
