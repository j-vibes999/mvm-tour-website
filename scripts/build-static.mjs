import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompress, constants as zlibConstants, gzip } from 'node:zlib';
import { promisify } from 'node:util';
import * as C from '../dist/content.js';
import { extraPhotos, localPhotos, placePhotos, provincePhotos } from '../dist/complete-media.js';
import { locales, publicHref, resolveRoute } from '../dist/routes.js';
import { languageInfo, translate } from '../dist/i18n.js';
import { createKit, placePhotoKey, provincePhotoKey } from '../dist/ui-kit.js';

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const text = (value, lang) => typeof value === 'string' ? value : value?.[lang] ?? value?.th ?? '';
const photos = { ...C.photos, ...extraPhotos };
const list = (items, render) => (items || []).map(render).join('');
const local = (th, en, lang, pattern = en, values = []) => translate(th, en, lang, pattern, values);

export function normalizeSiteUrl(value) {
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error('SITE_URL must be an absolute http: or https: URL.'); }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('SITE_URL must use http: or https:.');
  if (parsed.username || parsed.password) throw new Error('SITE_URL must not contain credentials.');
  if (parsed.pathname !== '/') throw new Error('Publish at a domain root: SITE_URL must not contain a subdirectory.');
  return `${parsed.origin}/`;
}

function photoKeyFor(route) {
  if (route.kind === 'home') return C.slides[0].photo;
  if (route.place) return placePhotos[`${route.province.id}/${route.place.id}`] || route.place.photo;
  if (route.package?.photo) return route.package.photo;
  const provinceId = route.province?.id || route.package?.provinceId;
  return provincePhotos[provinceId] || route.province?.photo;
}

function imageFor(route, siteUrl) {
  const key = photoKeyFor(route);
  if (key && photos[key]) return localPhotos[key]?.src ? new URL(`/${localPhotos[key].src}`, siteUrl).href : photos[key].src;
  const item = route.place || route.package || route.province;
  const image = item?.image || route.province?.image;
  if (image && C.images[image]) return new URL(`/assets/images/${image}-1600.webp`, siteUrl).href;
  return new URL('/assets/images/og-image.jpg', siteUrl).href;
}

function photoCredit(key, lang = 'en') {
  const photo = photos[key];
  if (!photo) return '';
  if (photo.kind === 'generated') return `${local('ภาพประกอบ AI อ้างอิงสถานที่จริง', 'AI-generated illustration based on real-location references', lang)} · ${(photo.referenceUrls || []).map((url, i) => `<a href="${escape(url)}">${local('แหล่งอ้างอิง', 'Location reference', lang)} ${i + 1}</a>`).join(' · ')}`;
  const source = photo.sourceUrl || `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(photo.file)}`;
  const license = photo.licenseUrl ? `<a href="${escape(photo.licenseUrl)}">${escape(photo.license)}</a>` : escape(photo.license);
  return `<a href="${escape(source)}">${escape(photo.file)}</a> — ${escape(photo.author)} · ${license}${localPhotos[key] ? ' · Resized and converted to WebP' : ''}`;
}

function routePhoto(route, alt) {
  const key = photoKeyFor(route);
  const photo = photos[key];
  if (!photo) return '';
  const cached = localPhotos[key];
  const srcset = cached?.srcset ? ` srcset="${escape(cached.srcset)}" sizes="(max-width: 640px) 100vw, 80vw"` : '';
  const imageAlt = photo.kind === 'generated' ? `${local('ภาพประกอบ AI ของ', 'AI illustration of ', route.lang)}${alt}` : alt;
  return `<figure><img src="${escape(cached?.src || photo.src)}"${srcset} width="${photo.w}" height="${photo.h}" loading="lazy" alt="${escape(imageAlt)}" style="max-width:100%;height:auto"><figcaption>${photoCredit(key,route.lang)}</figcaption></figure>`;
}

function routeMetadata(route, siteUrl) {
  const lang = route.lang;
  const L = value => text(value, lang);
  const homeTitle = local('MVM Group — ออกเดินทางไปหลงรักลาว', 'MVM Group — A journey to fall for Laos', lang);
  const homeDescription = local('สำรวจครบ 18 แขวงของลาวกับ MVM Group ค้นหาสถานที่เที่ยวที่ชอบ ดูแผนเที่ยวตัวอย่าง แล้ววางแผนการเดินทางของคุณ', 'Discover all 18 provinces of Laos with MVM Group. Find places you love, explore sample trips and plan your journey.', lang);
  const labels = {
    explore: local('สำรวจลาว', 'Explore Laos', lang), highlights: local('ที่เที่ยวยอดนิยม', 'Top places in Laos', lang),
    packages: local('แพ็กเกจทัวร์ลาว', 'Laos tour packages', lang), about: local('เกี่ยวกับ MVM Group', 'About MVM Group', lang),
    faq: local('คำถามที่พบบ่อย', 'Frequently asked questions', lang), credits: local('เครดิตภาพ', 'Photo credits', lang), saved: local('สถานที่ที่อยากไป', 'Saved places', lang),
    inquiry: local('วางแผนเที่ยว', 'Plan a trip', lang), notFound: local('ไม่พบหน้า', 'Page not found', lang),
  };
  let title = labels[route.kind] || '';
  let description = homeDescription;
  if (route.kind === 'place') {
    title = `${L(route.place.name)} · ${L(route.province.name)}`;
    description = L(C.placeDetails[`${route.province.id}/${route.place.id}`]?.about || route.place.text);
  } else if (route.kind === 'province') {
    title = `${L(route.province.name)} · ${local('สถานที่ท่องเที่ยวลาว', 'Places to visit in Laos', lang)}`;
    description = L(route.province.intro);
  } else if (route.kind === 'package') {
    title = L(route.package.destination || route.package.title);
    const daysUnit = route.package.days === 1 ? local('วัน', 'day', lang) : local('วัน', 'days', lang);
    const nightsUnit = route.package.nights === 1 ? local('คืน', 'night', lang) : local('คืน', 'nights', lang);
    description = `${title} · ${route.package.days} ${daysUnit} ${route.package.nights} ${nightsUnit} · ${local('โปรแกรมตัวอย่าง ปรับเส้นทางและขอใบเสนอราคากับ MVM Group', 'A sample itinerary to tailor and request a quote from MVM Group', lang)}`;
  } else if (route.region) {
    title = `${L(route.region.name)} · ${title}`;
    description = L(route.region.intro);
  }
  return {
    title: title ? `${title} | MVM Group` : homeTitle,
    heading: title || homeTitle,
    description: description.replace(/\s+/g, ' ').trim(),
    image: imageFor(route, siteUrl),
    imageAlt: `${photos[photoKeyFor(route)]?.kind === 'generated' ? local('ภาพประกอบ AI อ้างอิงสถานที่จริง · ', 'AI illustration based on the real location · ', lang) : ''}${title || homeTitle}`,
    canonical: new URL(publicHref({ ...route, query: '' }, lang), siteUrl).href,
  };
}

function routeContent(route) {
  const lang = route.lang;
  const L = value => text(value, lang);
  const T = (th, en, pattern = en, values = []) => local(th, en, lang, pattern, values);
  const a = (href, label) => `<a href="${escape(publicHref(href, lang))}">${escape(label)}</a>`;
  const p = value => value ? `<p>${escape(value)}</p>` : '';
  const provinceLinks = provinces => `<ul>${list(provinces, item => `<li>${a(`#/province/${item.id}`, L(item.name))}${p(L(item.tagline))}</li>`)}</ul>`;
  const placeLinks = province => `<ul>${list(province.places, item => `<li>${a(`#/province/${province.id}/${item.id}`, L(item.name))}${p(L(item.text))}</li>`)}</ul>`;
  let html = '';
  if (route.kind === 'home') {
    html = `<h1>${T('ออกเดินทางไปหลงรักลาว', 'A journey to fall for Laos')}</h1>${p(T('สำรวจลาวกับ MVM Group เริ่มจากสถานที่ที่คุณอยากไป แล้วเลือกการเดินทางในแบบของคุณ', 'Explore Laos with MVM Group. Start with places that inspire you and find a journey of your own.'))}<h2>${T('เลือกจุดหมาย', 'Choose a destination')}</h2>${provinceLinks(C.provinces)}<p>${a('#/packages', T('ดูแพ็กเกจทัวร์', 'Explore tour packages'))}</p>`;
  } else if (route.kind === 'province') {
    html = `<h1>${escape(L(route.province.name))}</h1>${p(L(route.province.tagline))}${p(L(route.province.intro))}${routePhoto(route, L(route.province.name))}<h2>${T('สถานที่ท่องเที่ยว', 'Places to visit')}</h2>${placeLinks(route.province)}<p>${a(`#/packages?province=${route.province.id}`, T('ดูแผนเที่ยวสำหรับแขวงนี้', 'See trips for this province'))}</p>`;
  } else if (route.kind === 'place') {
    const { province, place } = route;
    const details = C.placeDetails[`${province.id}/${place.id}`];
    const photo = routePhoto(route, L(place.name));
    const labels = { best: T('ช่วงเวลาที่เหมาะ', 'Best time'), time: T('เวลาที่แนะนำ', 'Suggested time'), access: T('การเดินทาง', 'Getting there'), note: T('ควรรู้ก่อนไป', 'Before you go'), tip: T('เคล็ดลับจากทีมงาน', 'A tip from our team') };
    html = `<p>${a(`#/province/${province.id}`, L(province.name))}</p><h1>${escape(L(place.name))}</h1>${p(L(place.text))}${photo}${p(L(details?.about))}${details?.highlights ? `<h2>${T('จุดเด่น', 'Highlights')}</h2><ul>${list(L(details.highlights), value => `<li>${escape(value)}</li>`)}</ul>` : ''}${list(Object.entries(labels), ([key, label]) => details?.[key] ? `<h2>${label}</h2>${p(L(details[key]))}` : '')}<p>${a(`#/inquiry?kind=place&ref=${encodeURIComponent(`${province.id}/${place.id}`)}`, T('วางแผนเที่ยวที่นี่', 'Plan a trip here'))}</p><h2>${T('เที่ยวต่อในแขวงเดียวกัน', 'More in this province')}</h2>${placeLinks(province)}`;
  } else if (route.kind === 'explore') {
    html = `<h1>${route.region ? escape(L(route.region.name)) : T('สำรวจครบ 18 แขวงของลาว', 'Explore all 18 provinces of Laos')}</h1>${p(route.region ? L(route.region.intro) : T('เลือกภาคหรือแขวงที่สนใจ เพื่อทำความรู้จักสถานที่ท่องเที่ยวของลาว', 'Choose a region or province and discover the places of Laos.'))}${provinceLinks(C.provincesByRegion(route.region?.id))}`;
  } else if (route.kind === 'highlights') {
    html = `<h1>${T('ที่เที่ยวยอดนิยม', 'Top places in Laos')}${route.region ? ` · ${escape(L(route.region.name))}` : ''}</h1><ul>${list(C.famousPlaces(route.region?.id), item => `<li>${a(`#/province/${item.province.id}/${item.place.id}`, L(item.place.name))} · ${escape(L(item.province.name))}${p(L(item.place.text))}</li>`)}</ul>`;
  } else if (route.kind === 'packages') {
    html = `<h1>${T('แพ็กเกจทัวร์ลาว', 'Laos tour packages')}</h1>${p(T('โปรแกรมและราคาเป็นตัวอย่าง โปรดขอใบเสนอราคาตามวันเดินทาง จำนวนผู้ร่วมเดินทาง และบริการที่เลือก', 'Itineraries and prices are examples. Request a quote for your dates, group size and selected services.'))}<ul>${list(C.packages, trip => {
      const destination = L(trip.destination || trip.title);
      const price = trip.price.toLocaleString(lang === 'en' ? 'en-US' : 'th-TH');
      const daysUnit = trip.days === 1 ? T('วัน', 'day') : T('วัน', 'days');
      const nightsUnit = trip.nights === 1 ? T('คืน', 'night') : T('คืน', 'nights');
      return `<li><h2>${a(`#/package/${trip.id}`, destination)}</h2>${p(L(trip.title))}${p(`${trip.days} ${daysUnit} ${trip.nights} ${nightsUnit}`)}${p(T(`ราคาตัวอย่าง ${price} บาท / ท่าน`, `Example price THB ${price} / person`, "Example price THB {0} / person", [price]))}${p(L(trip.highlights).join(' · '))}</li>`;
    })}</ul>`;
  } else if (route.kind === 'package') {
    const trip = route.package;
    const destination = L(trip.destination || trip.title);
    const price = trip.price.toLocaleString(lang === 'en' ? 'en-US' : 'th-TH');
    const daysUnit = trip.days === 1 ? T('วัน', 'day') : T('วัน', 'days');
    const nightsUnit = trip.nights === 1 ? T('คืน', 'night') : T('คืน', 'nights');
    html = `<h1>${escape(destination)}</h1>${trip.destination ? p(L(trip.title)) : ''}${p(`${trip.days} ${daysUnit} ${trip.nights} ${nightsUnit}`)}${p(T(`ราคาตัวอย่าง ${price} บาท / ท่าน`, `Example price THB ${price} / person`, "Example price THB {0} / person", [price]))}${routePhoto(route, destination)}<h2>${T('จุดเด่น', 'Highlights')}</h2><ul>${list(L(trip.highlights), value => `<li>${escape(value)}</li>`)}</ul>${p(L(trip.priceBasis))}${p(L(trip.itineraryNote))}<h2>${T('แผนการเดินทางรายวัน', 'Day-by-day suggestion')}</h2>${list(trip.itinerary, day => `<h3>${T(`วันที่ ${day.day}`, `Day ${day.day}`, 'Day {0}', [day.day])} · ${escape(L(day.title))}</h3>${p(L(day.summary))}${day.activities ? `<ul>${list(L(day.activities), value => `<li>${escape(value)}</li>`)}</ul>` : ''}`)}${p(T('แผนเที่ยวและราคาเป็นตัวอย่าง ยืนยันเส้นทาง บริการ และราคากับทีมงานก่อนจอง', 'This is a sample itinerary. Confirm the route, services and price with the team before booking.'))}<p>${a(`#/inquiry?kind=package&ref=${trip.id}`, T('สอบถามการเดินทางนี้', 'Ask about this trip'))}</p>`;
  } else if (route.kind === 'credits') {
    html = `<h1>${T('เครดิตภาพ', 'Photo credits')}</h1><ul>${list(Object.keys(photos), key => `<li>${photoCredit(key,route.lang)}</li>`)}</ul>`;
  } else if (route.kind === 'about') {
    html = `<h1>${T('เกี่ยวกับ MVM Group', 'About MVM Group')}</h1>${p(L(C.companyProfile?.intro))}${list(C.companyProfile?.approach, item => `<h2>${escape(L(item.title))}</h2>${p(L(item.text))}`)}<h2>${T('คำถามที่พบบ่อย', 'Frequently asked questions')}</h2>${list(C.faq, item => `<h3>${escape(L(item.question))}</h3>${p(L(item.answer))}`)}<p>${a('#/inquiry', T('วางแผนเที่ยว', 'Plan a trip'))}</p>`;
  } else if (route.kind === 'faq') {
    html = `<h1>${T('คำถามที่พบบ่อย', 'Frequently asked questions')}</h1>${list(C.faq, item => `<h2>${escape(L(item.question))}</h2>${p(L(item.answer))}`)}<p>${a('#/inquiry', T('วางแผนเที่ยว', 'Plan a trip'))}</p>`;
  } else if (route.kind === 'saved') {
    html = `<h1>${T('สถานที่ที่อยากไป', 'Saved places')}</h1>${p(T('เปิด JavaScript เพื่อดูรายการที่คุณเก็บไว้บนอุปกรณ์นี้', 'Enable JavaScript to view places saved on this device.'))}<p>${a('#/explore', T('สำรวจสถานที่', 'Explore places'))}</p>`;
  } else if (route.kind === 'inquiry') {
    html = `<h1>${T('วางแผนเที่ยวกับ MVM Group', 'Plan a trip with MVM Group')}</h1>${p(T('เปิด JavaScript เพื่อเลือกรายการสถานที่ วันเดินทาง และจำนวนผู้ร่วมเดินทาง แล้วเตรียมข้อความสอบถามการเดินทาง', 'Enable JavaScript to choose places, dates and group size, then prepare your trip inquiry.'))}`;
  } else {
    html = `<h1>${T('ไม่พบหน้า', 'Page not found')}</h1><p>${a('#/', T('กลับหน้าแรก', 'Back to home'))}</p>`;
  }
  return `<div class="seo-fallback"><article class="container page-head" style="padding-bottom:64px">${html}</article></div>`;
}

// ── first-paint shells: the same markup the app renders, so nothing jumps when it starts ──
const SECTION = { home: 'home', explore: 'explore', province: 'explore', place: 'explore', highlights: 'highlights', packages: 'packages', package: 'packages', about: 'about', saved: 'saved', inquiry: 'inquiry' };
const COMPACT = new Set(['explore', 'province', 'place', 'highlights', 'packages', 'package', 'saved']);
const publicLinks = (html, lang) => html.replace(/href="(#\/[^"]*)"/g, (match, route) => `href="${escape(publicHref(route, lang))}"`);

function planRoute(route) {
  if (route.kind === 'package') return `#/inquiry?kind=package&ref=${route.package.id}`;
  if (route.kind === 'place') return `#/inquiry?kind=place&ref=${route.province.id}/${route.place.id}`;
  if (route.kind === 'province') return `#/inquiry?kind=province&ref=${route.province.id}`;
  if (route.kind === 'saved') return '#/inquiry?kind=saved';
  return '#/inquiry';
}

function shellContent(route, kit) {
  switch (route.kind) {
    case 'home': return kit.homeHeroHtml(0);
    case 'province': return kit.provinceHeroHtml(route.province);
    case 'place': return placeShell(route, kit);
    case 'explore': return kit.exploreHead(route.region?.id || 'all');
    case 'highlights': return kit.highlightsHead(route.region?.id || 'all');
    case 'packages': return kit.packagesHead();
    case 'package': return kit.packageTop(route.package);
    case 'about': return kit.aboutHead() + kit.aboutGallery();
    case 'faq': return kit.faqHead();
    case 'saved': return kit.savedHead();
    case 'inquiry': return kit.inquiryHead();
    case 'credits': return kit.creditsHead();
    default: return kit.notFoundHtml();
  }
}

function placeShell(route, kit) {
  const { province, place, lang } = route;
  // Reuse the viewer's responsive stage without creating a second live dialog.
  // The app replaces this inert first paint after its requested slide is ready.
  const index = province.places.indexOf(place);
  return `<div id="place-first-paint" class="place-entry-shell" aria-hidden="true" style="position:fixed;inset:0;z-index:50;display:grid;grid-template-rows:auto minmax(0,1fr) auto;background:#06140e;color:var(--paper);pointer-events:none"><div class="v-top"><span style="width:46px;height:46px"></span><div class="v-where"><b>${escape(text(province.name, lang))}</b><span class="v-count">${index + 1} / ${province.places.length}</span></div></div><div class="v-track"><div class="v-slide is-active" data-index="${index}"><div class="v-media">${kit.media(placePhotoKey(province, place), { eager: true, sizes: '100vw', alt: text(place.name, lang) })}</div><div class="v-info"><h2 class="v-title">${escape(text(place.name, lang))}</h2><p class="v-about">${escape(text(place.text, lang))}</p></div></div></div><div class="v-rail"><span class="v-thumb">${escape(text(place.name, lang))}</span></div></div>`;
}

// The shell sits in a <template>: crawlers and no-JavaScript visitors read the plain fallback,
// while an inline script shows the shell before the first paint.
function mainShell(route, kit) {
  const shell = publicLinks(shellContent(route, kit), route.lang);
  return `<template id="page-shell"><div class="js-shell">${shell}</div></template><script>(function(t){if(t&&document.documentElement.classList.contains('js'))t.replaceWith(t.content.cloneNode(true))})(document.getElementById('page-shell'))</script>`;
}

function heroPreloadFor(route) {
  const sizes = { home: '(max-width: 640px) 200vw, 100vw', package: '(max-width: 760px) 100vw, 65vw' }[route.kind] || '100vw';
  let key = '';
  if (route.kind === 'home') key = C.slides[0].photo;
  else if (route.kind === 'place') key = placePhotoKey(route.province, route.place);
  else if (route.kind === 'province') key = provincePhotoKey(route.province);
  else if (route.kind === 'package') key = route.package.photo || route.package.image;
  const local = key && localPhotos[key];
  return local ? `<link rel="preload" as="image" href="${escape(local.src)}" imagesrcset="${escape(local.srcset)}" imagesizes="${sizes}" fetchpriority="high">` : '';
}

function organization(siteUrl, lang) {
  const contact = C.site.contact || {};
  const data = { '@context': 'https://schema.org', '@type': 'Organization', name: C.site.name, url: siteUrl };
  if (contact.phone) data.telephone = contact.phone;
  if (contact.email) data.email = contact.email;
  const address = text(contact.address, lang);
  if (address) data.address = address;
  if (/^https?:\/\//.test(contact.facebook || '')) data.sameAs = [contact.facebook];
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

function pageHtml(template, route, siteUrl, assets = {}) {
  const meta = routeMetadata(route, siteUrl);
  const L = (th, en, pattern = en, values = []) => local(th, en, route.lang, pattern, values);
  const heroPreload = heroPreloadFor(route);
  const fontFiles = {
    th: ['noto-sans-thai-thai-400.woff2', 'noto-serif-thai-thai-600.woff2'],
    en: ['noto-sans-thai-latin-400.woff2', 'noto-serif-thai-latin-600.woff2'],
    lo: ['noto-sans-lao-400.woff2', 'noto-serif-lao-lao-500.woff2'],
    zh: [],
  }[route.lang];
  const fontPreloads = fontFiles.map(file => `<link rel="preload" href="assets/fonts/${file}" as="font" type="font/woff2" crossorigin>`).join('\n  ');
  const kit = createKit(() => route.lang);
  const alternatives = locales.map(lang => `<link rel="alternate" hreflang="${languageInfo[lang].tag}" href="${escape(new URL(publicHref({ ...route, query: '' }, lang), siteUrl).href)}">`).join('\n  ');
  const metadata = `<title>${escape(meta.title)}</title>
  <meta name="description" content="${escape(meta.description)}">
  <meta name="robots" content="${route.noindex || !route.exists ? 'noindex,follow' : 'index,follow'}">
  <link rel="canonical" href="${escape(meta.canonical)}">
  ${alternatives}
  <link rel="alternate" hreflang="x-default" href="${escape(new URL(publicHref({ ...route, query: '' }, 'th'), siteUrl).href)}">
  <meta property="og:site_name" content="MVM Group">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escape(meta.title)}">
  <meta property="og:description" content="${escape(meta.description)}">
  <meta property="og:url" content="${escape(meta.canonical)}">
  <meta property="og:locale" content="${languageInfo[route.lang].og}">
  ${locales.filter(lang => lang !== route.lang).map(lang => `<meta property="og:locale:alternate" content="${languageInfo[lang].og}">`).join('\n  ')}
  <meta property="og:image" content="${escape(meta.image)}">
  <meta property="og:image:alt" content="${escape(meta.imageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${organization(siteUrl, route.lang)}</script>`;
  let html = template
    .replace(/<html lang="[^"]*">/, `<html lang="${languageInfo[route.lang].tag}">`)
    .replace(/\s*<title>[\s\S]*?<\/title>/g, '')
    .replace(/\s*<meta\s+(?:name="(?:description|robots|twitter:[^"]*)"|property="og:[^"]*")[^>]*>/g, '')
    .replace(/\s*<link\s+rel="(?:canonical|alternate)"[^>]*>/g, '')
    .replace(/\s*<base[^>]*>/g, '')
    .replace(/\s*<link\b[^>]*\bas="font"[^>]*>/g, '')
    .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
    .replace(/\s*<script>\s*\/\/ start loading the hero photo early[\s\S]*?<\/script>/, '')
    .replace(/(<meta charset="utf-8">)/, '$1\n  <base href="/">')
    .replace('</head>', `  ${fontPreloads}\n  ${heroPreload}${assets.localePreloads?.[route.lang] ? `\n  ${assets.localePreloads[route.lang]}` : ''}\n  ${metadata}\n</head>`)
    .replace(/<main\b([^>]*)>[\s\S]*?<\/main>/, (match, attributes) => `<main${attributes}${COMPACT.has(route.kind) ? ' class="compact-content"' : ''}>${mainShell(route, kit)}${routeContent(route)}</main>`)
    .replace(/(<nav class="mobile-bar"[^>]*>)[\s\S]*?<\/nav>/, (match, open) => `${open.replace(/aria-label="[^"]*"/, `aria-label="${L('ทางลัด', 'Quick actions')}"`)}${publicLinks(kit.barHtml(SECTION[route.kind] || 'none', { planHref: planRoute(route) }), route.lang)}</nav>`);
  const staticPicker = `<details class="language-picker language-picker-static" data-nojs-only><summary class="language-trigger" aria-label="${languageInfo[route.lang].label} — ${L('เลือกภาษา', 'Choose language')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 4 6 4 9s-1 6-4 9c-3-3-4-6-4-9s1-6 4-9Z"/></svg><span class="language-current" lang="${languageInfo[route.lang].tag}">${languageInfo[route.lang].label}</span><svg class="language-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="language-panel"><p class="language-panel-title">${L('เลือกภาษา', 'Choose language')}</p>${locales.map(lang=>`<a class="language-option" href="${publicHref({ ...route, query: '' },lang)}"${lang===route.lang?' aria-current="page"':''}><span class="language-option-label" lang="${languageInfo[lang].tag}">${languageInfo[lang].name}</span><span class="language-option-check" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></span></a>`).join('')}</div></details>`;
  const nav = publicLinks(kit.headerHtml(SECTION[route.kind] || 'none', { staticPicker }), route.lang);
  html = html.replace(/(<header\b[^>]*id="site-header"[^>]*>)[\s\S]*?<\/header>/, (match, open) => `${open}${nav}</header>`)
    .replace(/(<a class="skip-link"[^>]*>)[\s\S]*?<\/a>/, `$1${L('ข้ามไปยังเนื้อหา', 'Skip to content')}</a>`)
    .replace(/<noscript>[\s\S]*?<\/noscript>/, `<noscript><p class="container">${L('อ่านข้อมูลและเปิดหน้าสถานที่ได้ทันที เปิด JavaScript เพื่อใช้งานแผนที่และวางแผนเที่ยว', 'Browse the information and destination pages. Enable JavaScript for the interactive map and trip planner.')}</p></noscript>`);
  return html;
}

// ── assets: hashed production bundles with stable import bridges for integrations ──
const posix = path => path.split(sep).join('/');
const digest = value => createHash('sha256').update(value).digest('hex').slice(0, 12);

async function listFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...await listFiles(path));
    else found.push(path);
  }
  return found;
}

async function optimizeAssets(sourceDir, outDir, template) {
  const esbuild = await import('esbuild');
  // Keep the authored cascade together: SPA navigation can immediately use any page family.
  // Moving the sheet into assets/css requires its font URLs to resolve from the domain root.
  const sheets = [...template.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(match => match[1]);
  let css = '';
  for (const sheet of sheets) css += `/* ${sheet} */\n${await readFile(join(sourceDir, sheet), 'utf8')}\n`;
  css = css.replace(/url\((['"]?)assets\//g, 'url($1/assets/');
  css = (await esbuild.transform(css, { loader: 'css', minify: true, legalComments: 'none', charset: 'utf8' })).code;
  const cssPath = `assets/css/site-${digest(css)}.css`;
  await mkdir(join(outDir, 'assets/css'), { recursive: true });
  await writeFile(join(outDir, cssPath), css);

  const entryFiles = ['app.js', 'content.js', 'i18n.js', 'viewer-gestures.js', 'locales/lo.js', 'locales/zh.js'];
  const result = await esbuild.build({
    absWorkingDir: projectDir,
    entryPoints: entryFiles.map(file => join(sourceDir, file)),
    outdir: join(outDir, 'assets/js'),
    bundle: true, splitting: true, format: 'esm', target: 'es2022',
    entryNames: '[name]-[hash]', chunkNames: 'chunk-[hash]',
    minify: true, legalComments: 'none', charset: 'utf8', metafile: true,

  });
  const outputs = new Map(Object.entries(result.metafile.outputs).map(([path, info]) => [posix(relative(outDir, resolve(projectDir, path))), info]));
  const entries = {};
  for (const [path, info] of outputs) if (info.entryPoint) {
    const source = posix(relative(sourceDir, resolve(projectDir, info.entryPoint)));
    if (entryFiles.includes(source)) entries[source] = path;
  }
  for (const file of entryFiles) {
    const target = entries[file];
    if (!target) throw new Error(`Missing production entry: ${file}`);
    const bridge = posix(relative(dirname(join(outDir, file)), join(outDir, target)));
    const specifier = bridge.startsWith('.') ? bridge : './' + bridge;
    const hasDefault = outputs.get(target).exports.includes('default');
    await writeFile(join(outDir, file), file === 'app.js'
      ? `import ${JSON.stringify(specifier)};\n`
      : `export * from ${JSON.stringify(specifier)};\n${hasDefault ? `export { default } from ${JSON.stringify(specifier)};\n` : ''}`);
  }
  const staticDependencies = entry => {
    const seen = new Set();
    const visit = path => {
      for (const imported of outputs.get(path)?.imports || []) {
        if (imported.external || imported.kind === 'dynamic-import') continue;
        const dependency = posix(relative(outDir, resolve(projectDir, imported.path)));
        if (seen.has(dependency)) continue;
        seen.add(dependency);
        visit(dependency);
      }
    };
    visit(entry);
    return [...seen];
  };
  const preload = files => files.map(file => `<link rel="modulepreload" href="${file}">`).join('\n  ');
  const appPreloads = staticDependencies(entries['app.js']);
  const sheetLinks = /(?:\s*<link rel="stylesheet" href="[^"]+">)+/;
  const builtTemplate = template
    .replace(sheetLinks, `\n  <link rel="stylesheet" href="${cssPath}">`)
    .replace(/(<script type="module" src=")app\.js("[^>]*><\/script>)/, `$1${entries['app.js']}$2\n  ${preload(appPreloads)}`);
  const localePreloads = Object.fromEntries(['lo', 'zh'].map(lang => [lang, preload([entries[`locales/${lang}.js`], ...staticDependencies(entries[`locales/${lang}.js`])])]));
  await writeFile(join(outDir, 'asset-manifest.json'), JSON.stringify({ entries, styles: [cssPath], initialModules: [entries['app.js'], ...appPreloads] }, null, 2) + '\n');
  return { template: builtTemplate, localePreloads, minified: true };
}

const gzipAsync = promisify(gzip);
const brotliAsync = promisify(brotliCompress);
async function writeDeliveryFiles(outDir) {
  const files = await listFiles(outDir);
  const inlineHashes = new Set();
  for (const file of files.filter(file => file.endsWith('.html'))) {
    const html = await readFile(file, 'utf8');
    for (const [, attrs, code] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (!/\bsrc=/.test(attrs)) inlineHashes.add(`'sha256-${createHash('sha256').update(code).digest('base64')}'`);
    }
  }
  const csp = `default-src 'self'; script-src 'self' ${[...inlineHashes].join(' ')}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'`;
  const revalidate = ['/', '/index.html', '/404.html', ...locales.map(lang => `/${lang}/*`), '/locales/*', '/assets/images/*', '/assets/fonts/*', '/asset-manifest.json', '/manifest.webmanifest', '/sitemap.xml', '/robots.txt', ...files.filter(file => dirname(file) === outDir && file.endsWith('.js')).map(file => '/' + relative(outDir, file))];
  const cacheRules = revalidate.map(path => `${path}\n  Cache-Control: public, max-age=0, must-revalidate\n`).join('');
  await writeFile(join(outDir, '_headers'), `# Apply these rules only on a host supporting this _headers format.\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: ${csp}\n${cacheRules}/assets/js/*\n  Cache-Control: public, max-age=31536000, immutable\n/assets/css/*\n  Cache-Control: public, max-age=31536000, immutable\n`);
  // Sidecars are inert until the actual host negotiates Content-Encoding and Vary.
  // Moderate Brotli quality keeps local builds quick; already compressed media is excluded.
  for (const file of files.filter(file => /\.(?:html|js|css|json|xml|svg|txt|webmanifest)$/.test(file))) {
    const raw = await readFile(file);
    const [gz, br] = await Promise.all([
      gzipAsync(raw, { level: 9 }),
      brotliAsync(raw, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 5 } }),
    ]);
    await Promise.all([writeFile(file + '.gz', gz), writeFile(file + '.br', br)]);
  }
}

function allRoutes() {
  const paths = ['/', '/explore', '/highlights', '/packages', '/about', '/credits', '/faq', '/saved', '/inquiry'];
  for (const region of C.regions) paths.push(`/explore/${region.id}`, `/highlights/${region.id}`);
  for (const province of C.provinces) {
    paths.push(`/province/${province.id}`);
    for (const place of province.places) paths.push(`/province/${province.id}/${place.id}`);
  }
  for (const trip of C.packages) paths.push(`/package/${trip.id}`);
  return locales.flatMap(lang => paths.map(path => resolveRoute(path, lang)));
}

export async function buildStatic({ outDir = join(projectDir, 'build'), siteUrl } = {}) {
  const sourceDir = join(projectDir, 'dist');
  outDir = resolve(outDir);
  if (outDir === sourceDir || sourceDir.startsWith(`${outDir}${sep}`) || outDir.startsWith(`${sourceDir}${sep}`)) throw new Error('Build output must be separate from authored dist sources.');
  const template = await readFile(join(sourceDir, 'index.html'), 'utf8');
  const existingOrigin = template.match(/property="og:url" content="([^"]+)"/)?.[1];
  siteUrl = normalizeSiteUrl(siteUrl || process.env.SITE_URL || C.site.url || existingOrigin);
  await rm(outDir, { recursive: true, force: true });
  await cp(sourceDir, outDir, { recursive: true, filter: source => !/(?:\.DS_Store|\.css)$/.test(source) });
  const assets = await optimizeAssets(sourceDir, outDir, template);
  const routes = allRoutes();
  for (const route of routes) {
    const path = publicHref(route, route.lang);
    const target = join(outDir, path, 'index.html');
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, pageHtml(assets.template, route, siteUrl, assets));
  }
  // Root stays useful for existing bookmarks and old hash links; its canonical is Thai home.
  await writeFile(join(outDir, 'index.html'), pageHtml(assets.template, resolveRoute('/th/'), siteUrl, assets));
  await writeFile(join(outDir, '404.html'), pageHtml(assets.template, resolveRoute('/th/not-found/'), siteUrl, assets));
  const urls = routes.filter(route => !route.noindex).map(route => {
    const href = new URL(publicHref(route, route.lang), siteUrl).href;
    const alternates = locales.map(lang => `<xhtml:link rel="alternate" hreflang="${languageInfo[lang].tag}" href="${escape(new URL(publicHref(route, lang), siteUrl).href)}"/>`).join('');
    return `<url><loc>${escape(href)}</loc>${alternates}</url>`;
  }).join('\n');
  await writeFile(join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`);
  await writeFile(join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', siteUrl).href}\n`);
  await writeDeliveryFiles(outDir);
  return { outDir, siteUrl, pages: routes.length + 2, indexedPages: routes.filter(route => !route.noindex).length, minified: assets.minified };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await buildStatic();
  console.log(`Built ${result.pages} static pages in ${result.outDir}`);
  console.log(`Canonical origin: ${result.siteUrl}`);
  console.log(result.minified ? 'Scripts and styles minified with esbuild.' : 'esbuild is not installed: scripts and styles are copied as written (run npm install to minify).');
}
