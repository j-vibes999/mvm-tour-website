import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseBrowserRoute, localeHref, resolveRoute, locales } from '../dist/routes.js';
import * as C from '../dist/content.js';
import * as H from '../dist/home-discovery.js';
import { buildInquiryText, searchDestinations, inquiryChannelHref } from '../dist/trip-tools.js';

test('browser language detection uses the first supported language family and falls back to English', async () => {
  const { detectBrowserLanguage } = await import('../dist/i18n.js');
  assert.equal(typeof detectBrowserLanguage, 'function');
  const examples = [
    [['th-TH'], 'th'],
    [['lo-LA'], 'lo'],
    [['en-GB'], 'en'],
    [['zh-CN'], 'zh'],
    [['zh-TW'], 'zh'],
    [['ZH_hant_TW'], 'zh'],
    [['LO_la'], 'lo'],
    [['de-DE'], 'en'],
    [['ja-JP', 'lo-LA', 'en-US'], 'lo'],
    [['en-US', 'th-TH'], 'en'],
    [[], 'en'],
  ];
  for (const [preferences, expected] of examples) {
    assert.equal(detectBrowserLanguage(preferences), expected, preferences.join(', '));
  }
  assert.equal(detectBrowserLanguage(), 'en');
});

test('initial language honors localized URLs before a manual preference or browser language', async () => {
  const { chooseInitialLanguage } = await import('../dist/i18n.js');
  assert.equal(typeof chooseInitialLanguage, 'function');
  for (const lang of ['th', 'lo', 'en', 'zh']) {
    assert.equal(chooseInitialLanguage({pathname: `/${lang}/province/luang-prabang/kuang-si/`, savedLanguage: 'lo', browserLanguages: ['zh-TW']}), lang);
  }
  assert.equal(chooseInitialLanguage({pathname: '/', savedLanguage: 'th', browserLanguages: ['lo-LA']}), 'th');
  assert.equal(chooseInitialLanguage({pathname: '/explore/', savedLanguage: 'zh', browserLanguages: ['th-TH']}), 'zh');
  assert.equal(chooseInitialLanguage({pathname: '/', savedLanguage: 'invalid', browserLanguages: ['lo-LA']}), 'lo');
  assert.equal(chooseInitialLanguage({pathname: '/province/luang-prabang/', browserLanguages: ['zh-TW']}), 'zh');
  assert.equal(chooseInitialLanguage({pathname: '/', browserLanguages: ['ja-JP']}), 'en');
  assert.equal(chooseInitialLanguage(), 'en');
});

test('all four languages resolve direct destination URLs and preserve inquiry context', () => {
  assert.deepEqual([...locales].sort(), ['en','lo','th','zh']);
  for (const lang of locales) {
    const path=`/${lang}/province/luang-prabang/muang-ngoi/`;
    assert.equal(parseBrowserRoute(path).lang, lang);
    assert.equal(resolveRoute(path).exists, true);
    assert.equal(resolveRoute(path).lang, lang);
    assert.equal(localeHref('/th/inquiry/?kind=package&ref=muang-ngoi-discovery',lang),`/${lang}/inquiry/?kind=package&ref=muang-ngoi-discovery`);
  }
});

test('every public content field and activity has an explicit Lao and Chinese translation', () => {
  function inspect(value,path='') {
    if (!value || typeof value!=='object') return;
    if (value.th!==undefined && value.en!==undefined) {
      for(const lang of ['lo','zh']) {
        assert.equal(typeof value[lang],typeof value.en,path+'.'+lang);
        if(Array.isArray(value.en)) {
          assert.equal(value[lang].length,value.en.length,path+'.'+lang+' activities');
          value[lang].forEach((text,i)=>assert.ok(text.trim(),path+'.'+lang+'.'+i));
        } else if(value.en) assert.ok(value[lang].trim(),path+'.'+lang);
      }
    } else for(const [key,child] of Object.entries(value)) if(typeof child!=='function') inspect(child,path+'.'+key);
  }
  inspect(C,'content');inspect(H,'home');
});

test('Lao and Chinese inquiry messages keep Thai-baht examples and inquiry meaning', () => {
  const trip=C.packages.find(p=>p.id==='muang-ngoi-discovery');
  for(const lang of ['lo','zh']) {
    const text=buildInquiryText({context:{kind:'package',item:trip},lang,travelers:4,date:'2027-02-11'});
    assert.ok(text.includes(trip.title[lang]));
    assert.ok(text.includes('2027-02-11'));
    assert.doesNotMatch(text,/[\u0e00-\u0e7f]/,'new locales should not silently fall back to Thai');
    assert.ok(lang==='lo'?text.includes('ຈອງ'):text.includes('预订'));
    const email=new URL(inquiryChannelHref('email',{email:'test@example.com'},text,lang));
    assert.match(email.searchParams.get('subject'),lang==='lo'?/ສອບຖາມ/:/行程咨询/);
  }
  assert.ok(searchDestinations({query:'万荣'}).some(item=>item.province.id==='vientiane-province'));
  assert.ok(searchDestinations({query:'ວັງວຽງ'}).some(item=>item.province.id==='vientiane-province'));
});

test('translated UI templates retain numbered values and safe markup exactly', async () => {
  const { translate, translationCatalog }=await import('../dist/i18n.js');
  for(const [key,values]of Object.entries(translationCatalog)) for(const value of values) {
    assert.ok(value.trim(),key);
    assert.deepEqual([...value.matchAll(/\{\d+\}/g)].map(m=>m[0]).sort(),[...key.matchAll(/\{\d+\}/g)].map(m=>m[0]).sort(),key);
    assert.equal((value.match(/<br>/g)||[]).length,(key.match(/<br>/g)||[]).length,key);
  }
  assert.equal(translate('3 วัน 2 คืน','3 days · 2 nights','zh','{0} days · {1} nights',[3,2]),'3天 · 2晚');
  assert.match(translate('ภาพประกอบ AI ของกวางสี','AI illustration of Kuang Si','zh','AI illustration of {0}',['Kuang Si']),/Kuang Si/);
  const template=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  assert.match(template,/i18n\.css/);
});

test('a team tip, when the owner adds one, is written in all four languages', () => {
  for (const [ref, details] of Object.entries(C.placeDetails)) {
    if (details.tip === undefined) continue;
    for (const lang of ['th', 'en', 'lo', 'zh']) assert.ok(typeof details.tip[lang] === 'string' && details.tip[lang].trim(), `${ref}: tip needs ${lang}`);
  }
});
