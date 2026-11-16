import test from 'node:test';
import assert from 'node:assert/strict';

let R = {};
try { R = await import('../dist/routes.js'); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error; }
const available = name => assert.equal(typeof R[name], 'function', `${name} route helper is available`);

test('a direct English attraction URL resolves its locale, IDs and query', () => {
  available('parseBrowserRoute');
  const route = R.parseBrowserRoute({ pathname: '/en/province/luang-prabang/kuang-si/', search: '?from=map', hash: '' });
  assert.equal(route.lang, 'en');
  assert.deepEqual(route.parts, ['province', 'luang-prabang', 'kuang-si']);
  assert.equal(route.query.get('from'), 'map');
});

test('legacy fragment deep links remain migratable without losing filters', () => {
  available('publicHref');
  assert.equal(R.publicHref('#/packages?province=luang-prabang&region=north', 'en'), '/en/packages/?province=luang-prabang&region=north');
  assert.equal(R.publicHref('#/destination/vang-vieng', 'th'), '/th/province/vientiane-province/');
});

test('switching locale keeps the current place and inquiry context', () => {
  available('localeHref');
  assert.equal(R.localeHref({ pathname: '/th/inquiry/', search: '?place=luang-prabang%2Fkuang-si', hash: '' }, 'en'), '/en/inquiry/?place=luang-prabang%2Fkuang-si');
});

test('route generation preserves escaped values while rejecting encoded slash identifiers', () => {
  available('parseBrowserRoute');
  available('resolveRoute');
  const result = R.parseBrowserRoute({ pathname: '/en/province/luang-prabang/kuang%2Fsi/', search: '', hash: '' });
  assert.equal(R.resolveRoute(result).exists, false);
  assert.equal(R.resolveRoute('/th/province/not-a-province/').exists, false);
  assert.equal(R.resolveRoute('/en/province/luang-prabang/not-a-place/').exists, false);
});

test('private saved and inquiry pages are valid but excluded from search indexing', () => {
  available('resolveRoute');
  assert.equal(R.resolveRoute('/th/saved/').noindex, true);
  assert.equal(R.resolveRoute('/en/inquiry/?date=2027-01-01').noindex, true);
});

test('non-routing fragments and external links are not rewritten', () => {
  available('publicHref');
  assert.equal(R.publicHref('#main', 'en'), '#main');
  assert.equal(R.publicHref('https://example.org/a?q=1', 'en'), 'https://example.org/a?q=1');
});

test('FAQ has a public localized route', () => {
  available('resolveRoute');
  assert.equal(R.resolveRoute('/en/faq/').exists, true);
  assert.equal(R.resolveRoute('/en/faq/').kind, 'faq');
});
