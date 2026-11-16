import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import * as C from '../dist/content.js';
import { homeDestinations } from '../dist/home-discovery.js';
import { cityDeckCopy, cityText, getCityDestination } from '../dist/city-deck-data.js';

const languages = ['th', 'lo', 'en', 'zh'];
const destinations = [
  { id: 'vientiane-capital', name: 'Vientiane', photo: 'that-luang', href: '#/province/vientiane-capital', province: 'vientiane-capital', place: null },
  { id: 'vang-vieng', name: 'Vang Vieng', photo: 'nam-song', href: '#/province/vientiane-province/vang-vieng', province: 'vientiane-province', place: 'vang-vieng' },
  { id: 'luang-prabang', name: 'Luang Prabang', photo: 'royal-palace', href: '#/province/luang-prabang', province: 'luang-prabang', place: null },
  { id: 'nong-khiaw', name: 'Nong Khiaw', photo: 'nong-khiaw', href: '#/province/luang-prabang/nong-khiaw', province: 'luang-prabang', place: 'nong-khiaw' },
  { id: 'muang-ngoi', name: 'Muang Ngoi', photo: 'muang-ngoi', href: '#/province/luang-prabang/muang-ngoi', province: 'luang-prabang', place: 'muang-ngoi' },
];

test('city deck retains the five homepage destinations and photographs with links to each city', () => {
  assert.equal(homeDestinations.length, destinations.length);
  for (const expected of destinations) {
    const result = getCityDestination(expected.id);
    assert.ok(result, expected.id);
    assert.strictEqual(result.item, homeDestinations.find(item => item.id === expected.id));
    assert.equal(result.item.name.en, expected.name);
    assert.equal(result.item.photo, expected.photo);
    assert.equal(result.item.href, expected.href);
    assert.equal(result.province.id, expected.province);
    assert.equal(result.place?.id ?? null, expected.place);
    assert.strictEqual(result.province, C.findProvince(expected.province));
  }
});

test('city viewer provides a compact overview in all four languages while retaining the full introduction', () => {
  for (const expected of destinations) {
    const result = getCityDestination(expected.id);
    for (const lang of languages) {
      assert.equal(typeof result.overview?.[lang], 'string', `${expected.id}/${lang}`);
      assert.ok(result.overview[lang].trim(), `${expected.id}/${lang}`);
      assert.ok(result.overview[lang].length <= 140, `${expected.id}/${lang} stays compact`);
      assert.notEqual(result.overview[lang], result.intro[lang], `${expected.id}/${lang} keeps the full guide separate`);
    }
  }
});

test('city selection and exploration controls name the destination in all four languages', () => {
  for (const lang of languages) {
    assert.ok(cityText(lang, 'chooseCity').trim(), lang);
    const label = cityText(lang, 'exploreCity', { name: 'Test city' });
    assert.ok(label.includes('Test city'), lang);
    assert.ok(!label.includes('{name}'), lang);
  }
  assert.equal(cityText('th', 'exploreCity', { name: 'วังเวียง' }), 'ดูรายละเอียดวังเวียง');
  assert.equal(cityText('en', 'exploreCity', { name: 'Vang Vieng' }), 'Explore Vang Vieng');
});

test('repeated city reads reuse highlights that receive translations loaded after the viewer opens', () => {
  execFileSync(process.execPath, ['--input-type=module', '--eval', `
    import assert from 'node:assert/strict';
    globalThis.window = {};
    const { getCityDestination } = await import(${JSON.stringify(new URL('../dist/city-deck-data.js', import.meta.url).href)});
    const { ensureTranslations } = await import(${JSON.stringify(new URL('../dist/i18n.js', import.meta.url).href)});
    const first = getCityDestination('vang-vieng');
    assert.equal(first.highlights[0].lo, undefined);
    assert.strictEqual(getCityDestination('vang-vieng').highlights, first.highlights);
    await ensureTranslations('lo');
    for (const highlight of first.highlights) {
      assert.ok(highlight.lo?.trim(), 'Lao hydrates the cached highlights');
      assert.equal(highlight.zh, undefined, 'Chinese waits for its own catalogue');
    }
    await ensureTranslations('zh');
    for (const lang of ['th', 'lo', 'en', 'zh']) {
      for (const highlight of first.highlights) assert.ok(highlight[lang]?.trim(), lang);
    }
  `], { encoding: 'utf8' });
});

test('Vang Vieng, Nong Khiaw and Muang Ngoi use their own place detail records', () => {
  for (const expected of destinations.filter(item => item.place)) {
    const result = getCityDestination(expected.id);
    const ref = `${expected.province}/${expected.place}`;
    const detail = C.placeDetails[ref];
    assert.strictEqual(result.place, C.findPlace(ref).place, expected.id);
    assert.strictEqual(result.detail, detail, expected.id);
    assert.strictEqual(result.intro, detail.about, expected.id);
    assert.deepEqual(result.facts, [
      { icon: 'sun', key: 'bestTime', value: detail.best },
      { icon: 'clock', key: 'timeNeeded', value: detail.time },
    ], expected.id);
    for (const lang of languages) {
      assert.deepEqual(result.highlights.map(highlight => highlight[lang]), detail.highlights[lang].slice(0, 3), `${expected.id}/${lang}`);
    }
  }
});

test('city overviews use province introductions and local landmarks without borrowing temple visit times', () => {
  const expectedCities = [
    { id: 'vientiane-capital', highlights: ['Pha That Luang', 'Patuxai', 'Wat Si Saket'] },
    { id: 'luang-prabang', highlights: ['Wat Xieng Thong', 'Royal Palace Museum', 'Morning alms giving'] },
  ];
  for (const expected of expectedCities) {
    const result = getCityDestination(expected.id);
    assert.equal(result.place, null);
    assert.equal(result.detail, null);
    assert.strictEqual(result.intro, result.province.intro);
    assert.deepEqual(result.facts, []);
    assert.deepEqual(result.highlights.map(highlight => highlight.en), expected.highlights);
    assert.ok(!result.highlights.some(highlight => /Nong Khiaw|Muang Ngoi/.test(highlight.en)));
  }
});

test('every destination provides three highlights and an introduction localizable into all four languages', () => {
  for (const expected of destinations) {
    const result = getCityDestination(expected.id);
    assert.equal(result.highlights.length, 3, expected.id);
    for (const text of [result.item.name, result.item.summary, result.intro, ...result.highlights, ...result.facts.map(fact => fact.value)]) {
      for (const lang of languages) {
        assert.equal(typeof text[lang], 'string', `${expected.id}/${lang}`);
        assert.ok(text[lang].trim(), `${expected.id}/${lang}`);
      }
    }
  }
});

test('city controls have complete translations with matching interpolation fields', () => {
  const required = ['close', 'previous', 'next', 'showPhoto', 'showDetails', 'explore', 'highlights', 'bestTime', 'timeNeeded', 'position', 'open'];
  for (const key of required) assert.ok(cityDeckCopy[key], key);
  for (const [key, copy] of Object.entries(cityDeckCopy)) {
    const expectedFields = [...copy.en.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
    for (const lang of languages) {
      assert.equal(typeof copy[lang], 'string', `${key}/${lang}`);
      assert.ok(copy[lang].trim(), `${key}/${lang}`);
      assert.deepEqual([...copy[lang].matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort(), expectedFields, `${key}/${lang}`);
      assert.equal(cityText(lang, key), copy[lang], `${key}/${lang}`);
    }
  }
  assert.equal(cityText('en', 'position', { index: 2, total: 5 }), '2 of 5');
  assert.equal(cityText('en', 'open', { name: '<Luang & Lao>' }), 'Details for <Luang & Lao>');
  assert.equal(cityText('en', 'position', { index: 0 }), '0 of {total}');
  assert.equal(cityText('unknown', 'close'), cityDeckCopy.close.en);
  assert.throws(() => cityText('en', 'unknown'), /Missing city deck copy/);
});

test('unknown or invalid destination identifiers have no city record', () => {
  for (const id of ['unknown', 'that-luang', '', null, undefined, {}, 0]) {
    assert.equal(getCityDestination(id), null);
  }
});
