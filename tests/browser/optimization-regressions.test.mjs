import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
let browser,server,base;
const root=resolve('build');
before(async()=>{
 server=createServer(async(req,res)=>{try{let path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));if(!path.startsWith(root+'/'))throw Error();if((await stat(path)).isDirectory())path+='/index.html';const body=await readFile(path);res.writeHead(200,{'Content-Type':({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2'})[extname(path)]||'application/octet-stream'});res.end(body)}catch{res.writeHead(404);res.end()}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`;browser=await chromium.launch({headless:true});
});
after(async()=>{await browser?.close();await new Promise(r=>server.close(r))});
async function session(reducedMotion='reduce'){const ctx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion});const page=await ctx.newPage();return {ctx,page}}
test('direct place entry prioritizes its photograph and defers the province underlay',async()=>{
 const {ctx,page}=await session();const images=[];page.on('request',r=>{if(r.resourceType()==='image')images.push(new URL(r.url()).pathname)});
 try{await page.goto(base+'/en/province/luang-prabang/kuang-si/');await page.waitForFunction(()=>window.__mvmReady);await page.waitForTimeout(300);
  assert.equal(await page.locator('main .p-hero').count(),0,'a direct place entry must not initialize the hidden province page');
  assert.equal(images.some(p=>/phousi-(960|1600)\.webp/.test(p)),false,'the province hero must not compete with the requested place');
  assert.equal(images.some(p=>/royal-palace-(960|1600)\.webp/.test(p)),false,'a nonadjacent slide must not activate a full image');
  await page.locator('.v-slide.is-active img').first().evaluate(i=>i.decode());
  await page.keyboard.press('ArrowRight');assert.match(page.url(),/pak-ou/);await page.locator('.v-slide.is-active img').first().evaluate(i=>i.decode());
  await page.keyboard.press('Escape');await page.waitForSelector('.p-hero');assert.match(page.url(),/\/province\/luang-prabang\/$/);
 }finally{await ctx.close()}
});
test('the next full hero photograph waits for the current image to finish',async()=>{
 const {ctx,page}=await session('no-preference');let release;const gate=new Promise(r=>release=r);let next=false;
 await ctx.route('**/vang-vieng-1600.webp',async route=>{await gate;await route.continue().catch(()=>{})});
 page.on('request',r=>{if(/phousi-1600\.webp/.test(r.url()))next=true});
 try{await page.goto(base+'/en/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.__mvmReady);await page.waitForTimeout(900);
  assert.equal(next,false,'CPU idle must not start another full image while the hero response is blocked');
  release();await page.locator('#hero-img').evaluate(i=>i.decode());
 }finally{release();await ctx.close()}
});
test('a place overlay pauses the underlying slideshow and preserves a manual pause',async()=>{
 const {ctx,page}=await session('no-preference');
 try{await page.goto(base+'/en/');await page.waitForFunction(()=>window.__mvmReady);await page.locator('[data-slide="4"]').click();await page.waitForFunction(()=>document.querySelector('#hero-img')?.dataset.photo==='kuang-si');
  if(await page.locator('[data-hero-play]').getAttribute('aria-pressed')==='false')await page.locator('[data-hero-play]').click();
  await page.locator('#hero-place-link').click();await page.waitForSelector('.viewer.is-open');
  assert.equal(await page.locator('#home-hero').getAttribute('data-hero-playing'),'false');
  await page.keyboard.press('Escape');
  // Escape is keyboard interaction, so Play may require an explicit action again.
  await page.locator('[data-hero-play]').evaluate(button=>{if(button.getAttribute('aria-pressed')==='true')button.click()});
  await page.locator('#hero-place-link').click();await page.waitForSelector('.viewer.is-open');await page.keyboard.press('Escape');
  assert.equal(await page.locator('[data-hero-play]').getAttribute('aria-pressed'),'false');
 }finally{await ctx.close()}
});
test('IME composition does not rebuild search results until the composition is committed',async()=>{
 const {ctx,page}=await session();
 try{await page.goto(base+'/zh/explore/');await page.waitForFunction(()=>window.__mvmReady);
  await page.locator('#destination-search').evaluate(input=>{input.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));input.value='琅';input.dispatchEvent(new InputEvent('input',{bubbles:true,isComposing:true}));});
  await page.waitForTimeout(180);assert.equal(await page.locator('#search-result-section').isHidden(),true);
  await page.locator('#destination-search').evaluate(input=>{input.value='琅勃拉邦';input.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true}));});
  await page.waitForFunction(()=>!document.querySelector('#search-result-section').hidden);assert.ok(await page.locator('#search-results .discovery-tile').count()>0);
 }finally{await ctx.close()}
});
