// Shared markup for the app and the static build. Nothing here touches the DOM, so
// scripts/build-static.mjs can prerender the same header, hero and page heads that the
// app renders later: the first paint already looks like the finished page.
import * as C from './content.js';
import { localPhotos, provincePhotos, placePhotos, extraPhotos } from './complete-media.js';
import { languages, languageInfo, translate } from './i18n.js';
import { publicHref } from './routes.js';
import { photoTones, imageTones } from './photo-tones.js';
import { provinceBounds } from './province-bounds.js';
import { photoThumbnails } from './media-thumbnails.js';

export const PHOTOS = { ...C.photos, ...extraPhotos };
export const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
export const pad2 = n => String(n).padStart(2, '0');
export const placePhotoKey = (pv, pl) => pl.photo || placePhotos[`${pv.id}/${pl.id}`] || pl.image;
export const provincePhotoKey = pv => provincePhotos[pv.id] || pv.photo || pv.image;
export const photoTone = key => photoTones[key] || imageTones[key] || '';
// photos from Wikimedia Commons (C.photos) come in 330 / 960 / 1920 px widths; local images use picture()
export const photoUrl = (ph, width) => ph.src.replace('/960px-', `/${width}px-`);
const thumbnailPath = (key, width) => `assets/images/thumbnails/${key}-${width}.webp`;
export const smallPhoto = (key, requestedWidth = 160) => {
  const width = photoThumbnails[key]?.find(width => width >= requestedWidth);
  return width ? thumbnailPath(key, width) : localPhotos[key]?.srcset.split(',')[0].trim().split(' ')[0] || (PHOTOS[key] ? photoUrl(PHOTOS[key], 330) : C.images[key] ? `assets/images/${key}-800.webp` : '');
};
export const smallPhotoSrcset = key => [
  ...(photoThumbnails[key] || []).map(width => `${thumbnailPath(key, width)} ${width}w`),
  localPhotos[key]?.srcset.split(',')[0].trim(),
].filter(Boolean).join(', ');
export const largePhoto = key => localPhotos[key]?.src || PHOTOS[key]?.src || (C.images[key] ? `assets/images/${key}-1600.webp` : '');

export const ICONS = {
  arrow: '<path d="M4 12h15M13 5l7 7-7 7"/>',
  back: '<path d="M20 12H5m6-7-7 7 7 7"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 4 6 4 9s-1 6-4 9c-3-3-4-6-4-9s1-6 4-9Z"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  up: '<path d="m6 15 6-6 6 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12Z"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 11h18"/>',
  people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
  train: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 10.5h14M9 21l1.5-4M15 21l-1.5-4"/><circle cx="8.5" cy="13.8" r=".6"/><circle cx="15.5" cy="13.8" r=".6"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>',
  share: '<path d="M12 15V3m-5 5 5-5 5 5M5 12H4v9h16v-9h-1"/>',
  facebook: '<path d="M14 22v-9h3l.5-4H14V7c0-1 .4-2 2-2h2V1.5C17 1.2 16 1 15 1c-3 0-5 2-5 5v3H7v4h3v9Z" fill="currentColor" stroke="none"/>',
  nature: '<path d="M3 20h18M6 20l5-9 3 5 2-3 4 7"/><circle cx="16.5" cy="6.5" r="2"/>',
  waterfall: '<path d="M4 4h16M7 4v9M12 4v12M17 4v9"/><path d="M4 19c2 1.5 4 1.5 6 0s4-1.5 6 0 3 1 4 .5"/>',
  river: '<path d="M3 6c3-3 6 3 9 0s6 3 9 0M3 12c3-3 6 3 9 0s6 3 9 0M3 18c3-3 6 3 9 0s6 3 9 0"/>',
  cave: '<path d="M3 20c0-9 4-15 9-15s9 6 9 15"/><path d="M8.5 20c0-4 1.6-7 3.5-7s3.5 3 3.5 7"/>',
  temple: '<path d="M12 2v3M10 5h4l-.5 3h-3L10 5ZM8 8h8l-1 4H9L8 8ZM6 12h12l-1 4H7l-1-4ZM4 20h16M6 16v4M18 16v4"/>',
  history: '<path d="M3 21h18M4 10h16M12 3 4 7h16l-8-4ZM6 10v8M10 10v8M14 10v8M18 10v8"/>',
  culture: '<path d="M12 20c-4 0-8-2.5-8-6 2.5 0 5 1 6.5 3M12 20c4 0 8-2.5 8-6-2.5 0-5 1-6.5 3M12 20c-2.5-2-3.5-5-3.5-8S10 6 12 4c2 2 3.5 5 3.5 8s-1 6-3.5 8Z"/>',
  activity: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  viewpoint: '<circle cx="7" cy="15" r="3.5"/><circle cx="17" cy="15" r="3.5"/><path d="M10.5 15h3M5 11.5 7 5h3l1 6M19 11.5 17 5h-3l-1 6"/>',
  market: '<path d="M4 9h16l-1.5 10.5a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5L4 9Z"/><path d="m8 9 3-5M16 9l-3-5M9 13v4M15 13v4M12 13v4"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>',
  rain: '<path d="M7 17a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 9a4 4 0 0 1-1 8"/><path d="m9 19-1 2M13 19l-1 2M17 19l-1 2"/>',
  route: '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.4"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  camera: '<path d="M4 8h3l1.5-2.5h7L17 8h3v11H4V8Z"/><circle cx="12" cy="13" r="3.5"/>',
  grip: '<circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  play: '<path d="m9 5 10 7-10 7Z"/>',
  pause: '<path d="M9 5v14M15 5v14"/>',
};
export const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ICONS.arrow}</svg>`;
export const ornament = '<svg viewBox="0 0 64 10" aria-hidden="true"><path d="M0 5h20M44 5h20" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M26 5l6-5 6 5-6 5z" fill="currentColor"/></svg>';
export const eyebrow = text => `<p class="eyebrow">${ornament}${text}</p>`;
export const logoSvg = '<svg viewBox="0 0 90 60" fill="currentColor" aria-hidden="true"><path d="m3 42 20-26 11 12L47 5l25 31-15-5-11-16-9 17 10 8L34 34 25 24 14 39l18-2 8 5Z"/><path d="m53 30 11-13 22 25H57l-8-9 15 4-7-9Z"/><path d="M7 47q25-10 66-1-38-2-37 3 10 4 49 3-33 9-62 1 32 3 26-2-9-4-42-4"/></svg>';
export const mountainArt = '<svg class="mountain-art" viewBox="0 0 800 200" preserveAspectRatio="none" aria-hidden="true"><path fill="currentColor" opacity=".4" d="M0 150 L60 125 L100 140 L165 75 L185 87 L235 49 L275 88 L300 80 L358 130 L398 110 L453 135 L513 68 L543 88 L610 15 L642 45 L702 5 L745 26 L800 50 V200 H0 Z"/><path fill="currentColor" opacity=".7" d="M0 180 L70 155 L110 163 L160 127 L210 146 L250 116 L320 161 L360 141 L415 161 L465 126 L515 136 L545 104 L585 119 L635 74 L695 114 L750 76 L800 98 V200 H0 Z"/><path fill="currentColor" d="m0 190 90-12 42 10 60-24 55 14 60-16 90 22 80-31 70 19 75-31 65 10 45-20 68 33V200H0Z"/></svg>';

// Where each hero photograph drifts towards during its slow zoom, so the subject stays in frame.
export const HERO_FOCUS = {
  'vang-vieng': '62% 45%', phousi: '40% 60%', 'tad-fane': '50% 32%', 'that-luang': '50% 42%', 'kuang-si': '45% 55%',
  'nong-khiaw': '58% 40%', 'si-phan-don': '30% 50%', 'kong-lor': '50% 45%', 'muang-ngoi': '55% 48%', 'wat-xieng-thong': '50% 40%',
  'nam-xay': '60% 36%', 'vat-phou': '45% 58%', 'plain-of-jars': '50% 55%', 'khone-phapheng': '40% 50%',
};
export const heroSlideHref = slide => `#/province/${slide.placeRef || slide.provinceId}`;

export function createKit(getLang) {
  const lang = () => getLang();
  const t = (th, en, pattern = en, values = []) => translate(th, en, lang(), pattern, values);
  const L = value => (value ? value[lang()] ?? value.th : '');
  const nameOf = province => L(province.short || province.name);
  const brand = () => `<a class="brand" href="#/" aria-label="MVM Group Explore Laos — ${t('หน้าแรก', 'Home')}">${logoSvg}<span class="brand-name"><b>MVM Group</b><small>EXPLORE LAOS</small></span></a>`;

  function picture(key, { alt = '', sizes = '100vw', cls = '', eager = false, id = '', deferred = false } = {}) {
    const meta = C.images[key];
    if (!meta) return '';
    const src = width => `assets/images/${key}-${width}.webp`;
    const tone = imageTones[key];
    return `<img ${id ? `id="${id}" ` : ''}class="${cls}" ${deferred ? 'data-src' : 'src'}="${src(1600)}" ${deferred ? 'data-srcset' : 'srcset'}="${src(800)} 800w, ${src(1600)} 1600w" sizes="${sizes}" alt="${esc(alt)}" width="${meta.w}" height="${meta.h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}${tone ? ` style="--tone:${tone}"` : ''}>`;
  }
  const thumb = key => `<img src="assets/images/${key}-160.webp" alt="" width="64" height="48" decoding="async">`;
  function heroThumb(slide) {
    if (!slide.photo) return thumb(slide.image);
    const src = smallPhoto(slide.photo, 320) || PHOTOS[slide.photo]?.src;
    const srcset = smallPhotoSrcset(slide.photo);
    return `<img src="${esc(src)}"${srcset ? ` srcset="${esc(srcset)}" sizes="(max-width: 640px) 146px, (max-width: 1000px) 158px, 168px"` : ''} alt="" width="168" height="94" loading="lazy" decoding="async" draggable="false">`;
  }

  function media(key, { alt = '', sizes = '100vw', cls = '', eager = false, id = '', style = '', deferred = false } = {}) {
    const ph = PHOTOS[key];
    if (!ph) return picture(key, { alt, sizes, cls, eager, id, deferred });
    const local = localPhotos[key];
    const generated = ph.kind === 'generated';
    const imageAlt = generated && alt ? t(`ภาพประกอบ AI ของ${alt}`, `AI illustration of ${alt}`, 'AI illustration of {0}', [alt]) : alt;
    const imageClass = [cls, ph.h > ph.w || ph.viewerFit === 'contain' ? 'preserve-photo' : ''].filter(Boolean).join(' ');
    const tone = photoTones[key];
    const css = [tone ? `--tone:${tone}` : '', style].filter(Boolean).join(';');
    const attrs = `${id ? `id="${id}" ` : ''}class="${imageClass}" alt="${esc(imageAlt)}" width="${ph.w}" height="${ph.h}" ${eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'} data-photo="${esc(key)}"${css ? ` style="${css}"` : ''}`;
    const widths = [330, 960, 1920].filter(width => width < ph.w);
    const src = local ? local.src : photoUrl(ph, 960);
    const srcset = local ? local.srcset : widths.map(width => `${photoUrl(ph, width)} ${width}w`).join(', ');
    return `<img ${attrs} ${deferred ? 'data-src' : 'src'}="${esc(src)}" ${deferred ? 'data-srcset' : 'srcset'}="${esc(srcset)}" sizes="${sizes}">${generated ? `<span class="generated-badge">${t('ภาพประกอบ AI', 'AI illustration')}</span>` : ''}`;
  }
  const commonsPage = ph => ph.sourceUrl || `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(ph.file.replace(/ /g, '_'))}`;
  function credit(key, cls = 'credit') {
    const ph = PHOTOS[key];
    if (!ph) return '';
    if (ph.kind === 'generated') return `<p class="${cls}">${icon('camera')}<span>${t('ภาพประกอบ AI อ้างอิงสถานที่จริง', 'AI illustration based on the real location')} · <a href="${publicHref(`#/credits?image=${key}`, lang())}">${t('ข้อมูลและแหล่งอ้างอิง', 'Image information')}</a></span></p>`;
    const license = ph.licenseUrl ? `<a href="${esc(ph.licenseUrl)}" target="_blank" rel="noopener noreferrer license">${esc(ph.license)}</a>` : esc(ph.license);
    return `<p class="${cls}">${icon('camera')}<span>${t('ภาพ', 'Photo')}: <a href="${esc(commonsPage(ph))}" target="_blank" rel="noopener noreferrer">${esc(ph.author)}</a> · ${license}</span></p>`;
  }
  function breadcrumb(items) {
    return `<nav class="breadcrumb" aria-label="${t('เส้นทางนำทาง', 'Breadcrumb')}">${items.map(([label, href], index) => `${index ? icon('chevron') : ''}${href ? `<a href="${href}">${esc(label)}</a>` : `<span aria-current="page">${esc(label)}</span>`}`).join('')}</nav>`;
  }
  const durationText = pk => (pk.nights === 1
    ? t(`${pk.days} วัน ${pk.nights} คืน`, `${pk.days} days · 1 night`, '{0} days · 1 night', [pk.days])
    : t(`${pk.days} วัน ${pk.nights} คืน`, `${pk.days} days · ${pk.nights} nights`, '{0} days · {1} nights', [pk.days, pk.nights]));
  const priceBlock = pk => `<p class="price-label">${t('ราคาตัวอย่างต่อท่าน', 'Sample price per person')}</p><p class="price"><strong>฿${pk.price.toLocaleString('en-US')}</strong><small>${t('/ ท่าน', 'THB / person')}</small></p>`;

  // ── header, quick-action bar ──
  const NAV = () => [
    ['home', '#/', t('หน้าแรก', 'Home')],
    ['explore', '#/explore', t('สำรวจลาว', 'Explore Laos')],
    ['highlights', '#/highlights', t('ที่เที่ยวยอดนิยม', 'Top places')],
    ['packages', '#/packages', t('แพ็กเกจทัวร์', 'Tour packages')],
    ['about', '#/about', t('เกี่ยวกับเรา', 'About us')],
  ];
  function headerHtml(section, { savedCount = 0, menuOpen = false, staticPicker = '' } = {}) {
    const links = NAV().map(([key, href, label]) => `<a class="nav-link" href="${href}"${section === key ? ' aria-current="page"' : ''}>${label}</a>`).join('');
    const info = languageInfo[lang()];
    return `
    <div class="container header-inner">
      ${brand()}
      <nav class="desktop-nav" aria-label="${t('เมนูหลัก', 'Main navigation')}">${links}</nav>
      <div class="header-actions">
        <a class="saved-link" href="#/saved" aria-label="${t('สถานที่ที่บันทึกไว้', 'Saved places')} (${savedCount})">${icon('heart')}<span class="saved-count"${savedCount ? '' : ' hidden'}>${savedCount}</span></a>
        <div class="language-picker" data-language-picker data-js-only>
          <button type="button" class="language-trigger" data-language-toggle aria-expanded="false" aria-controls="language-options" aria-label="${esc(info.label)} — ${t('เลือกภาษา', 'Choose language')}">${icon('globe')}<span class="language-current" lang="${info.tag}">${info.label}</span><svg class="language-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS.down}</svg></button>
          <div class="language-panel" id="language-options" hidden role="group" aria-label="${t('เลือกภาษา', 'Choose language')}"><p class="language-panel-title">${t('เลือกภาษา', 'Choose language')}</p>${languages.map(code => `<button type="button" class="language-option" data-language-option data-lang="${code}" aria-pressed="${lang() === code}"><span class="language-option-label" lang="${languageInfo[code].tag}">${languageInfo[code].name}</span><span class="language-option-check" aria-hidden="true">${icon('check')}</span></button>`).join('')}</div>
        </div>${staticPicker}
        <button type="button" class="btn btn-primary btn-sm" data-scroll="contact" data-js-only>${icon('chat')}<span class="btn-label">${t('วางแผนทริป', 'Plan a trip')}</span></button>
        <button type="button" class="menu-btn" aria-controls="mobile-nav" aria-expanded="${menuOpen}" aria-label="${menuOpen ? t('ปิดเมนู', 'Close menu') : t('เปิดเมนู', 'Open menu')}" data-js-only>${icon(menuOpen ? 'close' : 'menu')}</button>
      </div>
    </div>
    <nav class="mobile-nav" id="mobile-nav" aria-label="${t('เมนูมือถือ', 'Mobile navigation')}"${menuOpen ? '' : ' hidden'}>${links}<button type="button" class="btn btn-primary" data-scroll="contact">${icon('chat')}${t('วางแผนทริป', 'Plan a trip')}</button></nav>`;
  }
  function barHtml(section, { savedCount = 0, planHref = '#/inquiry' } = {}) {
    const left = section === 'saved'
      ? `<a class="btn btn-outline" href="#/explore"><span class="bar-label">${t('เพิ่มสถานที่', 'Explore places')}</span></a>`
      : `<a class="btn btn-outline" href="#/saved">${icon('heart')}<span class="bar-label">${t('ที่อยากไป', 'Saved')}</span><span class="bar-count" data-saved-count${savedCount ? '' : ' hidden'}>${savedCount}</span></a>`;
    return `${left}<a class="btn btn-primary" href="${planHref}">${icon('chat')}<span class="bar-label">${t('วางแผนทริป', 'Plan my trip')}</span></a>`;
  }

  // ── home hero ──
  function homeHeroHtml(index = 0) {
    const slide = C.slides[index];
    const focus = HERO_FOCUS[slide.photo] || '60% 50%';
    return `<section class="hero" id="home-hero" aria-roledescription="${t('สไลด์', 'carousel')}" aria-label="${t('ภาพสถานที่เด่น', 'Featured places')}">
    ${media(slide.photo || slide.image, { alt: L(slide.alt), cls: 'hero-img', sizes: '(max-width: 640px) 200vw, 100vw', eager: true, id: 'hero-img', style: `--focus:${focus}` })}
    <div class="container hero-inner">
      <div class="hero-copy">
        <p class="hero-hello"><span lang="lo">ສະບາຍດີ</span><span aria-hidden="true">·</span><span>${t('สวัสดีจากลาว', 'Hello from Laos')}</span></p>
        <h1>${t('ออกเดินทาง<br>ไปหลงรักลาว', 'A journey to<br>fall for Laos')}</h1>
        <p class="hero-desc">${t('ชมวัด ภูเขา และสายน้ำ <span class="nw">แล้วเลือกจุดหมายที่อยากไป</span>', 'Explore temples, mountains and rivers, then choose the places you would love to visit.')}</p>
        <p class="hero-sentiment">${t('เสน่ห์ลาวที่รอให้คุณค้นพบ', 'Discover the charm of Laos')}</p>
        <div class="hero-ctas">
          <a class="btn btn-light" href="#/explore">${t('สำรวจลาวทีละแขวง', 'Explore Laos by province')}${icon('arrow')}</a>
          <button type="button" class="btn btn-ghost" data-scroll="contact">${icon('chat')}${t('วางแผนทริป', 'Plan a trip')}</button>
        </div>
        <a class="hero-place-link" id="hero-place-link" href="${heroSlideHref(slide)}"><span data-hero-place-label>${t(`สำรวจ${L(slide.name)}`, `Explore ${L(slide.name)}`, 'Explore {0}', [L(slide.name)])}</span>${icon('arrow')}</a>
      </div>
      <div class="hero-destinations">
        <div class="hero-scene-toolbar">
          <p class="hero-current" aria-live="polite" aria-atomic="true"><strong data-hero-name>${L(slide.name)}</strong><span class="hero-count" data-hero-count>${pad2(index + 1)} / ${pad2(C.slides.length)}</span></p>
          <div class="hero-controls" role="group" aria-label="${t('ควบคุมภาพสถานที่', 'Destination slideshow controls')}">
            <button type="button" class="hero-step" data-hero-prev aria-label="${t('สถานที่ก่อนหน้า', 'Previous destination')}" aria-controls="hero-img">${icon('back')}</button>
            <button type="button" class="hero-step" data-hero-next aria-label="${t('สถานที่ถัดไป', 'Next destination')}" aria-controls="hero-img">${icon('arrow')}</button>
            <button type="button" class="hero-play" data-hero-play aria-pressed="false" aria-label="${t('เล่นภาพสถานที่อัตโนมัติ', 'Play destination slideshow')}" aria-controls="hero-img"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 10 7-10 7Z"/></svg></button>
            <a class="hero-step hero-photo-credit" data-hero-credit href="${slide.photo ? publicHref(`#/credits?image=${slide.photo}`, lang()) : '#/credits'}" aria-label="${t('เครดิตภาพ', 'Photo credits')}"${slide.photo ? '' : ' hidden'}>${icon('camera')}</a>
          </div>
        </div>
        <div class="slide-picker" role="group" aria-label="${t('เลือกภาพสถานที่', 'Choose a place')}">
          ${C.slides.map((s, i) => `<button type="button" class="slide-btn" data-slide="${i}" aria-pressed="${i === index}" aria-controls="hero-img" aria-label="${esc(t(`ชม${L(s.name)}`, `Show ${L(s.name)}`, 'Show {0}', [L(s.name)]))}">${heroThumb(s)}<span><b>${L(s.name)}</b></span><i class="slide-progress" aria-hidden="true"></i></button>`).join('')}
        </div>
        <p class="sr-only" data-hero-feedback role="status" aria-live="polite"></p>
      </div>
    </div>
  </section>`;
  }

  // ── province hero ──
  function provinceHeroHtml(pv, { deferred = false } = {}) {
    const region = C.findRegion(pv.region);
    const heroKey = provincePhotoKey(pv);
    return `<section class="p-hero on-dark${heroKey ? ' has-photo' : ''}" aria-labelledby="p-title">
    ${heroKey ? media(heroKey, { eager: true, cls: 'p-hero-img', deferred }) : mountainArt}
    <div class="container p-hero-inner">
      <div class="p-hero-copy">
        ${breadcrumb([[t('หน้าแรก', 'Home'), '#/'], [t('สำรวจลาว', 'Explore Laos'), '#/explore'], [L(region.name), `#/explore/${region.id}`], [L(pv.name)]])}
        <a class="region-chip" href="#/explore/${region.id}"><i class="dot-${region.id}" aria-hidden="true"></i>${L(region.name)}</a>
        <h1 id="p-title">${L(pv.name)}</h1>
        ${pv.id === 'vientiane-province' ? `<p class="city-context">${t('วังเวียง และสถานที่เที่ยวรอบแขวง', 'Vang Vieng and places across the province')}</p>` : ''}
        <p class="lao-name" lang="lo">${pv.name.lo}</p>
        <p class="tag">${L(pv.tagline)}</p>
      </div>
      ${heroKey ? '' : `<div class="p-hero-shape">${silhouette(pv.id)}</div>`}
    </div>
  </section>
  ${heroKey && PHOTOS[heroKey] ? `<div class="container hero-credit">${credit(heroKey)}</div>` : ''}
  <div class="container p-summary">
    <p class="p-intro">${esc(L(pv.intro))}</p>
    <p class="p-tags">${t('เหมาะกับ', 'Great for')}${pv.tags.map(tag => `<span class="chip">${L(C.tagLabels[tag])}</span>`).join('')}</p>
  </div>`;
  }

  // ── page heads (shared with the static shells) ──
  const home = () => [t('หน้าแรก', 'Home'), '#/'];
  const head = ({ crumbs, title, lead = '', id = '', cls = '', extra = '' }) => `<div class="container page-head${cls ? ` ${cls}` : ''}">${breadcrumb(crumbs)}<h1${id ? ` id="${id}" tabindex="-1"` : ''}>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}${extra}</div>`;
  const savedHead = () => head({ crumbs: [home(), [t('ที่อยากไป', 'Saved places')]], id: 'saved-title', title: t('สถานที่ที่อยากไป', 'Your places, your journey'), lead: t('เก็บความประทับใจไว้ แล้วค่อยเรียงเป็นทริปในแบบของคุณ', 'Keep the places that catch your eye, then shape them into your own trip.'), extra: `<p class="planner-privacy">${t('รายการนี้เก็บในเบราว์เซอร์ของคุณ ไม่ต้องสมัครสมาชิก', 'This list stays in your browser. No account needed.')}</p>` });
  const faqHead = () => head({ crumbs: [home(), [t('คำถามที่พบบ่อย', 'FAQ')]], title: t('ก่อนเริ่มวางแผนทริป', 'Before you plan your trip'), lead: t('คำตอบสั้น ๆ สำหรับการสำรวจและเตรียมทริปผ่านเว็บไซต์', 'A few useful answers about exploring and planning with this website.') });
  const inquiryHead = () => head({ crumbs: [home(), [t('วางแผนทริป', 'Plan a trip')]], title: t('บอกรายละเอียด<br>ทริปที่คุณอยากไป', 'Tell us about<br>your trip'), lead: t('เติมรายละเอียดที่รู้แล้ว แล้วคัดลอกหรือดาวน์โหลดข้อความสำหรับสอบถาม', 'Add what you know, then copy or download a message to discuss your trip.') });
  const creditsHead = () => head({ crumbs: [home(), [t('เครดิตและข้อมูลภาพ', 'Image credits')]], title: t('ภาพและแหล่งอ้างอิง', 'Images and their sources'), lead: t('ภาพถ่ายจริงแสดงชื่อผู้ถ่ายและสัญญาอนุญาต ส่วนภาพประกอบที่สร้างด้วย AI มีป้ายกำกับและแหล่งอ้างอิงสถานที่ ภาพทุกชุดถูกย่อขนาดและแปลงเป็น WebP และอาจครอปตามพื้นที่แสดง', 'Real photographs include the photographer and licence. AI-generated illustrations are labelled and include location references. Images are resized and converted to WebP, and may be cropped to fit the display.') });
  // a few photographs of everyday Laos open the about page
  const ABOUT_GALLERY = ['luang-prabang/alms-giving', 'bokeo/slow-boat', 'luang-prabang/night-market'];
  function aboutGallery() {
    const shots = ABOUT_GALLERY.map(ref => C.findPlace(ref)).filter(Boolean);
    return `<div class="container about-gallery">${shots.map(({ province, place }, i) => `<a class="about-shot${i ? '' : ' about-shot-main'}" href="#/province/${province.id}/${place.id}">${media(placePhotoKey(province, place), { alt: '', sizes: i ? '(max-width: 640px) 50vw, 30vw' : '(max-width: 640px) 100vw, 60vw' })}<span class="about-shot-label">${icon('pin')}${esc(L(place.name))}</span></a>`).join('')}</div>`;
  }
  const aboutHead = () => head({ crumbs: [home(), [t('เกี่ยวกับเรา', 'About us')]], title: esc(L(C.companyProfile.title)), lead: esc(L(C.companyProfile.intro)) });
  const packagesHead = () => head({ cls: 'packages-page-head', crumbs: [home(), [t('แพ็กเกจทัวร์', 'Tour packages')]], title: t('แพ็กเกจทัวร์ลาวและราคา', 'Laos tour packages and prices'), lead: t('เลือกจุดหมาย ดูราคา แล้วกดอ่านโปรแกรมเดินทางแบบละเอียดของแต่ละทริป', 'Choose a destination, compare the example prices and open its complete day-by-day itinerary.') });
  function highlightsHead(region = 'all') {
    const regionObj = C.findRegion(region);
    const tabs = [{ id: 'all', name: { [lang()]: t('ทั้งหมด', 'All') } }, ...C.regions];
    const crumbs = [home(), ...(regionObj ? [[t('ที่เที่ยวยอดนิยม', 'Top places'), '#/highlights'], [L(regionObj.name)]] : [[t('ที่เที่ยวยอดนิยม', 'Top places')]])];
    return head({ crumbs, title: t('ที่เที่ยวลาวที่น่าไป', 'Places to explore in Laos'), lead: t('เลือกสถานที่ที่ชอบ แล้วเปิดดูจุดเด่นและข้อมูลก่อนไป', 'Find a place you love, then explore its highlights and practical tips.'),
      extra: `<nav class="pills explore-tabs" aria-label="${t('เลือกภาค', 'Choose a region')}">${tabs.map(tab => `<a class="pill" href="#/highlights${tab.id === 'all' ? '' : `/${tab.id}`}"${tab.id === region ? ' aria-current="page"' : ''}>${L(tab.name)} <span class="count">${C.famousPlaces(tab.id).length}</span></a>`).join('')}</nav>` });
  }
  function exploreHead(region = 'all', search = '', interest = 'all') {
    const tabs = [{ id: 'all', name: { [lang()]: t('ทั้งหมด', 'All') }, count: C.provinces.length }, ...C.regions.map(r => ({ ...r, count: C.provincesByRegion(r.id).length }))];
    const params = new URLSearchParams(); if (search) params.set('q', search); if (interest !== 'all') params.set('interest', interest);
    const form = `<form id="explore-search" class="explore-search" role="search"><div class="search-field"><label for="destination-search">${t('ชื่อเมืองหรือสถานที่', 'City or place')}</label><div class="search-input-wrap">${icon('search')}<input id="destination-search" name="q" type="search" maxlength="120" autocomplete="off" value="${esc(search)}" placeholder="${t('เช่น วังเวียง น้ำตกตาดกวางสี', 'Try Vang Vieng or Kuang Si Falls')}"></div></div><label class="interest-filter" for="interest-filter">${t('สนใจอะไรเป็นพิเศษ', 'What do you enjoy?')}<select id="interest-filter" name="interest"><option value="all">${t('ทุกประเภท', 'All experiences')}</option>${Object.entries(C.placeTypes).map(([id, name]) => `<option value="${id}"${interest === id ? ' selected' : ''}>${esc(L(name))}</option>`).join('')}</select></label><button type="submit" class="btn btn-primary">${t('ค้นหาจุดหมาย', 'Find places')}</button></form>`;
    const shortcuts = `<div class="popular-shortcuts"><span>${t('เริ่มจาก', 'Start with')}</span>${C.featured.map(item => `<a href="#/province/${item.provinceId}">${L(item.name)}${icon('arrow')}</a>`).join('')}</div>`;
    const pills = `<nav class="pills explore-tabs" aria-label="${t('เลือกภาค', 'Choose a region')}">${tabs.map(tab => `<a class="pill" href="#/explore${tab.id === 'all' ? '' : `/${tab.id}`}${params.size ? `?${params}` : ''}"${tab.id === region ? ' aria-current="page"' : ''}>${L(tab.name)} <span class="count">${tab.count}</span></a>`).join('')}</nav>`;
    return head({ crumbs: [home(), [t('สำรวจลาว', 'Explore Laos')]], title: t('เลือกจุดหมาย<br>ที่ทำให้คุณอยากออกเดินทาง', 'Find a place<br>that calls to you'), lead: t('ค้นหาชื่อเมือง สถานที่ หรือเลือกสำรวจลาวทีละแขวง', 'Search a city or a place, or explore Laos one province at a time.'), extra: form + shortcuts + pills });
  }
  function packageTop(pk) {
    const pv = C.findProvince(pk.provinceId);
    const destination = L(pk.destination || pk.title);
    const heroKey = pk.photo || pk.image;
    return `<div class="container page-head package-page-head">
    ${breadcrumb([home(), [t('แพ็กเกจทัวร์', 'Tour packages'), '#/packages'], [destination]])}
    <h1>${esc(destination)}</h1>
    ${pk.destination ? `<p class="pkg-title-subtitle">${esc(L(pk.title))}</p>` : ''}
    <p class="duration">${icon('calendar')}${durationText(pk)}${L(pv.name) === destination ? '' : `<span aria-hidden="true">·</span><a class="text-underline" href="#/province/${pv.id}">${esc(L(pv.name))}</a>`}</p>
  </div>
  <div class="container pkg-overview">
    <figure class="pkg-hero">${media(heroKey, { eager: true, alt: destination, sizes: '(max-width: 760px) 100vw, 65vw' })}${PHOTOS[heroKey] ? credit(heroKey, 'credit pkg-photo-credit') : ''}</figure>
    <aside class="price-panel" aria-label="${t('ราคา', 'Price')}">
      ${priceBlock(pk)}
      <p class="pkg-price-basis">${esc(L(pk.priceBasis))}</p>
      <button type="button" class="btn btn-primary" data-inquiry="package" data-ref="${pk.id}">${icon('chat')}${t('สอบถามโปรแกรมนี้', 'Ask about this trip')}</button>
      <button type="button" class="btn btn-outline" data-share>${icon('share')}${t('แชร์โปรแกรมนี้', 'Share this trip')}</button>
    </aside>
  </div>`;
  }
  const notFoundHtml = () => `<section class="not-found"><p class="num">404</p><h1>${t('ยังไม่พบเส้นทางนี้', 'This trail is yet to be found')}</h1><p>${t('กลับไปเลือกจุดหมายที่น่าสนใจอีกครั้ง', 'Let’s find another beautiful destination.')}</p><a class="btn btn-primary" href="#/">${t('กลับหน้าแรก', 'Back to home')}${icon('arrow')}</a></section>`;

  return { t, L, nameOf, brand, picture, thumb, heroThumb, media, credit, commonsPage, breadcrumb, durationText, priceBlock, NAV, headerHtml, barHtml, homeHeroHtml, provinceHeroHtml,
    savedHead, faqHead, inquiryHead, creditsHead, aboutHead, aboutGallery, packagesHead, highlightsHead, exploreHead, packageTop, notFoundHtml };
}

// The province outline, used where a place has no photograph and on the province hero fallback.
export function silhouette(id) {
  const [x0, y0, x1, y1] = provinceBounds[id];
  const size = Math.max(x1 - x0, y1 - y0) * 1.08;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return `<svg viewBox="${(cx - size / 2).toFixed(1)} ${(cy - size / 2).toFixed(1)} ${size.toFixed(1)} ${size.toFixed(1)}" aria-hidden="true"><use href="/assets/maps/provinces.svg#province-${id}"></use></svg>`;
}
