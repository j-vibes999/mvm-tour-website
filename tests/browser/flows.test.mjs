import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
let browser,server,base;
const root=resolve('build');
before(async()=>{
 server=createServer(async(req,res)=>{try{let path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));if(!path.startsWith(root+'/')&&path!==root)throw Error();if((await stat(path)).isDirectory())path+='/index.html';const data=await readFile(path);res.writeHead(200,{'Content-Type':({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2'})[extname(path)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}`;browser=await chromium.launch({headless:true});
});
after(async()=>{await browser?.close();await new Promise(r=>server.close(r));});
async function session(options={}){const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',...options});const page=await ctx.newPage();page.setDefaultTimeout(5000);return{ctx,page,go:async path=>{await page.goto(base+path);await page.waitForFunction(()=>document.querySelector('#main')?.dataset.view);}};}
async function chooseLanguage(page,lang){
 const trigger=page.locator('[data-language-toggle]');
 assert.equal(await trigger.isVisible(),true);
 await trigger.click();
 assert.equal(await trigger.getAttribute('aria-expanded'),'true');
 await page.locator(`[data-language-option][data-lang="${lang}"]`).click();
 assert.equal(await page.locator('#language-options').isHidden(),true);
 assert.equal(await trigger.getAttribute('aria-expanded'),'false');
 // Lao and Chinese load their reviewed catalogue on first use; wait until the page has switched.
 await page.waitForFunction(tag=>document.documentElement.lang===tag&&!document.querySelector('[data-language-toggle][aria-busy]'),lang==='zh'?'zh-Hans':lang);
}

test('saved places update mobile planning context and survive reload',async()=>{
 const {ctx,page,go}=await session({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{await go('/th/explore/?q=Kuang+Si');await page.locator('#search-results [data-save]').first().click();await page.locator('#mobile-bar .btn-primary').click();assert.match(page.url(),/kind=saved/);assert.match(await page.locator('.inquiry-context').innerText(),/กวางสี/);await go('/th/saved/');assert.equal(await page.locator('.discovery-tile').count(),1);await page.reload();assert.equal(await page.locator('.discovery-tile').count(),1);}finally{await ctx.close();}
});
test('saved list refreshes after removing a place inside the viewer',async()=>{
 const {ctx,page,go}=await session();try{await go('/th/province/luang-prabang/kuang-si/');await page.locator('.v-slide.is-active [data-save]').click();await page.keyboard.press('Escape');await page.locator('.saved-link').click();await page.locator('.discovery-tile h3 a').click();await page.locator('.v-slide.is-active [data-save]').click();await page.keyboard.press('Escape');await page.waitForURL('**/th/saved/');assert.equal(await page.locator('.discovery-tile').count(),0);assert.equal(await page.locator('.planner-empty').count(),1);}finally{await ctx.close();}
});
test('footer and repeated planning actions preserve the selected package',async()=>{
 const {ctx,page,go}=await session();try{await go('/th/package/luang-prabang-discovery/');await page.locator('#contact .contact-actions').getByRole('link').first().click();assert.match(page.url(),/ref=luang-prabang-discovery/);await page.locator('.header-actions [data-scroll="contact"]').click();assert.match(page.url(),/ref=luang-prabang-discovery/);}finally{await ctx.close();}
});
test('package All clears prior region and scoped province; sorting and length work',async()=>{
 const {ctx,page,go}=await session();
 const prices=()=>page.locator('#pkg-grid .card-price .price strong').allTextContents().then(values=>values.map(value=>Number(value.replace(/[^0-9]/g,''))));
 try{
  await go('/th/packages/');
  const allCount=await page.locator('#pkg-grid > article').count();
  await page.locator('[data-pkg-region="south"]').click();
  assert.equal(await page.locator('#pkg-grid > article').count(),1);
  await page.locator('.desktop-nav a[href="/th/explore/"]').click();
  await page.locator('[data-province-card="luang-prabang"]').click();
  await page.locator('a[href="/th/packages/?province=luang-prabang"]').first().click();
  await page.locator('.package-tools a[href="/th/packages/"]').click();
  assert.equal(await page.locator('#pkg-grid > article').count(),allCount);
  await page.selectOption('#pkg-days','long');
  assert.equal(await page.locator('#pkg-grid > article').count(),1);
  await page.selectOption('#pkg-days','all');
  await page.selectOption('#pkg-sort','price-high');
  const descending=await prices();
  assert.deepEqual(descending,[...descending].sort((a,b)=>b-a));
  await page.selectOption('#pkg-sort','price-low');
  assert.deepEqual(await prices(),[...descending].reverse());
 }finally{await ctx.close();}
});
test('inquiry prepares a real downloadable draft, preserves locale and sends nothing',async()=>{
 const {ctx,page,go}=await session();try{await go('/th/inquiry/?kind=package&ref=luang-prabang-discovery');await page.fill('[name="name"]','Test Traveller');await page.fill('[name="travelers"]','4');await page.fill('[name="date"]','2027-01-10');await page.fill('[name="notes"]','<script>window.injected=1</script> relaxed pace');await page.locator('#inquiry-form button[type="submit"]').click();let message=await page.locator('#inquiry-message').inputValue();assert.match(message,/หลวงพระบาง/);assert.match(message,/4/);assert.match(message,/2027-01-10/);assert.match(message,/ตัวอย่าง/);assert.equal(await page.evaluate(()=>window.injected),undefined);assert.equal(await page.locator('#inquiry-channels a').count(),0);const downloadEvent=page.waitForEvent('download');await page.locator('[data-download-inquiry]').click();const file=await downloadEvent;assert.match(await readFile(await file.path(),'utf8'),/relaxed pace/);await chooseLanguage(page,'en');assert.match(page.url(),/\/en\/inquiry\//);message=await page.locator('#inquiry-message').inputValue();assert.match(message,/Luang Prabang/);assert.match(message,/not a booking/);assert.equal(await page.locator('[name="name"]').inputValue(),'Test Traveller');assert.equal(await page.evaluate(()=>Object.values(localStorage).some(v=>v.includes('Test Traveller'))),false);}finally{await ctx.close();}
});
test('search aliases, experience filter, reset and hostile query are safe',async()=>{
 const {ctx,page,go}=await session();try{await go('/en/explore/');await page.fill('#destination-search','VANG-VIENG');await page.waitForFunction(()=>new URL(location.href).searchParams.get('q')==='VANG-VIENG');assert.ok(await page.locator('#search-results .discovery-tile').count()>0);assert.equal(await page.locator('#province-browser').isHidden(),true);await page.locator('[data-clear-search]').first().click();await page.selectOption('#interest-filter','waterfall');assert.ok(await page.locator('#search-results .discovery-tile').count()>0);await page.fill('#destination-search','<img src=x onerror="window.injected=1">');await page.waitForFunction(()=>new URL(location.href).searchParams.get('q')==='<img src=x onerror="window.injected=1">');assert.equal(await page.evaluate(()=>window.injected),undefined);assert.equal(await page.locator('#search-results .discovery-tile').count(),0);await page.locator('[data-clear-search]').first().click();assert.equal(await page.locator('#province-browser').isVisible(),true);}finally{await ctx.close();}
});
test('adjacent map preview stays usable and Escape dismisses it without moving focus',async()=>{
 const {ctx,page,go}=await session();try{await go('/th/explore/');const trigger=page.locator('.laos-map [data-province="luang-prabang"]').first(),preview=page.locator('.map-preview').first();await trigger.focus();await page.waitForSelector('.map-preview a');await page.keyboard.press('Escape');assert.equal(await preview.locator('a').count(),0);assert.equal(await trigger.evaluate(e=>e===document.activeElement),true);await page.locator('#destination-search').focus();await trigger.focus();await page.waitForSelector('.map-preview a');const box=await preview.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.waitForTimeout(230);assert.equal(await preview.locator('a').isVisible(),true);await preview.locator('a').click();assert.match(page.url(),/province\/luang-prabang/);}finally{await ctx.close();}
});
test('landscape menu scrolls every action above the fixed bottom bar',async()=>{
 const {ctx,page,go}=await session({viewport:{width:844,height:390},isMobile:true,hasTouch:true});try{await go('/th/');await page.locator('.menu-btn').click();const nav=page.locator('#mobile-nav'),bar=page.locator('#mobile-bar');assert.ok((await nav.boundingBox()).y+(await nav.boundingBox()).height<=(await bar.boundingBox()).y+1);await page.locator('#mobile-nav .btn').click();assert.match(page.url(),/\/inquiry\//);}finally{await ctx.close();}
});
test('viewer arrows, focus return and browser Back/Forward preserve public URLs',async()=>{
 const {ctx,page,go}=await session();try{await go('/en/province/luang-prabang/');const card=page.locator('[data-place-ref="luang-prabang/kuang-si"]');await card.click();await page.keyboard.press('ArrowRight');assert.match(page.url(),/\/en\/province\/luang-prabang\/pak-ou\//);await page.keyboard.press('ArrowLeft');await page.keyboard.press('Escape');assert.equal(await page.locator('.viewer.is-open').count(),0);assert.equal(await card.evaluate(e=>e===document.activeElement),true);await page.goForward();assert.equal(await page.locator('.viewer.is-open').count(),1);assert.match(page.url(),/kuang-si/);assert.match(await page.locator('meta[property="og:url"]').getAttribute('content'),/\/en\/province\/luang-prabang\/kuang-si\//);}finally{await ctx.close();}
});
test('legacy deep links migrate and image failures show a readable fallback',async()=>{
 const {ctx,page,go}=await session();try{await go('/#/province/luang-prabang/kuang-si');assert.match(page.url(),/\/en\/province\/luang-prabang\/kuang-si\/$/);assert.equal(new URL(page.url()).hash,'');await ctx.route('**/assets/images/photos/**',route=>route.abort());await go('/en/province/phongsaly/');await page.waitForSelector('.p-hero .image-unavailable');assert.match(await page.locator('.p-hero .image-unavailable').innerText(),/unavailable/);}finally{await ctx.close();}
});
test('new surfaces reflow at 320px and 768px in both languages without runtime errors',async()=>{
 const {ctx,page,go}=await session();const errors=[];page.on('pageerror',e=>errors.push(e.message));try{for(const width of [320,768]){await page.setViewportSize({width,height:844});for(const lang of ['th','en'])for(const route of ['','explore/?q=Kuang+Si','inquiry/?kind=package&ref=luang-prabang-discovery','package/champasak-discovery/','about/']){await go(`/${lang}/${route}`);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width} ${lang} ${route}`);}}assert.deepEqual(errors,[]);}finally{await ctx.close();}
});
test('deep public pages expose distinct content and metadata without JavaScript',async()=>{
 const {ctx,page,go}=await session({javaScriptEnabled:false});try{await page.goto(base+'/en/province/luang-prabang/kuang-si/');assert.match(await page.locator('main').innerText(),/Kuang Si/);assert.match(await page.title(),/Kuang Si/);assert.match(await page.locator('link[rel="canonical"]').getAttribute('href'),/\/en\/province\/luang-prabang\/kuang-si\//);assert.ok(await page.locator('main a[href^="/en/"]').count()>0);}finally{await ctx.close();}
});

test('documented real company fields render when supplied, and empty fields stay hidden',async()=>{
 const {ctx,page,go}=await session();try{await go('/en/about/');assert.equal(await page.getByRole('heading',{name:'The people behind your journey'}).count(),0);await page.evaluate(async()=>{const C=await import('/content.js');Object.assign(C.companyProfile.ownerData,{legalName:'Fixture Company',registration:'Fixture 001',serviceAreas:{th:['พื้นที่ทดสอบ'],en:['Fixture service area']},team:[{name:{th:'ทีมทดสอบ',en:'Fixture team'},role:{th:'บทบาททดสอบ',en:'Fixture role'},image:''}],fleet:[{title:{th:'รถทดสอบ',en:'Fixture vehicle'},description:{th:'คำอธิบายทดสอบ',en:'Fixture description'},image:''}],reviews:[{name:'Fixture traveller',text:{th:'รีวิวทดสอบ',en:'Fixture review'},sourceUrl:'https://example.com/verified-review'}]});});await page.locator('.desktop-nav a[href="/en/explore/"]').click();await page.locator('.desktop-nav a[href="/en/about/"]').click();const text=await page.locator('main').innerText();for(const value of ['Fixture Company','Fixture service area','Fixture team','Fixture vehicle','Fixture review'])assert.ok(text.includes(value),value);assert.equal(await page.locator('a[href="https://example.com/verified-review"]').count(),1);}finally{await ctx.close();}
});

test('unknown client routes keep their not-found state out of search indexing',async()=>{
 const {ctx,page,go}=await session();try{await go('/en/');await page.evaluate(()=>{history.pushState({},'','/en/missing-place/');window.dispatchEvent(new PopStateEvent('popstate'));});assert.match(await page.locator('meta[name="robots"]').getAttribute('content'),/noindex/);assert.match(await page.title(),/Page not found/);}finally{await ctx.close();}
});

test('all 86 place viewers load local images and disclose generated illustrations',async()=>{
 const {provinces,photos:originalPhotos}=await import('../../dist/content.js');
 const {extraPhotos,placePhotos}=await import('../../dist/complete-media.js');
 const photos={...originalPhotos,...extraPhotos};
 const {ctx,page,go}=await session({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));let count=0;
 try{
  for(const province of provinces)for(const place of province.places){
   const ref=`${province.id}/${place.id}`,key=place.photo||placePhotos[ref]||place.image;
   assert.ok(key,`${ref}: image key`);
   await go(`/th/province/${ref}/`);
   await page.waitForFunction(()=>{const image=document.querySelector('.v-slide.is-active .v-media>img');return image?.complete&&image.naturalWidth>0;});
   const active=page.locator('.v-slide.is-active .v-media');
   assert.equal(await active.locator('.visual-fallback,.image-unavailable').count(),0,`${ref}: no placeholder`);
   assert.ok((await active.locator('img').getAttribute('src')).startsWith('assets/images/'),`${ref}: hosted local asset`);
   assert.equal(await active.locator('.generated-badge').count(),photos[key]?.kind==='generated'?1:0,`${ref}: correct image label`);
   if(photos[key]?.kind==='generated')assert.match(await active.innerText(),/ภาพประกอบ AI/);
   if(place===province.places[0]){
    const thumbs=page.locator('.v-rail .v-thumb');
    assert.equal(await thumbs.count(),province.places.length);
    for(let index=0;index<province.places.length;index++){
     const button=thumbs.nth(index);await button.scrollIntoViewIfNeeded();
     await page.waitForFunction(index=>{const button=document.querySelectorAll('.v-rail .v-thumb')[index];return button?.querySelector('.image-unavailable')||button?.querySelector('img')?.complete;},index);
     assert.equal(await button.locator('.image-unavailable').count(),0,`${ref}: thumbnail ${index} available`);
     assert.ok(await button.locator('img').evaluate(image=>image.naturalWidth>0),`${ref}: thumbnail ${index} decoded`);
    }
   }
   count++;
  }
  assert.equal(count,86);assert.deepEqual(errors,[]);
 }finally{await ctx.close();}
});

test('AI card labels stay readable and source links bring the selected credit into view',async()=>{
 const {ctx,page,go}=await session({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{
  for(const lang of ['th','en']){
   await go(`/${lang}/province/bolikhamxay/`);
   const card=page.locator('[data-place-ref="bolikhamxay/ban-na-tower"]');
   await card.scrollIntoViewIfNeeded();
   const badge=await card.locator('.generated-badge').boundingBox(),chip=await card.locator('.chip-glass').boundingBox();
   assert.ok(badge&&chip);
   const overlap=Math.max(0,Math.min(badge.x+badge.width,chip.x+chip.width)-Math.max(badge.x,chip.x))*Math.max(0,Math.min(badge.y+badge.height,chip.y+chip.height)-Math.max(badge.y,chip.y));
   assert.equal(overlap,0,`${lang}: AI label unobscured`);
   await card.click();
   assert.match(await page.locator('meta[property="og:image:alt"]').getAttribute('content'),lang==='th'?/ภาพประกอบ AI/:/AI illustration/);
   await page.locator('.v-slide.is-active .v-credit a').click();
   await page.waitForURL(`**/${lang}/credits/?image=nc-ban-na-tower`);
   await page.waitForFunction(()=>{const row=document.querySelector('.credit-selected');if(!row)return false;const rect=row.getBoundingClientRect();return rect.top>=0&&rect.bottom<=innerHeight&&row===document.activeElement;});
   assert.match(await page.locator('.credit-selected').innerText(),lang==='th'?/ไม่ใช่ภาพถ่ายหน้างาน/:/not an on-location photograph/);
  }
 }finally{await ctx.close();}
});

test('a failed thumbnail keeps the viewer navigation compact and the main image available',async()=>{
 const {ctx,page,go}=await session({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{
  // The responsive main image and thumbnail can use the same cached file; fail the thumbnail independently.
  await ctx.route('**/__failed_viewer_thumb.webp',route=>route.abort());
  await go('/en/province/attapeu/saysettha-stupa/');
  await page.locator('.v-rail .v-thumb img').first().evaluate(image=>{image.removeAttribute('srcset');image.src='/__failed_viewer_thumb.webp';});
  await page.waitForSelector('.v-rail .image-unavailable');
  assert.ok((await page.locator('.v-rail').boundingBox()).height<=100,'failed thumbnail must not expand the navigation rail');
  await page.waitForFunction(()=>{const image=document.querySelector('.v-slide.is-active .v-media>img');return image?.complete&&image.naturalWidth>0;});
 }finally{await ctx.close();}
});

test('place practical details start closed, expand by keyboard and keep planning context',async()=>{
 const {ctx,page,go}=await session({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{
  await go('/en/province/luang-prabang/kuang-si/');
  const active=page.locator('.v-slide.is-active'),details=active.locator('details.place-more'),summary=details.locator('summary');
  assert.equal(await details.count(),1,'practical details must have a disclosure');
  assert.equal(await details.evaluate(el=>el.open),false);
  assert.equal(await active.locator('.v-facts').isVisible(),false);
  await summary.focus();await page.keyboard.press('Enter');
  assert.equal(await details.evaluate(el=>el.open),true);
  assert.equal(await active.locator('.v-facts').isVisible(),true);
  await active.locator('.v-quick-actions a').click();assert.match(page.url(),/kind=place&ref=luang-prabang%2Fkuang-si/);
 }finally{await ctx.close();}
});

test('package price is reachable before the expandable daily program and activities',async()=>{
 const {ctx,page,go}=await session({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{
  await go('/en/package/luang-prabang-discovery/');
  const panel=page.locator('.price-panel'),days=page.locator('.daily-itinerary details');
  assert.ok((await panel.boundingBox()).y<700,'price must be available near the mobile overview');
  assert.equal(await days.count(),3);
  assert.equal(await days.nth(0).evaluate(el=>el.open),true);
  assert.equal(await days.nth(1).evaluate(el=>el.open),false);
  await days.nth(1).locator('summary').focus();await page.keyboard.press('Enter');
  assert.equal(await days.nth(1).evaluate(el=>el.open),true);
  assert.ok(await days.nth(1).locator('.day-activities li').count()>0,'daily activities remain available on expansion');
  assert.ok(await days.nth(1).locator('a[href="/en/province/luang-prabang/kuang-si/"]').isVisible());
  await panel.locator('[data-inquiry="package"]').click();assert.match(page.url(),/ref=luang-prabang-discovery/);
 }finally{await ctx.close();}
});

test('the five compact destination cards open their own complete programs',async()=>{
 const {ctx,page,go}=await session();
 const expected=[['vientiane-capital-discovery','นครหลวงเวียงจันทน์'],['vang-vieng-nature','วังเวียง'],['luang-prabang-discovery','หลวงพระบาง'],['nong-khiaw-discovery','หนองเขียว'],['muang-ngoi-discovery','เมืองงอย']];
 try{
  await go('/th/packages/');const cards=page.locator('#pkg-grid > article');
  assert.ok(await cards.count()>=5);
  for(let index=0;index<expected.length;index++){
   const [id,name]=expected[index],card=cards.nth(index);assert.equal(await card.locator('h3').innerText(),name);
   assert.ok(await card.locator('a.package-card-cta').getAttribute('href')===`/th/package/${id}/`);
  }
  for(const [id,name]of expected){
   await go('/th/packages/');await page.locator(`#pkg-grid a.package-card-cta[href="/th/package/${id}/"]`).click();
   await page.waitForURL(`**/th/package/${id}/`);assert.match(await page.locator('h1').innerText(),new RegExp(name));
   const days=page.locator('.daily-itinerary details');assert.ok(await days.count()>=2);
   for(let index=0;index<await days.count();index++){if(!await days.nth(index).evaluate(el=>el.open))await days.nth(index).locator('summary').click();assert.equal(await days.nth(index).evaluate(el=>el.open),true);assert.ok(await days.nth(index).locator('.day-activities li').count()>0);}
   await page.locator('.price-panel [data-inquiry="package"]').click();assert.ok(new URL(page.url()).searchParams.get('ref')===id);
  }
 }finally{await ctx.close();}
});

test('mobile menu closes on its current page and when focus leaves the header',async()=>{
 const {ctx,page,go}=await session({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{
  await go('/th/');
  await page.locator('.menu-btn').click();
  await page.locator('#mobile-nav a[href="/th/"]').focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>document.querySelector('#mobile-nav').hidden);
  assert.equal(await page.locator('.menu-btn').getAttribute('aria-expanded'),'false');
  assert.equal(await page.locator('.menu-btn').evaluate(el=>el===document.activeElement),true);
  await page.locator('.menu-btn').click();
  assert.equal(await page.locator('.menu-btn').getAttribute('aria-expanded'),'true');
  await page.locator('#main').focus();
  await page.waitForFunction(()=>document.querySelector('#mobile-nav').hidden);
  await page.locator('.menu-btn').click();await page.keyboard.press('Escape');
  assert.equal(await page.locator('.menu-btn').getAttribute('aria-expanded'),'false');
  assert.equal(await page.locator('.menu-btn').evaluate(el=>el===document.activeElement),true);
 }finally{await ctx.close();}
});

test('page orientation controls reset on navigation and return keyboard focus to content',async()=>{
 const {ctx,page,go}=await session({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{
  await go('/en/packages/');
  // On phones the button appears while the reader heads back up, not while reading down.
  await page.evaluate(()=>scrollTo(0,1600));
  await page.waitForFunction(()=>scrollY>=1500);
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  assert.equal(await page.locator('.back-to-top').isHidden(),true,'hidden while scrolling down');
  await page.evaluate(()=>scrollTo(0,1100));
  await page.waitForSelector('.back-to-top:not([hidden])');
  assert.equal(await page.locator('.back-to-top').getAttribute('aria-label'),'Back to top');
  const progress=await page.locator('.journey-progress-fill').evaluate(el=>getComputedStyle(el).transform);
  assert.notEqual(progress,'matrix(0, 0, 0, 1, 0, 0)');
  await page.locator('.back-to-top').focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>scrollY===0);
  assert.equal(await page.locator('#main').evaluate(el=>el===document.activeElement),true);
  await page.locator('#pkg-grid .package-card-cta').first().click();
  await page.waitForURL('**/en/package/vientiane-capital-discovery/');
  assert.equal(await page.locator('.back-to-top').isHidden(),true);
 }finally{await ctx.close();}
});

test('submitting an explore search moves keyboard focus to the visible results heading',async()=>{
 const {ctx,page,go}=await session({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{
  await go('/en/explore/');
  await page.fill('#destination-search','Kuang Si');
  await page.locator('#explore-search button[type="submit"]').focus();
  await page.keyboard.press('Enter');
  const heading=page.locator('#search-results-title');
  assert.ok(await page.locator('#search-results .discovery-tile').count()>0);
  assert.equal(await heading.evaluate(el=>el===document.activeElement),true,'submitted results should receive keyboard focus');
  assert.equal(await heading.evaluate(el=>{const rect=el.getBoundingClientRect();return rect.top>=0&&rect.bottom<=innerHeight;}),true,'focused results heading should remain in the viewport');
 }finally{await ctx.close();}
});

test('a queued viewer scroll cannot replace the inquiry route after leaving the viewer',async()=>{
 const {ctx,page,go}=await session({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{
  await go('/en/province/luang-prabang/kuang-si/');
  await page.evaluate(()=>{
   const track=document.querySelector('.v-track');
   track.scrollLeft=2*track.clientWidth;
   track.dispatchEvent(new Event('scroll',{bubbles:true}));
   document.querySelector('.v-slide.is-active .v-quick-actions a').click();
  });
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const url=new URL(page.url());
  assert.equal(url.pathname,'/en/inquiry/','leaving the viewer should retain the destination route');
  assert.equal(url.searchParams.get('kind'),'place');
  assert.equal(url.searchParams.get('ref'),'luang-prabang/kuang-si');
  assert.match(await page.locator('.inquiry-context').innerText(),/Kuang Si/);
  assert.equal(await page.locator('.viewer.is-open').count(),0);
  assert.deepEqual(errors,[]);
 }finally{await ctx.close();}
});

test('photo strip scrolls with mouse and touch without selecting a photograph, then opens a credited photo',async()=>{
 const {slides}=await import('../../dist/content.js');
 for(const mobile of [false,true]){
  const {ctx,page,go}=await session(mobile?{viewport:{width:390,height:844},isMobile:true,hasTouch:true}:{});
  try{
   await go('/en/');
   const rail=page.locator('.slide-picker');
   await rail.scrollIntoViewIfNeeded();
   const initial=await page.locator('#hero-img').getAttribute('src');
   const selected=await page.locator('[data-slide][aria-pressed="true"]').getAttribute('data-slide');
   const box=await rail.boundingBox(),start=box.x+box.width*.8,end=box.x+box.width*.2,y=box.y+35;
   if(mobile){
    const input=await ctx.newCDPSession(page);
    await input.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:start,y,id:0}]});
    for(let step=1;step<=8;step++)await input.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start+(end-start)*step/8,y,id:0}]});
    await input.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await input.detach();
   }else{
    await page.mouse.move(start,y);await page.mouse.down();await page.mouse.move(end,y,{steps:12});await page.mouse.up();
   }
   await page.waitForFunction(()=>document.querySelector('.slide-picker').scrollLeft>50);
   await page.waitForFunction(()=>document.querySelector('#home-hero').getAttribute('aria-busy')==='false');
   assert.equal(await page.locator('[data-slide][aria-pressed="true"]').getAttribute('data-slide'),selected,`${mobile?'touch swipe':'mouse drag'} should browse the rail without selecting a slide`);
   assert.equal(await page.locator('#hero-img').getAttribute('src'),initial);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'the photo rail should scroll inside the page');
   if(mobile){
    const last=slides.at(-1),index=slides.length-1;
    await page.locator(`[data-slide="${index}"]`).tap();
    await page.waitForFunction(index=>document.querySelector(`[data-slide="${index}"]`).getAttribute('aria-pressed')==='true',index);
    assert.equal(await page.locator('#hero-img').getAttribute('data-photo'),last.photo);
    assert.equal(await page.locator('#hero-img').evaluate(el=>el.naturalWidth>0),true);
    assert.equal(await page.locator('#hero-place-link').getAttribute('href'),`/en/province/${last.placeRef}/`);
    assert.equal(await page.locator('[data-hero-credit]').getAttribute('href'),`/en/credits/?image=${last.photo}`);
    assert.equal(await page.locator('[data-hero-credit]').isVisible(),true);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'the selected photo and its controls should remain within the page');
   }
  }finally{await ctx.close();}
 }
});

test('desktop slideshow advances while the pointer stays on Play and stops after Pause',async()=>{
 const {ctx,page,go}=await session({reducedMotion:'no-preference'});
 try{
  await page.clock.install();
  await go('/en/');
  const play=page.locator('[data-hero-play]');
  // Start from a user-selected paused state, regardless of the initial preference.
  if(await play.getAttribute('aria-pressed')==='true')await play.click();
  await page.waitForFunction(()=>document.querySelector('#hero-img').complete&&document.querySelector('#hero-img').naturalWidth>0);
  const initial=await page.locator('#hero-img').getAttribute('src');
  const selected=await page.locator('[data-slide][aria-pressed="true"]').getAttribute('data-slide');
  await play.click();
  assert.equal(await play.getAttribute('aria-pressed'),'true');
  assert.equal(await play.evaluate(el=>el.matches(':hover')),true,'the pointer should remain over the control during playback');
  await page.clock.fastForward(8100);
  await page.waitForFunction(({initial,selected})=>document.querySelector('#hero-img').getAttribute('src')!==initial&&document.querySelector('[data-slide][aria-pressed="true"]').dataset.slide!==selected,{initial,selected});
  assert.equal(await page.locator('#hero-img').evaluate(el=>el.naturalWidth>0),true);
  await play.click();
  assert.equal(await play.getAttribute('aria-pressed'),'false');
  const paused=await page.locator('#hero-img').getAttribute('src');
  const pausedSelection=await page.locator('[data-slide][aria-pressed="true"]').getAttribute('data-slide');
  await page.clock.fastForward(16000);
  assert.equal(await page.locator('#hero-img').getAttribute('src'),paused,'Pause should prevent further photograph changes');
  assert.equal(await page.locator('[data-slide][aria-pressed="true"]').getAttribute('data-slide'),pausedSelection);
  assert.match(await play.getAttribute('aria-label'),/Play/);
  assert.equal((await play.innerText()).trim(),'','the icon control should retain an accessible name without a visible label');
 }finally{await ctx.close();}
});

test('hero keeps its current photograph on failure and accepts the latest rapid selection',async()=>{
 const {slides}=await import('../../dist/content.js');
 const {localPhotos}=await import('../../dist/complete-media.js');
 const imageStem=slide=>slide.photo?localPhotos[slide.photo].src.replace(/-\d+\.webp$/,''):`assets/images/${slide.image}`;
 const {ctx,page,go}=await session();
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{
  await go('/en/');
  assert.equal(await page.locator('[data-hero-play]').getAttribute('aria-pressed'),'false');
  const initial=await page.locator('#hero-img').getAttribute('src');
  const failedPattern=`**/${imageStem(slides[1])}-*.webp`;
  await ctx.route(failedPattern,route=>route.abort());
  await page.locator('[data-slide="1"]').click();
  await page.waitForFunction(()=>document.querySelector('#home-hero').getAttribute('aria-busy')==='false');
  assert.equal(await page.locator('#hero-img').getAttribute('src'),initial);
  assert.equal(await page.locator('[data-slide="0"]').getAttribute('aria-pressed'),'true');
  assert.equal(await page.locator('#hero-img').evaluate(el=>el.naturalWidth>0),true);
  await ctx.unroute(failedPattern);
  await page.locator('[data-slide="3"]').click();
  await page.locator('[data-slide="1"]').click();
  await page.locator('[data-slide="2"]').click();
  await page.waitForFunction(()=>document.querySelector('[data-slide="2"]').getAttribute('aria-pressed')==='true');
  assert.ok((await page.locator('#hero-img').getAttribute('src')).includes(`${imageStem(slides[2])}-`));
  assert.match(await page.locator('#hero-place-link').getAttribute('href'),new RegExp(slides[2].provinceId));
  assert.equal(await page.locator('.hero-incoming').count(),0);
  await page.locator('.desktop-nav a[href="/en/packages/"]').click();
  assert.equal(await page.locator('.hero-incoming').count(),0);
  assert.deepEqual(errors,[]);
 }finally{await ctx.close();}
});

test('touch slideshow starts automatically and pauses offscreen and on reduced-motion changes',async()=>{
 const {ctx,page,go}=await session({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'no-preference'});
 try{
  await page.clock.install();
  await go('/en/');
  assert.equal(await page.locator('[data-hero-play]').getAttribute('aria-pressed'),'true');
  await page.waitForFunction(()=>document.querySelector('#home-hero').dataset.heroPlaying==='true');
  await page.evaluate(()=>scrollTo(0,1500));
  await page.waitForFunction(()=>document.querySelector('#home-hero').dataset.heroPlaying==='false');
  const offscreen=await page.locator('#hero-img').getAttribute('src');
  await page.clock.fastForward(16000);
  assert.equal(await page.locator('#hero-img').getAttribute('src'),offscreen,'offscreen slides should not advance');
  await page.evaluate(()=>scrollTo(0,0));
  await page.waitForFunction(()=>document.querySelector('#home-hero').dataset.heroPlaying==='true');
  await page.clock.fastForward(8100);
  await page.waitForFunction(previous=>document.querySelector('#hero-img').getAttribute('src')!==previous,offscreen);
  await page.waitForFunction(()=>document.querySelector('#home-hero').getAttribute('aria-busy')==='false');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.querySelector('[data-hero-play]').getAttribute('aria-pressed')==='false');
  const reduced=await page.locator('#hero-img').getAttribute('src');
  await page.clock.fastForward(16000);
  assert.equal(await page.locator('#hero-img').getAttribute('src'),reduced,'a live reduced-motion preference should stop automatic image changes');
  await page.locator('[data-slide="1"]').focus();await page.keyboard.press('ArrowRight');
  await page.waitForFunction(()=>document.querySelector('[data-slide="2"]').getAttribute('aria-pressed')==='true');
  assert.equal(await page.locator('.hero-incoming').count(),0);
 }finally{await ctx.close();}
});

test('disclosures survive rapid taps, keyboard reversal and a live reduced-motion change',async()=>{
 const {ctx,page,go}=await session({reducedMotion:'no-preference'});
 try{
  await go('/en/faq/');
  const details=page.locator('.faq-item').first(),summary=details.locator('summary');
  await summary.click();await summary.click();
  await page.waitForFunction(()=>!document.querySelector('.faq-item').open);
  assert.equal(await details.evaluate(el=>el.style.overflow),'');
  await summary.click();await page.keyboard.press('Enter');
  assert.equal(await details.evaluate(el=>el.open),false);
  await summary.click();await summary.evaluate(el=>el.click());
  assert.equal(await details.evaluate(el=>el.open),false,'native activation must not be reversed by an older animation');
  await summary.click();await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.querySelector('.faq-item').getAnimations().every(animation=>animation.playState!=='running'));
  assert.equal(await details.evaluate(el=>el.open),true);
  assert.equal(await details.evaluate(el=>el.style.overflow),'');
  await page.keyboard.press('Enter');assert.equal(await details.evaluate(el=>el.open),false);
 }finally{await ctx.close();}
});

test('keyboard browsing retains focus inside the incoming place slide',async()=>{
 const {ctx,page,go}=await session({reducedMotion:'no-preference'});
 try{
  await go('/en/province/luang-prabang/kuang-si/');
  await page.locator('.v-slide.is-active .place-more summary').focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('.v-slide.is-active .v-title').evaluate(el=>el===document.activeElement),true);
  assert.equal(await page.locator('.v-track').evaluate(el=>Math.abs(el.scrollLeft-el.clientWidth*Number(el.querySelector('.is-active').dataset.index))<2),true);
 }finally{await ctx.close();}
});


test('home discovery city cards open the selected place and preserve the chosen language',async()=>{
 const {ctx,page,go}=await session({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const expected=[['vientiane-capital','vientiane-capital'],['vang-vieng','vientiane-province/vang-vieng'],['luang-prabang','luang-prabang'],['nong-khiaw','luang-prabang/nong-khiaw'],['muang-ngoi','luang-prabang/muang-ngoi']];
 try{
  for(const lang of ['th','en']){
   await go(`/${lang}/`);
   const cities=page.locator('a[data-home-destination]');
   assert.equal(await cities.count(),5,'all five requested cities should be reachable directly from the homepage');
   for(let index=0;index<expected.length;index++){
    const [id,ref]=expected[index];
    assert.equal(await cities.nth(index).getAttribute('data-home-destination'),id);
    assert.equal(await cities.nth(index).getAttribute('href'),`/${lang}/province/${ref}/`);
   }
   await page.locator('a.home-city-all').click();
   await page.waitForURL(`**/${lang}/explore/`);
   assert.equal(await page.locator('#province-browser').isVisible(),true);
   for(const [id,ref] of expected.slice(-2)){
    await go(`/${lang}/`);
    await page.locator(`a[data-home-destination="${id}"]`).click();
    await page.locator('dialog.city-deck[open] a[data-city-explore]').click();
    await page.waitForURL(`**/${lang}/province/${ref}/`);
    assert.equal(await page.locator('.viewer.is-open').count(),1,'a specific town should open its place, rather than only its province');
    await page.waitForFunction(()=>{const image=document.querySelector('.v-slide.is-active .v-media>img');return image?.complete&&image.naturalWidth>0;});
    assert.equal(await page.locator('.v-slide.is-active [data-save]').getAttribute('data-save'),ref);
    assert.equal(await page.locator('.v-slide.is-active .generated-badge').count(),0,'featured towns should use their real photographs');
   }
  }
 }finally{await ctx.close();}
});

test('home discovery travel styles lead to matching nonempty filtered places',async()=>{
 const {ctx,page,go}=await session();
 const expected=[{interest:'nature',query:'',th:'ธรรมชาติ',en:'Nature'},{interest:'culture',query:'',th:'วัฒนธรรม',en:'Culture'},{interest:'nature',query:'แม่น้ำ',th:'ธรรมชาติ',en:'Nature'},{interest:'activity',query:'',th:'กิจกรรม',en:'Activity'}];
 try{
  for(const lang of ['th','en'])for(let index=0;index<expected.length;index++){
   await go(`/${lang}/`);
   const styles=page.locator('a[data-home-style]');
   assert.equal(await styles.count(),4,'travellers should have four clear starting points');
   await styles.nth(index).click();
   const url=new URL(page.url()),filter=expected[index];
   assert.equal(url.pathname,`/${lang}/explore/`);
   assert.equal(url.searchParams.get('interest'),filter.interest);
   assert.equal(url.searchParams.get('q')||'',filter.query);
   assert.equal(await page.locator('#interest-filter').inputValue(),filter.interest);
   assert.equal(await page.locator('#destination-search').inputValue(),filter.query);
   const results=page.locator('#search-results .discovery-tile');
   assert.ok(await results.count()>0,`${lang} style ${index} should offer places to visit`);
   for(const category of await results.locator('.meta').allTextContents())assert.ok(category.endsWith(` · ${filter[lang]}`),'every offered place should match the selected experience');
   if(filter.query)assert.equal(await results.locator(`h3 a[href="/${lang}/province/luang-prabang/nong-khiaw/"]`).count(),1,'riverside discovery should include a real town on the Nam Ou');
   assert.equal(await page.locator('#province-browser').isHidden(),true);
  }
 }finally{await ctx.close();}
});

test('home discovery stays compact with linked moments and price-free trips while all packages remain available',async()=>{
 const {ctx,page,go}=await session();
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{
  for(const width of [320,390,1440])for(const lang of ['th','en']){
   await page.setViewportSize({width,height:844});await go(`/${lang}/`);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}px ${lang} homepage should fit the screen`);
   assert.equal(await page.locator('#trips .trip-card').count(),3,'the homepage should preview three trips rather than repeat the full catalogue');
   assert.equal(await page.locator('#trips .card-price, #trips .trip-card-priced').count(),0,'prices belong on the package pages');
   assert.doesNotMatch(await page.locator('#trips').innerText(),/[฿]|THB|บาทต่อคน/);
   assert.equal(await page.locator('a.home-moment-link').count(),3,'three photographic moments should provide focused inspiration');
   for(const href of await page.locator('a.home-moment-link').evaluateAll(links=>links.map(link=>link.getAttribute('href'))))assert.match(href,new RegExp(`^/${lang}/province/[^/]+/[^/]+/$`),'moments should link directly to the real place');
  }
  await page.locator('a.home-moment-link').first().click();
  await page.waitForFunction(()=>{const image=document.querySelector('.v-slide.is-active .v-media>img');return image?.complete&&image.naturalWidth>0;});
  assert.equal(await page.locator('.v-slide.is-active .generated-badge').count(),0);
  await go('/en/');await page.locator('#trips .trip-card .trip-body h3 a').first().click();
  await page.waitForURL('**/en/package/*/');
  assert.ok(await page.locator('.daily-itinerary .day-activities li').count()>0,'a compact preview should still lead to the full program');
  await go('/en/');await page.locator('#trips a[href="/en/packages/"]').click();
  await page.waitForURL('**/en/packages/');
  assert.equal(await page.locator('#pkg-grid > article.trip-card-priced').count(),6,'the full package catalogue should remain available');
  assert.deepEqual(errors,[]);
 }finally{await ctx.close();}
});

test('first visits use browser language while manual choices persist and shared localized URLs stay explicit',async()=>{
 for(const [locale,expected] of [['lo-LA','lo'],['ja-JP','en']]){
  const {ctx,page,go}=await session({locale});
  try{
   await go('/?interest=nature');
   assert.equal(new URL(page.url()).pathname,`/${expected}/`);
   assert.equal(new URL(page.url()).searchParams.get('interest'),'nature');
   assert.equal(await page.locator('html').getAttribute('lang'),expected);
   assert.equal(await page.evaluate(()=>localStorage.getItem('mvm-language')),null,'automatic detection should not become a manual preference');
   await chooseLanguage(page,'th');
   await go('/');await page.reload();
   await page.waitForFunction(()=>document.querySelector('#main')?.dataset.view);
   assert.equal(new URL(page.url()).pathname,'/th/');
   assert.equal(await page.evaluate(()=>localStorage.getItem('mvm-language')),'th');
   await go('/zh/inquiry/?kind=package&ref=luang-prabang-discovery');
   assert.equal(new URL(page.url()).pathname,'/zh/inquiry/');
   assert.equal(new URL(page.url()).searchParams.get('kind'),'package');
   assert.equal(new URL(page.url()).searchParams.get('ref'),'luang-prabang-discovery');
   assert.match(await page.locator('.inquiry-context').innerText(),/琅勃拉邦/);
   assert.equal(await page.evaluate(()=>localStorage.getItem('mvm-language')),'th','opening a shared URL should not overwrite the manual choice');
   await chooseLanguage(page,'zh');
   assert.equal(await page.evaluate(()=>localStorage.getItem('mvm-language')),'zh','choosing the current language should still remember it');
   await go('/');
   assert.equal(new URL(page.url()).pathname,'/zh/');
  }finally{await ctx.close();}
 }
});

test('one language dropdown fits every screen and supports keyboard and outside dismissal',async()=>{
 const {ctx,page,go}=await session();
 try{
  for(const width of [320,768,1440]){
   await page.setViewportSize({width,height:844});await go('/en/explore/');
   const trigger=page.locator('[data-language-toggle]'),panel=page.locator('#language-options'),options=panel.locator('[data-language-option]');
   assert.equal(await page.locator('[data-language-toggle]:visible').count(),1,`${width}px: one language control`);
   assert.equal(await trigger.getAttribute('aria-controls'),'language-options');
   assert.equal(await trigger.getAttribute('aria-expanded'),'false');
   assert.equal(await panel.getAttribute('role'),'group');
   assert.equal(await panel.isHidden(),true);
   await trigger.click();
   assert.equal(await options.count(),4);
   assert.deepEqual((await options.evaluateAll(buttons=>buttons.map(button=>button.dataset.lang))).sort(),['en','lo','th','zh']);
   assert.equal(await panel.locator('[aria-pressed="true"]').getAttribute('data-lang'),'en');
   for(let index=0;index<4;index++)assert.equal(await options.nth(index).isVisible(),true);
   const box=await panel.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1,`${width}px: options fit the viewport`);
   await options.first().focus();await page.keyboard.press('End');
   assert.equal(await options.last().evaluate(el=>el===document.activeElement),true);
   await page.keyboard.press('ArrowUp');
   assert.equal(await options.nth(2).evaluate(el=>el===document.activeElement),true);
   await page.keyboard.press('Home');
   assert.equal(await options.first().evaluate(el=>el===document.activeElement),true);
   await page.keyboard.press('ArrowDown');
   assert.equal(await options.nth(1).evaluate(el=>el===document.activeElement),true);
   await page.keyboard.press('Escape');
   assert.equal(await panel.isHidden(),true);
   assert.equal(await trigger.getAttribute('aria-expanded'),'false');
   assert.equal(await trigger.evaluate(el=>el===document.activeElement),true);
   await trigger.click();await page.locator('#destination-search').click();
   assert.equal(await panel.isHidden(),true,'an outside click closes the language choices');
   await trigger.click();await page.locator('#destination-search').focus();
   await page.waitForFunction(()=>document.querySelector('#language-options').hidden);
   assert.equal(await trigger.getAttribute('aria-expanded'),'false','moving focus outside closes the language choices');
   assert.equal(new URL(page.url()).pathname,'/en/explore/','dismissing the choices should retain the current language and route');
  }
 }finally{await ctx.close();}
});

test('four-language desktop switching keeps the selected package and its complete program',async()=>{
 const {ctx,page,go}=await session();
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const names={th:'หลวงพระบาง',lo:'ຫຼວງພະບາງ',en:'Luang Prabang',zh:'琅勃拉邦'};
 const falls={th:'กวางสี',lo:'ກວາງຊີ',en:'Kuang Si',zh:'光西瀑布'};
 try{
  await go('/th/packages/');
  await page.locator('#pkg-grid a.package-card-cta[href="/th/package/luang-prabang-discovery/"]').click();
  for(const lang of ['lo','en','zh','th']){
   await chooseLanguage(page,lang);
   assert.equal(new URL(page.url()).pathname,`/${lang}/package/luang-prabang-discovery/`);
   assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-Hans':lang);
   assert.equal(await page.locator(`[data-language-option][data-lang="${lang}"]`).getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('h1').innerText(),names[lang]);
   assert.equal(await page.locator('.daily-itinerary details').count(),3);
   assert.ok((await page.locator('.daily-itinerary').innerText()).includes(falls[lang]),`${lang}: the waterfall day retains its meaning`);
   await page.locator('[data-day-open="2"]').click();
   assert.ok(await page.locator(`.daily-itinerary a[href="/${lang}/province/luang-prabang/kuang-si/"]`).isVisible());
   assert.equal(await page.locator('.price-panel [data-inquiry="package"]').getAttribute('data-ref'),'luang-prabang-discovery');
  }
  assert.deepEqual(errors,[]);
 }finally{await ctx.close();}
});

test('four-language mobile dropdown preserves the package inquiry and every draft field at 390px and 320px',async()=>{
 const {ctx,page,go}=await session({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const names={th:'หลวงพระบาง',lo:'ຫຼວງພະບາງ',en:'Luang Prabang',zh:'琅勃拉邦'};
 const draft={name:'Language Traveller',travelers:'4',date:'2030-01-10',notes:'A relaxed pace and a waterfall day'};
 try{
  for(const width of [390,320]){
   await page.setViewportSize({width,height:844});
   await go('/th/inquiry/?kind=package&ref=luang-prabang-discovery');
   for(const [name,value]of Object.entries(draft))await page.fill(`[name="${name}"]`,value);
   await page.locator('#inquiry-form button[type="submit"]').evaluate(button=>button.scrollIntoView({block:'center'}));
   await page.locator('#inquiry-form button[type="submit"]').click();
   for(const lang of ['lo','en','zh','th']){
    await chooseLanguage(page,lang);
    const url=new URL(page.url());
    assert.equal(url.pathname,`/${lang}/inquiry/`);
    assert.equal(url.searchParams.get('kind'),'package');
    assert.equal(url.searchParams.get('ref'),'luang-prabang-discovery');
    assert.equal(await page.locator('html').getAttribute('lang'),lang==='zh'?'zh-Hans':lang);
    assert.equal(await page.locator(`[data-language-option][data-lang="${lang}"]`).getAttribute('aria-pressed'),'true');
    assert.ok((await page.locator('.inquiry-context').innerText()).includes(names[lang]));
    for(const [name,value]of Object.entries(draft))assert.equal(await page.locator(`[name="${name}"]`).inputValue(),value,`${width}px ${lang}: ${name} retained`);
    const message=await page.locator('#inquiry-message').inputValue();
    assert.ok(message.includes(names[lang]),`${lang}: prepared inquiry follows the chosen language`);
    assert.ok(message.includes(draft.notes));
    assert.equal(await page.evaluate(width=>document.documentElement.scrollWidth<=width,width),true,`${width}px ${lang}: inquiry fits the screen`);
   }
  }
  assert.deepEqual(errors,[]);
 }finally{await ctx.close();}
});

test('four-language Lao and Chinese pages have translated live and JavaScript-free content with localized alternates',async()=>{
 const routes=['','province/luang-prabang/','province/luang-prabang/kuang-si/','package/luang-prabang-discovery/','faq/'];
 const scripts={lo:/[\u0E80-\u0EFF]/,zh:/[\u4E00-\u9FFF]/};
 const {ctx,page,go}=await session();
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{
  for(const width of [320,390,1440])for(const lang of ['lo','zh'])for(const route of routes){
   await page.setViewportSize({width,height:844});await go(`/${lang}/${route}`);
   const text=await page.locator(route.endsWith('kuang-si/')?'.v-slide.is-active':'#main').innerText();
   assert.match(text,scripts[lang],`${lang} ${route}: translated main content`);
   assert.doesNotMatch(text,/[\u0E01-\u0E3A\u0E40-\u0E5B]/,`${lang} ${route}: no Thai fallback in content`);
   if(route.endsWith('kuang-si/')){
    const viewer=await page.locator('.v-slide.is-active').innerText();
    assert.match(viewer,lang==='lo'?/ກວາງຊີ/:/光西瀑布/);
    assert.doesNotMatch(viewer,/[\u0E01-\u0E3A\u0E40-\u0E5B]/);
   }
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${width}px ${lang} ${route}: fits the screen`);
  }
  assert.deepEqual(errors,[]);
 }finally{await ctx.close();}
 const staticSession=await session({javaScriptEnabled:false});
 try{
  for(const lang of ['lo','zh'])for(const route of routes){
   await staticSession.page.goto(`${base}/${lang}/${route}`);
   assert.equal(await staticSession.page.locator('html').getAttribute('lang'),lang==='zh'?'zh-Hans':lang);
   const text=await staticSession.page.locator('main').innerText();
   assert.match(text,scripts[lang],`${lang} ${route}: generated content works without JavaScript`);
   assert.doesNotMatch(text,/[\u0E01-\u0E3A\u0E40-\u0E5B]/);
   if(route.endsWith('kuang-si/'))assert.match(text,lang==='lo'?/ກວາງຊີ/:/光西瀑布/);
   const alternates=await staticSession.page.locator('link[rel="alternate"][hreflang]').evaluateAll(links=>links.filter(link=>link.hreflang!=='x-default').map(link=>({lang:link.hreflang,href:link.href})));
   assert.deepEqual(alternates.map(link=>link.lang).sort(),['en','lo','th','zh-Hans']);
   for(const alternate of alternates)assert.equal(new URL(alternate.href).pathname,`/${alternate.lang==='zh-Hans'?'zh':alternate.lang}/${route}`);
   assert.equal(new URL(await staticSession.page.locator('link[rel="canonical"]').getAttribute('href')).pathname,`/${lang}/${route}`);
  }
 }finally{await staticSession.ctx.close();}
});

test('the LINE button and the team tip appear only when real details are supplied',async()=>{
 const {ctx,page,go}=await session();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install();
 try{
  await go('/en/');
  assert.equal(await page.locator('.chat-fab').count(),0,'no LINE account, no LINE button');
  await go('/en/province/luang-prabang/kuang-si/');
  assert.equal(await page.locator('.v-slide.is-active .v-tip').count(),0,'no tip, no tip box');
  await go('/en/explore/');
  await page.evaluate(async()=>{const C=await import('/content.js');C.site.contact.line='@fixture';C.placeDetails['luang-prabang/kuang-si'].tip={th:'เคล็ดลับทดสอบ',en:'Fixture tip',lo:'ທົດສອບ',zh:'测试'};});
  await page.locator('.desktop-nav a[href="/en/about/"]').click();
  const button=page.locator('.chat-fab-btn');
  assert.equal(await button.isVisible(),true);
  assert.equal(await button.getAttribute('href'),'https://line.me/R/ti/p/%40fixture');
  assert.equal(await page.locator('.chat-hello').isHidden(),true,'the greeting waits for the visitor to look around');
  await page.mouse.wheel(0,700);await page.waitForTimeout(300);await page.clock.runFor(6500);
  assert.equal(await page.locator('.chat-hello').isVisible(),true);
  await page.locator('[data-chat-dismiss]').click();
  assert.equal(await page.locator('.chat-hello').isHidden(),true);
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('mvm-chat-hello')),'dismissed','a closed greeting stays closed for the visit');
  await page.locator('#mobile-bar, .site-header').first().waitFor();
  await page.locator('.desktop-nav a[href="/en/explore/"]').click();
  await page.locator('a[href="/en/province/luang-prabang/"]').first().click();
  await page.locator('a[href="/en/province/luang-prabang/kuang-si/"]').first().click();
  assert.match(await page.locator('.v-slide.is-active .v-tip').innerText(),/Fixture tip/);
  assert.equal(await page.locator('.chat-fab').isHidden(),true,'the place viewer keeps the screen to itself');
  await page.keyboard.press('Escape');
  await go('/en/inquiry/');
  assert.equal(await page.locator('.chat-fab').isHidden(),true,'the trip form already lists every channel');
  assert.deepEqual(errors,[]);
 }finally{await ctx.close();}
});

test('mobile shortcut labels stay readable on small phones in every language',async()=>{
 const {ctx,page,go}=await session({viewport:{width:320,height:700},isMobile:true,hasTouch:true});
 await ctx.addInitScript(()=>{try{localStorage.setItem('mvm-saved-places',JSON.stringify(['luang-prabang/kuang-si','champasak/vat-phou','luang-prabang/alms-giving','bokeo/slow-boat','luang-prabang/night-market','vientiane-province/blue-lagoon','champasak/khone-phapheng','luang-prabang/phousi','luang-prabang/wat-xieng-thong','luang-prabang/royal-palace']));}catch{}});
 try{
  for(const width of [320,360,390])for(const lang of ['th','lo','en','zh']){
   await page.setViewportSize({width,height:700});await go(`/${lang}/explore/`);
   const bar=await page.evaluate(()=>({overflow:document.querySelector('#mobile-bar').scrollWidth>innerWidth,buttons:[...document.querySelectorAll('#mobile-bar .btn')].map(button=>{const label=button.querySelector('.bar-label');const lines=Math.round(label.getBoundingClientRect().height/parseFloat(getComputedStyle(label).lineHeight));return{height:button.getBoundingClientRect().height,lines,count:!!button.querySelector('.bar-count:not([hidden])')};})}));
   assert.equal(bar.overflow,false,`${width}px ${lang}: the bar fits`);
   for(const button of bar.buttons){assert.ok(button.lines<=2,`${width}px ${lang}: a label uses at most two lines`);assert.ok(button.height<=52,`${width}px ${lang}: buttons keep their height`);}
   assert.equal(bar.buttons[0].count,true,`${width}px ${lang}: the saved count stays visible`);
  }
 }finally{await ctx.close();}
});
