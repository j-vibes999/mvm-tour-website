import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import reviewed from '../dist/locales/all.js';

const i18nUrl = new URL('../dist/i18n.js', import.meta.url).href;
const runBrowserModule = body => execFileSync(process.execPath, ['--input-type=module', '--eval', `
  import assert from 'node:assert/strict';
  globalThis.window = {};
  ${body}
`], { encoding: 'utf8' });

test('loading Lao hydrates registered roots without loading Chinese, then switching hydrates old and new roots', () => {
  runBrowserModule(`
    const { localizeContent, ensureTranslations, translate, translationCatalog, getTranslationRevision } = await import(${JSON.stringify(i18nUrl)});
    assert.equal(typeof getTranslationRevision, 'function');
    const initialRevision = getTranslationRevision();
    await ensureTranslations('th');
    await ensureTranslations('en');
    assert.equal(getTranslationRevision(), initialRevision);
    const first = { name: { th: 'ผงสาลี', en: 'Phongsaly' }, activities: { th: ['เที่ยวช้า ๆ'], en: ['Slow travel'] } };
    localizeContent(first);
    assert.equal(first.name.lo, undefined);
    const pending = ensureTranslations('lo');
    assert.strictEqual(ensureTranslations('lo'), pending, 'one in-flight load per language');
    await pending;
    assert.equal(getTranslationRevision(), initialRevision + 1);
    assert.equal(first.name.lo, 'ຜົ້ງສາລີ');
    assert.deepEqual(first.activities.lo, ['ທ່ຽວແບບບໍ່ຮີບຮ້ອນ']);
    assert.equal(first.name.zh, undefined, 'Chinese must wait for its own catalogue');
    assert.equal(translationCatalog.Phongsaly[1], undefined);
    const later = { th: 'ผงสาลี', en: 'Phongsaly' };
    localizeContent(later);
    assert.equal(later.lo, 'ຜົ້ງສາລີ');
    assert.equal(later.zh, undefined);
    await ensureTranslations('zh');
    assert.equal(getTranslationRevision(), initialRevision + 2);
    assert.equal(first.name.zh, '丰沙里');
    assert.deepEqual(first.activities.zh, ['慢旅行']);
    assert.equal(later.zh, '丰沙里', 'roots registered after the first load still receive the next language');
    await ensureTranslations('lo');
    assert.equal(getTranslationRevision(), initialRevision + 2, 'cached language does not invalidate consumers again');
    assert.equal(translate('ผงสาลี', 'Phongsaly', 'lo'), 'ຜົ້ງສາລີ');
    assert.equal(translate('ผงสาลี', 'Phongsaly', 'zh'), '丰沙里');
  `);
});

test('language imports remain independent and a failed catalogue request can retry', () => {
  runBrowserModule(`
    const { registerHooks } = await import('node:module');
    let laoAttempts = 0;
    const catalogues = [];
    registerHooks({ resolve(specifier, context, nextResolve) {
      if (specifier.includes('/locales/')) {
        catalogues.push(specifier);
        if (specifier.endsWith('/lo.js') && ++laoAttempts === 1) throw new Error('Temporary catalogue transport failure');
      }
      return nextResolve(specifier, context);
    } });
    const { ensureTranslations, localizeContent } = await import(${JSON.stringify(i18nUrl)});
    const content = { th: 'ผงสาลี', en: 'Phongsaly' };
    localizeContent(content);
    await assert.rejects(ensureTranslations('lo'), /Temporary catalogue transport failure/);
    await ensureTranslations('zh');
    assert.equal(content.zh, '丰沙里');
    assert.equal(content.lo, undefined);
    await ensureTranslations('lo');
    assert.equal(content.lo, 'ຜົ້ງສາລີ');
    assert.equal(laoAttempts, 2);
    assert.deepEqual(catalogues, ['./locales/lo.js', './locales/zh.js', './locales/lo.js']);
  `);
});

test('generated language catalogues preserve every reviewed string and can be regenerated exactly', async () => {
  const output = await mkdtemp(join(tmpdir(), 'mvm-locales-'));
  try {
    const result = execFileSync(process.execPath, [fileURLToPath(new URL('../scripts/generate-locales.mjs', import.meta.url)), output], { encoding: 'utf8' });
    assert.ok(result.includes('2 language catalogues'));
    for (const [lang, index] of [['lo', 0], ['zh', 1]]) {
      const generated = await readFile(join(output, lang + '.js'), 'utf8');
      assert.equal(generated, await readFile(new URL('../dist/locales/' + lang + '.js', import.meta.url), 'utf8'), `${lang} catalogue is current`);
      const { default: catalogue } = await import('data:text/javascript;base64,' + Buffer.from(generated).toString('base64'));
      assert.equal(Object.keys(catalogue).length, Object.keys(reviewed).length);
      for (const [key, pair] of Object.entries(reviewed)) assert.equal(catalogue[key], pair[index], `${lang}: ${key}`);
    }
  } finally { await rm(output, { recursive: true, force: true }); }
});
