import { translate, getTranslationRevision } from './i18n.js';
import * as C from './content.js';
import { destinationNames } from './search-names.js';
import { travelText, inquiryInterests, interestKey } from './travel-copy.js';

const languageTags = { th: 'th', lo: 'lo', en: 'en', zh: 'zh-Hans' };
// A month chosen on the inquiry form, written out in the traveller's language (Thai uses the Buddhist year).
export function monthLabel(month, lang = 'th', style = 'long') {
  const match = /^(\d{4})-(\d{2})$/.exec(String(month || ''));
  if (!match || Number(match[2]) < 1 || Number(match[2]) > 12) return '';
  return new Intl.DateTimeFormat(languageTags[lang] || 'en', { month: style, year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1)));
}

const normalize = value => String(value ?? '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[-_–—]/g, ' ').replace(/\s+/g, ' ').trim();
const aliases = { 'vientiane-province': ['วังเวียง', 'vang vieng'], 'vientiane-capital': ['เวียงจันทน์', 'vientiane city'] };
const allNames = value => Object.values(value || {}).join(' ');

let searchIndex = [], indexedRevision = -1;
function destinationIndex() {
  const revision = getTranslationRevision();
  if (indexedRevision === revision) return searchIndex;
  const items = [];
  for (const province of C.provinces) {
    const provinceNames = `${allNames(province.name)} ${allNames(province.capital)} ${(destinationNames[province.id] || []).join(' ')} ${(aliases[province.id] || []).join(' ')}`;
    items.push({ text: normalize(`${provinceNames} ${allNames(province.tagline)}`), item: { kind: 'province', ref: province.id, province } });
    for (const place of province.places) {
      items.push({ text: normalize(`${allNames(place.name)} ${(destinationNames[`${province.id}/${place.id}`] || []).join(' ')} ${provinceNames} ${allNames(place.text)}`), item: { kind: 'place', ref: `${province.id}/${place.id}`, province, place } });
    }
  }
  indexedRevision = revision;
  return searchIndex = items;
}
export function searchDestinations({ query = '', region = 'all', interest = 'all' } = {}) {
  const terms = normalize(query).slice(0, 120).split(' ').filter(Boolean);
  return destinationIndex().filter(({ text, item }) =>
    (region === 'all' || item.province.region === region) &&
    (interest === 'all' || item.place?.type === interest) &&
    terms.every(term => text.includes(term))
  ).map(({ item }) => item);
}

export function cleanSavedRefs(value) {
  return Array.isArray(value) ? [...new Set(value.filter(ref => typeof ref === 'string' && C.findPlace(ref)))].slice(0, 86) : [];
}
export function toggleSavedRef(saved, ref) {
  const current = cleanSavedRefs(saved);
  if (!C.findPlace(ref)) return current;
  return current.includes(ref) ? current.filter(item => item !== ref) : [...current, ref];
}
export function inquiryContext(kind, ref = '', saved = []) {
  if (kind === 'package') {
    const item = C.packages.find(pk => pk.id === ref);
    if (item) return { kind, ref, item };
  }
  if (kind === 'province') {
    const item = C.findProvince(ref);
    if (item) return { kind, ref, item };
  }
  if (kind === 'place') {
    const item = C.findPlace(ref);
    if (item) return { kind, ref, item };
  }
  if (kind === 'saved') return { kind, refs: cleanSavedRefs(saved) };
  return { kind: 'custom' };
}

export function buildInquiryText({ context = { kind: 'custom' }, lang = 'th', date = '', month = '', interests = [], travelers = 2, notes = '', name = '' } = {}) {
  const L = value => value?.[lang] || value?.th || '';
  const people = Number.isInteger(Number(travelers)) && Number(travelers) >= 1 && Number(travelers) <= 99 ? Number(travelers) : 2;
  const lines = [translate("รายละเอียดการเดินทางที่สนใจ — MVM Group", "Trip inquiry for MVM Group", lang)];
  if (context.kind === 'package') {
    const daysLabel = context.item.days === 1 ? translate("วัน", "day", lang) : translate("วัน", "days", lang);
    const nightsLabel = context.item.nights === 1 ? translate("คืน", "night", lang) : translate("คืน", "nights", lang);
    lines.push(`${translate("แผนเที่ยวตัวอย่าง", "Sample itinerary", lang)}: ${L(context.item.title)} (${context.item.days} ${daysLabel} ${context.item.nights} ${nightsLabel})`);
  } else if (context.kind === 'province') lines.push(`${translate("จุดหมาย", "Destination", lang)}: ${L(context.item.name)}`);
  else if (context.kind === 'place') lines.push(`${translate("สถานที่", "Place", lang)}: ${L(context.item.place.name)} · ${L(context.item.province.name)}`);
  else if (context.kind === 'saved') {
    lines.push(translate("สถานที่ที่อยากไป:", "Places I would like to visit:", lang));
    for (const ref of context.refs) { const found=C.findPlace(ref); if(found)lines.push(`• ${L(found.place.name)} · ${L(found.province.name)}`); }
  }
  if (name.trim()) lines.push(`${translate("ชื่อ", "Name", lang)}: ${name.trim().slice(0, 80)}`);
  lines.push(`${translate("จำนวนผู้เดินทาง", "Travellers", lang)}: ${people}`);
  const chosenMonth = /^\d{4}-\d{2}-\d{2}$/.test(date) ? '' : monthLabel(month, lang);
  if (chosenMonth) lines.push(`${travelText(lang, 'monthLine')}: ${chosenMonth}`);
  else lines.push(`${translate("วันที่อยากเดินทาง", "Preferred date", lang)}: ${/^\d{4}-\d{2}-\d{2}$/.test(date) ? date : (translate("ยืดหยุ่น / ยังไม่กำหนด", "Flexible / to be confirmed", lang))}`);
  const chosenInterests = inquiryInterests.filter(id => Array.isArray(interests) && interests.includes(id)).map(id => travelText(lang, interestKey(id)));
  if (chosenInterests.length) lines.push(`${travelText(lang, 'interestsLine')}: ${chosenInterests.join(lang === 'zh' ? '、' : ', ')}`);
  if (notes.trim()) lines.push(`${translate("รายละเอียดเพิ่มเติม", "Notes", lang)}: ${notes.trim().slice(0, 1500)}`);
  lines.push(translate("ขอสอบถามวันว่าง บริการที่รวม และราคายืนยัน ข้อความนี้เป็นการสอบถาม ยังไม่ใช่การจอง", "Please confirm availability, services and the final quote. This is an inquiry, not a booking.", lang));
  return lines.join('\n');
}

export function inquiryChannelHref(kind, contact, message = '', lang = 'en') {
  if (kind === 'whatsapp' && /^\+?[\d\s()-]{7,25}$/.test(contact.whatsapp || '')) return `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  if (kind === 'line' && contact.line) return contact.line.startsWith('@')
    ? `https://line.me/R/oaMessage/${encodeURIComponent(contact.line)}/?${encodeURIComponent(message)}`
    : `https://line.me/R/ti/p/${encodeURIComponent(contact.line)}`;
  if (kind === 'email' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email || '')) return `mailto:${contact.email}?subject=${encodeURIComponent(translate('MVM Group — สอบถามการเดินทาง', 'MVM Group — Trip inquiry', lang))}&body=${encodeURIComponent(message)}`;
  return '';
}

export function routeMapHref(refs = []) {
  const stops=refs.map(ref=>C.findPlace(ref)).filter(Boolean).slice(0,5).map(item=>`${item.place.name.en}, ${item.province.name.en}, Laos`);
  if(!stops.length)return '';
  const params=new URLSearchParams({api:'1'});
  if(stops.length===1){params.set('query',stops[0]);return `https://www.google.com/maps/search/?${params}`;}
  params.set('origin',stops[0]);params.set('destination',stops.at(-1));
  if(stops.length>2)params.set('waypoints',stops.slice(1,-1).join('|'));
  return `https://www.google.com/maps/dir/?${params}`;
}
