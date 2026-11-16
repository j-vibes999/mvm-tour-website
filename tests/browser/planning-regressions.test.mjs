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
test('Home region controls frame the map and keep province links direct',async()=>{
 const {ctx,page,go}=await session();try{await go('/en/');assert.equal(await page.locator('.home-atlas [data-atlas]').count(),1);const map=page.locator('.home-atlas svg.laos-map');const full=await map.getAttribute('viewBox');await page.locator('[data-atlas-region="south"]').click();await page.waitForSelector('.home-atlas .laos-map [data-province="champasak"]');assert.notEqual(await map.getAttribute('viewBox'),full);assert.equal(await page.locator('[data-atlas-region="south"]').getAttribute('aria-pressed'),'true');await map.locator('[data-province="champasak"]').click();assert.match(page.url(),/province\/champasak/);}finally{await ctx.close();}
});
test('month recommendations recover from unknown months and use decoded local images',async()=>{
 const {ctx,page,go}=await session();try{await go('/lo/explore/');assert.equal(await page.locator('[data-month-chooser]').count(),1);await page.locator('[data-month="6"]').click();assert.equal(await page.locator('.season-empty').count(),1);await page.locator('[data-month="1"]').click();assert.ok(await page.locator('.season-card').count()>5);const first=page.locator('.season-card').first();await first.scrollIntoViewIfNeeded();await first.locator('img').evaluate(img=>img.decode());assert.ok(await first.locator('img').evaluate(img=>img.naturalWidth>0));assert.equal(await page.locator('[data-month="1"]').getAttribute('aria-pressed'),'true');await first.click();assert.equal(await page.locator('.viewer.is-open').count(),1);}finally{await ctx.close();}
});
test('day story controls change the visible place and respect reduced motion',async()=>{
 const {ctx,page,go}=await session();try{await go('/zh/');assert.equal(await page.locator('[data-day-story]').count(),1);await page.locator('[data-day-period="4"]').click();assert.match(await page.locator('[data-day-frame] h3').innerText(),/夜市/);assert.equal(await page.locator('[data-day-period="4"]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('[data-day-play]').isDisabled(),true);assert.equal(await page.locator('[data-day-play]').getAttribute('aria-pressed'),'false');}finally{await ctx.close();}
});
test('saved ordering persists, preserves focus and reaches the inquiry in the same order',async()=>{
 const {ctx,page,go}=await session();const refs=['luang-prabang/kuang-si','vientiane-province/vang-vieng','luang-prabang/nong-khiaw'];try{await ctx.addInitScript(refs=>{if(!localStorage.getItem('mvm-saved-places'))localStorage.setItem('mvm-saved-places',JSON.stringify(refs));},refs);await go('/th/saved/');assert.equal(await page.locator('[data-move-saved]').count(),6);await page.locator(`[data-move-saved="${refs[1]}"][data-direction="-1"]`).focus();await page.keyboard.press('Enter');assert.equal(await page.locator('[data-saved-ref]').first().getAttribute('data-saved-ref'),refs[1]);assert.ok(await page.evaluate(()=>document.activeElement.matches('[data-move-saved]')));await page.reload();await page.waitForFunction(()=>window.__mvmReady);assert.equal(await page.locator('[data-saved-ref]').first().getAttribute('data-saved-ref'),refs[1]);assert.equal(await page.locator('.saved-plan-map > svg').count(),1);assert.ok((await page.locator('.saved-map-links a').first().getAttribute('href')).includes('Vang'));await page.locator('.saved-toolbar .btn-primary').click();const names=await page.locator('.inquiry-context li').allTextContents();assert.match(names[0],/วังเวียง/);}finally{await ctx.close();}
});
test('package route summary opens a day with a local photo and real map link',async()=>{
 const {ctx,page,go}=await session();try{await go('/en/package/luang-prabang-discovery/');assert.ok(await page.locator('[data-day-open]').count()>1);await page.locator('[data-day-open="2"]').click();assert.equal(await page.locator('#program-day-2 details').getAttribute('open'),'');assert.equal(await page.locator('#program-day-2 summary').evaluate(el=>el===document.activeElement),true);const image=page.locator('#program-day-2 .day-photo img');await image.evaluate(img=>img.decode());assert.ok(await image.evaluate(img=>img.naturalWidth>0));assert.match(await page.locator('#program-day-2 .daily-map-link').getAttribute('href'),/^https:\/\/www.google.com\/maps\//);}finally{await ctx.close();}
});
test('inquiry groups preserve every draft field through all four locales',async()=>{
 const {ctx,page,go}=await session();try{await go('/th/inquiry/?kind=package&ref=luang-prabang-discovery');assert.equal(await page.locator('.inquiry-group').count(),3);assert.equal(await page.locator('.inquiry-photo-summary img').count(),1);await page.fill('[name="name"]','Traveller');await page.fill('[name="notes"]','Coffee and villages');await page.fill('[name="travelers"]','4');for(const lang of ['lo','en','zh','th']){await page.locator('[data-language-toggle]').click();await page.locator(`[data-lang="${lang}"][data-language-option]`).click();await page.waitForFunction(lang=>document.documentElement.lang===(lang==='zh'?'zh-Hans':lang),lang);assert.equal(await page.locator('[name="name"]').inputValue(),'Traveller');assert.equal(await page.locator('[name="notes"]').inputValue(),'Coffee and villages');assert.equal(await page.locator('[name="travelers"]').inputValue(),'4');}await page.locator('#inquiry-form button[type="submit"]').click();assert.match(await page.locator('#inquiry-message').inputValue(),/Coffee and villages/);}finally{await ctx.close();}
});

test('day-story autoplay advances, pauses and cancels when reduced motion changes',async()=>{
 const {ctx,page,go}=await session({reducedMotion:'no-preference'});try{await go('/en/');await page.locator('[data-day-story]').scrollIntoViewIfNeeded();await page.waitForTimeout(100);await page.clock.install();await page.locator('[data-day-play]').click();await page.clock.fastForward(6700);assert.equal(await page.locator('[data-day-period="1"]').getAttribute('aria-pressed'),'true');await page.locator('[data-day-play]').click();await page.clock.fastForward(7000);assert.equal(await page.locator('[data-day-period="1"]').getAttribute('aria-pressed'),'true');await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>document.querySelector('[data-day-play]')?.disabled);assert.equal(await page.locator('[data-day-play]').isDisabled(),true);}finally{await ctx.close();}
});

test('saved handles support dragging and long route lists retain the final stop',async()=>{
 const {provinces}=await import('../../dist/content.js'),refs=provinces.flatMap(pv=>pv.places.map(pl=>`${pv.id}/${pl.id}`)).slice(0,12);
 const {ctx,page,go}=await session();try{await ctx.addInitScript(refs=>localStorage.setItem('mvm-saved-places',JSON.stringify(refs)),refs);await go('/en/saved/');const first=page.locator(`[data-saved-drag="${refs[0]}"]`),last=page.locator(`[data-saved-ref="${refs[2]}"]`);await first.dragTo(last);assert.deepEqual(await page.locator('[data-saved-ref]').evaluateAll(nodes=>nodes.slice(0,3).map(n=>n.dataset.savedRef)),[refs[1],refs[2],refs[0]]);const hrefs=await page.locator('.saved-map-links a').evaluateAll(nodes=>nodes.map(n=>n.href));assert.equal(hrefs.length,3);const C=await import('../../dist/content.js');assert.ok(decodeURIComponent(hrefs.at(-1)).includes(C.findPlace(refs.at(-1)).place.name.en));}finally{await ctx.close();}
});
test('the real mobile viewer closes only when its dedicated handle is dragged far enough',async()=>{
 const {ctx,page,go}=await session({viewport:{width:390,height:844},isMobile:true,hasTouch:true});try{await go('/en/province/luang-prabang/kuang-si/');const handle=page.locator('.v-slide.is-active [data-sheet-handle]');assert.equal(await handle.count(),1);for(const [type,y]of [['pointerdown',100],['pointermove',250],['pointerup',250]])await handle.dispatchEvent(type,{pointerId:9,pointerType:'touch',isPrimary:true,button:0,clientX:100,clientY:y});await page.waitForURL('**/en/province/luang-prabang/');assert.equal(await page.locator('.viewer.is-open').count(),0);}finally{await ctx.close();}
});
