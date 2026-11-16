export const languages = ['th', 'lo', 'en', 'zh'];
export const languageInfo = {
  th: { label: 'ไทย', name: 'ไทย', tag: 'th', og: 'th_TH' },
  lo: { label: 'ລາວ', name: 'ລາວ', tag: 'lo', og: 'lo_LA' },
  en: { label: 'EN', name: 'English', tag: 'en', og: 'en_US' },
  zh: { label: '中文', name: '中文', tag: 'zh-Hans', og: 'zh_CN' },
};

export function detectBrowserLanguage(preferences = []) {
  const requested = typeof preferences === 'string' ? [preferences] : Array.isArray(preferences) ? preferences : [];
  for (const tag of requested) {
    if (typeof tag !== 'string') continue;
    const base = tag.trim().toLowerCase().split(/[-_]/)[0];
    if (languages.includes(base)) return base;
  }
  return 'en';
}

export function chooseInitialLanguage({ pathname = '/', savedLanguage, browserLanguages = [] } = {}) {
  const explicit = pathname.match(/^\/(th|lo|en|zh)(?:\/|$)/)?.[1];
  if (explicit) return explicit;
  if (languages.includes(savedLanguage)) return savedLanguage;
  return detectBrowserLanguage(browserLanguages);
}
// Each source has explicit, reviewed Lao and Simplified Chinese text.
// A missing translation is an error, so an incomplete language cannot silently ship.
// Only the requested language catalogue loads; Thai and English pages never need one.
export const translationCatalog = {};
const contentRoots = new Set();
const loadedLanguages = new Set();
const translationsLoading = new Map();
let translationRevision = 0;
export const getTranslationRevision = () => translationRevision;

export function addTranslations(...sources) {
  for (const source of sources) Object.assign(translationCatalog, source);
  for (const lang of ['lo', 'zh']) {
    loadedLanguages.add(lang);
    for (const root of contentRoots) hydrateContent(root, lang);
  }
  translationRevision++;
}

function addLanguageTranslations(lang, source) {
  const index = lang === 'lo' ? 0 : 1;
  for (const [pattern, value] of Object.entries(source)) {
    (translationCatalog[pattern] ||= [])[index] = value;
  }
  for (const root of contentRoots) hydrateContent(root, lang);
  loadedLanguages.add(lang);
  translationRevision++;
}

export function ensureTranslations(lang = 'lo') {
  if (loadedLanguages.has(lang) || lang === 'th' || lang === 'en') return Promise.resolve();
  if (!translationsLoading.has(lang)) {
    const request = (lang === 'lo' ? import('./locales/lo.js') : import('./locales/zh.js'))
      .then(module => addLanguageTranslations(lang, module.default))
      .catch(error => { translationsLoading.delete(lang); throw error; });
    translationsLoading.set(lang, request);
  }
  return translationsLoading.get(lang);
}

export function translate(th, en, lang = 'th', pattern = en, values = []) {
  if (lang === 'th') return th;
  if (lang === 'en') return en;
  const translated = translationCatalog[pattern]?.[lang === 'lo' ? 0 : 1];
  if (typeof translated !== 'string') throw new Error(`Missing ${lang} translation: ${pattern}`);
  return translated.replace(/\{(\d+)\}/g, (token, index) => index < values.length ? String(values[index]) : token);
}

export function localizeContent(root) {
  if (!root || typeof root !== 'object') return;
  contentRoots.add(root);
  for (const lang of loadedLanguages) hydrateContent(root, lang);
}

function hydrateContent(root, lang) {
  if (!root || typeof root !== 'object') return;
  if (root.th !== undefined && root.en !== undefined) {
    if (root[lang] !== undefined) return;
    root[lang] = Array.isArray(root.en)
      ? root.en.map((text, index) => text ? translate(root.th[index], text, lang) : '')
      : root.en ? translate(root.th, root.en, lang) : '';
    return;
  }
  for (const value of Object.values(root)) if (typeof value !== 'function') hydrateContent(value, lang);
}

// Node (the static build and the tests) prepares every language before content modules run.
if (typeof window === 'undefined') await Promise.all(['lo', 'zh'].map(ensureTranslations));
