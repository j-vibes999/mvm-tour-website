import * as C from './content.js';
import { languages } from './i18n.js';

export const locales = languages;
const language = value => locales.includes(value) ? value : 'th';
const decode = value => { try { return decodeURIComponent(value); } catch { return value; } };

// Read both public URLs and old #/ links so existing bookmarks keep working.
export function parseBrowserRoute(location = {}) {
  if (typeof location === 'string') {
    if (location.startsWith('#/')) location = { hash: location };
    else location = new URL(location, 'https://mvm.invalid/');
  }
  const legacy = typeof location.hash === 'string' && location.hash.startsWith('#/');
  const raw = legacy ? location.hash.slice(1) : `${location.pathname || '/'}${location.search || ''}`;
  const question = raw.indexOf('?');
  const path = question < 0 ? raw : raw.slice(0, question);
  const query = new URLSearchParams(question < 0 ? '' : raw.slice(question + 1));
  const parts = path.split('/').filter(Boolean).map(decode);
  const pathLang = (location.pathname || '').split('/').filter(Boolean)[0];
  const lang = locales.includes(parts[0]) ? parts.shift() : language(pathLang);
  return { parts, query, lang };
}

function normalizedParts(parts) {
  if (parts[0] === 'destination') return ['province', C.legacyDestinations[parts[1]] || parts[1]].filter(Boolean);
  if (parts[0] === 'experiences') return ['highlights'];
  if (parts[0] === 'place') return ['province', ...parts.slice(1)];
  if (parts[0] === 'destinations') return [];
  return parts;
}

export function publicHref(route = '/', lang = 'th') {
  if (typeof route === 'string' && (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(route) || (route.startsWith('#') && !route.startsWith('#/')))) return route;
  const parsed = route && Array.isArray(route.parts) ? route : parseBrowserRoute(route);
  const path = normalizedParts(parsed.parts).map(encodeURIComponent).join('/');
  const query = new URLSearchParams(parsed.query || '').toString();
  return `/${language(lang)}/${path ? `${path}/` : ''}${query ? `?${query}` : ''}`;
}

export function localeHref(location, lang) {
  return publicHref(parseBrowserRoute(location), lang);
}

export function resolveRoute(route, lang) {
  const parsed = route && Array.isArray(route.parts) ? route : parseBrowserRoute(route);
  const result = { ...parsed, lang: language(lang || parsed.lang), parts: normalizedParts(parsed.parts), kind: 'notFound', exists: false, noindex: false };
  const [head = '', id, placeId] = result.parts;
  if (result.parts.some(part => !part || /[\/\\\u0000-\u001f]/.test(part))) return result;
  if (!head) Object.assign(result, { kind: 'home', exists: true });
  else if (['explore', 'highlights'].includes(head) && result.parts.length <= 2 && (!id || C.findRegion(id))) Object.assign(result, { kind: head, region: C.findRegion(id), exists: true });
  else if (head === 'province' && result.parts.length <= 3) {
    const province = C.findProvince(id);
    const place = placeId && province?.places.find(item => item.id === placeId);
    if (province && (!placeId || place)) Object.assign(result, { kind: place ? 'place' : 'province', province, place, exists: true });
  } else if (head === 'package' && result.parts.length === 2) {
    const trip = C.packages.find(item => item.id === id);
    if (trip) Object.assign(result, { kind: 'package', package: trip, exists: true });
  } else if (['packages', 'about', 'credits', 'saved', 'inquiry', 'faq'].includes(head) && result.parts.length === 1) Object.assign(result, { kind: head, exists: true, noindex: ['saved', 'inquiry'].includes(head) });
  return result;
}
