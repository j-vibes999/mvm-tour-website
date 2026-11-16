import * as C from './content.js';
import { parseBrowserRoute, publicHref, localeHref, resolveRoute } from './routes.js';
import { searchDestinations, cleanSavedRefs, toggleSavedRef, inquiryContext, buildInquiryText, inquiryChannelHref, routeMapHref, monthLabel } from './trip-tools.js';
import { localPhotos, provincePhotos } from './complete-media.js';
import { createHeroExperience } from './hero-experience.js';
import { createSiteInteractions } from './interactions.js';
import { setAtlasRegion } from './atlas.js';
import {dayStoryHtml,monthChooserHtml,mountDiscovery} from './discovery.js';
import {programOverview,dayPhoto,savedPlanningHtml,savedTripsHtml,inquiryPhoto,mountPlanning} from './planning-ui.js';
import {moveSavedPlace} from './travel-planning.js';
import {travelText,inquiryInterests,interestKey} from './travel-copy.js';
import {attachViewerGestures} from './viewer-gestures.js';
import {cityText} from './city-deck-data.js';
import { homeDestinations, homeStyles, homeMoments, homeTripIds } from './home-discovery.js';
import { languages, languageInfo, chooseInitialLanguage, ensureTranslations } from './i18n.js';
import { createKit, PHOTOS, ICONS, icon, eyebrow, mountainArt, esc, pad2, photoUrl, smallPhoto, placePhotoKey, silhouette, heroSlideHref, HERO_FOCUS } from './ui-kit.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const main = $('#main');
const headerEl = $('#site-header');
const footerEl = $('#site-footer');
const barEl = $('#mobile-bar');
const NB = ' ';

let savedLanguage;
try { savedLanguage = localStorage.getItem('mvm-language'); } catch {}
const state = { lang: chooseInitialLanguage({
  pathname: location.pathname, savedLanguage,
  browserLanguages: navigator.languages?.length ? navigator.languages : [navigator.language],
}), slide: 0, menuOpen: false, pkgRegion: 'all', sort: 'recommended', keepScroll: false };
const routeLanguage = location.pathname.match(/^\/(th|lo|en|zh)(?:\/|$)/)?.[1];
let savedRefs = [];
try { savedRefs = cleanSavedRefs(JSON.parse(localStorage.getItem('mvm-saved-places') || '[]')); } catch {}
let inquiryDraft = { name: '', date: '', month: '', interests: [], travelers: 2, notes: '' };
let inquiryReady = false;
let siteInteractions = null;
let heroExperience = null;
let cityDeck = null;
let discoveryUI = null, planningUI = null, viewerGestureCleanup = null;
let cityDeckLoading = null, laosMap = null, mapLoading = null, mapObserver = null;
const overlayHolds = new Set();
function holdBackground(kind, open) {
  if (open) overlayHolds.add(kind); else overlayHolds.delete(kind);
  heroExperience?.hold('overlay', overlayHolds.size > 0);
  discoveryUI?.hold(overlayHolds.size > 0);
}
async function openCity(id, source) {
  const lang = state.lang, href = source.href;
  source.setAttribute('aria-busy', 'true');
  try {
    cityDeckLoading ||= import('./city-deck.js').catch(error => { cityDeckLoading = null; throw error; });
    const { createCityDeck } = await cityDeckLoading;
    if (!source.isConnected || state.lang !== lang) return;
    cityDeck ||= createCityDeck({ getLanguage: () => state.lang, onNavigate: href => navigate(href), onOpenChange: open => holdBackground('city', open) });
    if (!cityDeck.open(id, source)) navigate(href);
  } catch { if (source.isConnected) navigate(href); }
  finally { source.removeAttribute('aria-busy'); }
}

// ── helpers ──────────────────────────────────────────────────
const kit = createKit(() => state.lang);
const { t, L, nameOf, brand, media, credit, commonsPage, breadcrumb, durationText, priceBlock, NAV } = kit;

// Thai is written without spaces, so browsers guess where lines may break and sometimes split
// a place name in two. After each render, known names are wrapped in nowrap spans (see keepThai).
const KEEP = [...new Set([
  ...C.provinces.flatMap(pv => {
    const name = pv.name.th;
    const short = pv.short?.th;
    return [name, short, pv.capital.th, `เมือง${pv.capital.th}`, ...(/^(แขวง|นคร)/.test(name) ? [] : [`แขวง${name}`]), ...pv.places.map(pl => pl.name.th)];
  }),
  'สี่พันดอน', 'สะพานมิตรภาพ', 'รถไฟลาว–จีน', 'ที่ราบสูงโบลาเวน', 'แม่น้ำโขง', 'มรดกโลก', 'ยูเนสโก', 'อุบลราชธานี', 'หนองคาย', 'นครพนม', 'มุกดาหาร',
  'เรียบง่าย', 'แต่ละแขวง', 'แต่ละเมือง', 'สถานีรถไฟ', 'รายละเอียด', 'ข้อมูลที่ควรรู้', 'พระอาทิตย์ตก', 'พระอาทิตย์ขึ้น', 'ชนเผ่า', 'ข้าวเหนียว', 'ภูเขาหินปูน', 'เทอร์ควอยซ์', 'ทะเลหมอก', 'ทะเลสาบ', 'วิถีชีวิต',
])].filter(word => word && word.length <= 18).sort((a, b) => b.length - a.length);
const keepRe = new RegExp(KEEP.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
const THAI_CHAR = /[฀-๿]/;
const SKIP_KEEP = 'h1, b, strong, button, .btn, .pill, .nw, option, select, script, style, svg';

function keepThai(root) {
  if (state.lang !== 'th' || !root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest(SKIP_KEEP)) return NodeFilter.FILTER_REJECT;
      keepRe.lastIndex = 0;
      return keepRe.test(node.data) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const text = node.data;
    // one wrapper per text node, so a flex parent still sees a single item that can wrap
    const frag = document.createElement('span');
    frag.className = 'kt';
    let last = 0;
    for (const match of text.matchAll(keepRe)) {
      const start = match.index;
      const end = start + match[0].length;
      if (start > last) frag.append(text.slice(last, start));
      // an explicit break opportunity on each side, because the browser's own guess can fail next to unknown words
      if (start > 0 && THAI_CHAR.test(text[start - 1])) frag.append(document.createElement('wbr'));
      const span = document.createElement('span');
      span.className = 'nw';
      span.textContent = match[0];
      frag.append(span);
      if (end < text.length && THAI_CHAR.test(text[end])) frag.append(document.createElement('wbr'));
      last = end;
    }
    if (last < text.length) frag.append(text.slice(last));
    node.replaceWith(frag);
  }
}

// ── contact ─────────────────────────────────────────────────
function contactHref(kind) {
  const c = C.site.contact;
  if (kind === 'line' && c.line) return `https://line.me/R/ti/p/${encodeURIComponent(c.line)}`;
  if (kind === 'whatsapp' && c.whatsapp) return `https://wa.me/${c.whatsapp.replace(/\D/g, '')}`;
  if (kind === 'phone' && c.phone) return `tel:${c.phone.replace(/[^\d+]/g, '')}`;
  if (kind === 'email' && c.email) return `mailto:${c.email}`;
  if (kind === 'facebook' && /^https:\/\/(www\.)?(facebook\.com|fb\.com)\//i.test(c.facebook)) return c.facebook;
  return '';
}
function contactAction(kind, cls, label, iconName) {
  const href = contactHref(kind);
  const external = kind === 'line' || kind === 'whatsapp' || kind === 'facebook';
  return href
    ? `<a class="${cls}" href="${esc(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${icon(iconName)}${label}</a>`
    : '';
}

// ── map ─────────────────────────────────────────────────────
function laosMapSvg({ region = 'all', current = null, linkable = false, cls = '' } = {}) {
  if (!laosMap) return `<svg class="laos-map ${cls}" viewBox="0 0 520 640" aria-hidden="true" aria-busy="true" data-map-deferred="${esc(JSON.stringify({ region, current, linkable, cls }))}"></svg>`;
  const currentRegion = current ? C.findProvince(current)?.region : null;
  const shapes = C.provinces.map(pv => {
    const shape = laosMap.provinces[pv.id];
    const classes = ['prov', `r-${pv.region}`, current === pv.id ? 'is-current' : '', currentRegion === pv.region && current !== pv.id ? 'same-region' : ''].filter(Boolean).join(' ');
    return linkable
      ? `<a class="${classes}" href="#/province/${pv.id}" data-province="${pv.id}" aria-label="${esc(L(pv.name))} · ${esc(L(C.findRegion(pv.region).name))}"><path d="${shape.d}"/></a>`
      : `<g class="${classes}"><path d="${shape.d}"/></g>`;
  }).join('');
  const label = linkable ? ` role="group" aria-label="${t('แผนที่ลาว แตะแขวงเพื่อดูรายละเอียด', 'Map of Laos — choose a province')}"` : ' aria-hidden="true"';
  return `<svg class="laos-map ${cls}" viewBox="${laosMap.viewBox}" data-region="${region}"${label}>${shapes}</svg>`;
}
function mountMaps() {
  mapObserver?.disconnect();
  const load = () => {
    mapLoading ||= import('./map-data.js').then(module => { laosMap = module.laosMap; }).catch(error => { mapLoading = null; throw error; });
    mapLoading.then(() => {
      for (const svg of $$('[data-map-deferred]', main)) {
        const options = JSON.parse(svg.dataset.mapDeferred), wrap = svg.closest('[data-atlas]');
        if (wrap) options.region = wrap.dataset.region;
        svg.outerHTML = laosMapSvg(options);
        if (wrap) setAtlasRegion(wrap, wrap.dataset.region);
      }
      adaptLinks(main);
    }).catch(() => { /* The adjacent province links remain usable if this optional asset fails. */ });
  };
  const placeholders = $$('[data-map-deferred]', main);
  if (!placeholders.length) return;
  if (!('IntersectionObserver' in window)) { load(); return; }
  mapObserver = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { mapObserver.disconnect(); load(); }
  }, { rootMargin: '200px' });
  placeholders.forEach(svg => mapObserver.observe(svg));
}
const legend = () => `<p class="map-legend">${C.regions.map(r => `<span><i class="dot-${r.id}" aria-hidden="true"></i>${L(r.name)}</span>`).join('')}</p>`;
const mapCredit = () => `<p class="map-credit">${t('ข้อมูลแผนที่', 'Map data')}: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a></p>`;
const mapPrompt = () => `<p class="map-preview-prompt">${t('แผนที่ลาว แตะแขวงเพื่อดูรายละเอียด', 'Map of Laos — choose a province')}</p>`;
function mapPreview(pv) {
  return `<a class="map-preview-link" href="${publicHref(`#/province/${pv.id}`, state.lang)}"><span class="map-preview-media">${media(provincePhotos[pv.id] || pv.photo || pv.image, { alt: '', sizes: '112px' })}</span><span class="map-preview-body"><b>${esc(L(pv.name))}</b>${state.lang === 'lo' ? '' : `<small lang="lo">${esc(pv.name.lo)}</small>`}<span>${esc(L(pv.tagline))}</span><span class="map-preview-go">${t('สำรวจแขวงนี้', 'Explore this province')}</span></span></a>`;
}
// The preview opens on a well-known province for each region instead of the first one in the list.
const FEATURED_PROVINCE = { all: 'luang-prabang', north: 'luang-prabang', central: 'vientiane-capital', south: 'champasak' };
const featuredProvince = region => C.findProvince(FEATURED_PROVINCE[region]) || C.provinces.find(pv => region === 'all' || pv.region === region);
let mapCount = 0;
function mapBlock({ id = `atlas-${++mapCount}`, region = 'all', current = null, ...options } = {}) {
  const first = C.findProvince(current) || featuredProvince(region);
  return `<div class="map-wrap" id="${esc(id)}" data-atlas data-region="${esc(region)}">${laosMapSvg({ ...options, region, current, linkable: true })}<div class="map-preview">${first ? mapPreview(first) : mapPrompt()}</div></div>`;
}

// ── shared pieces ───────────────────────────────────────────
function setLanguagePicker(open, { focusOption = false, returnFocus = false } = {}) {
  const picker = $('[data-language-picker]');
  if (!picker) return;
  const trigger = $('[data-language-toggle]', picker);
  const panel = $('#language-options', picker);
  trigger.setAttribute('aria-expanded', String(open));
  panel.hidden = !open;
  if (open && focusOption) ($('[data-language-option][aria-pressed="true"]', panel) || $('[data-language-option]', panel))?.focus();
  if (!open && returnFocus) trigger.focus({ preventScroll: true });
}

// Only the language the visitor points to is a useful prefetch hint.
function prefetchTranslations(target) {
  const lang = target?.closest?.('[data-language-option]')?.dataset.lang;
  if (lang) ensureTranslations(lang).catch(() => {});
}

let languageRequest = 0;
async function setLanguage(lang) {
  if (!languages.includes(lang)) return;
  const request = ++languageRequest;
  setLanguagePicker(false, { returnFocus: true });
  const trigger = $('[data-language-toggle]');
  if (state.lang === lang) {
    trigger?.removeAttribute('aria-busy');
    try { localStorage.setItem('mvm-language', lang); } catch {}
    return;
  }
  trigger?.setAttribute('aria-busy', 'true');
  try { await ensureTranslations(lang); }
  catch {
    if (request !== languageRequest) return;
    trigger?.removeAttribute('aria-busy');
    toast(t('โหลดภาษานี้ไม่สำเร็จ ลองอีกครั้ง', 'That language could not load. Please try again.'));
    return;
  }
  if (request !== languageRequest) return;
  state.lang = lang;
  try { localStorage.setItem('mvm-language', lang); } catch {}
  const y = window.scrollY;
  readInquiryDraft();
  history.replaceState(history.state, '', localeHref(location, lang));
  render({ force: true });
  window.scrollTo(0, y);
  $('[data-language-toggle]')?.focus({ preventScroll: true });
}

function renderHeader(section) {
  headerEl.innerHTML = kit.headerHtml(section, { savedCount: savedRefs.length, menuOpen: state.menuOpen });
}

function renderFooter() {
  const c = C.site.contact;
  const year = new Date().getFullYear();
  footerEl.innerHTML = `
    <section class="contact-band on-dark" id="contact" aria-labelledby="contact-title">
      ${mountainArt}
      <div class="container contact-inner">
        <div>
          ${eyebrow(t('พร้อมออกเดินทางหรือยัง', 'Ready when you are'))}
          <h2 id="contact-title" tabindex="-1">${t('อยากเที่ยวลาวแบบไหน<br>บอกเราได้เลย', 'Tell us how you<br>want to see Laos')}</h2>
          <p>${t('เลือกจุดหมาย วันเดินทาง และจำนวนคน เพื่อเตรียมรายละเอียดสำหรับสอบถาม', 'Choose your places, dates and group size to prepare a trip inquiry.')}</p>
        </div>
        <div class="contact-actions">
          <a class="btn btn-light" data-context-planner href="${contextHref()}">${icon('route')}${t('วางแผนทริป', 'Plan a trip')}</a>
          ${contactAction('line', 'btn btn-ghost', t('แชททาง LINE', 'Chat on LINE'), 'chat')}
          ${contactAction('whatsapp', 'btn btn-ghost', t('แชททาง WhatsApp', 'Chat on WhatsApp'), 'chat')}
          ${contactAction('phone', 'btn btn-ghost', `${t('โทร', 'Call')} ${esc(c.phone)}`, 'phone')}
        </div>
      </div>
    </section>
    <footer class="site-footer on-dark">
      <div class="container">
        <div class="footer-cols">
          <div class="footer-brand">
            ${brand()}
            <p>${t('ธรรมชาติ วัฒนธรรม และเรื่องราวระหว่างทาง', 'Nature, culture and stories along the way')}</p>
            <div class="socials">
              ${contactAction('facebook', 'social', '<span class="sr-only">Facebook</span>', 'facebook')}
              ${contactAction('line', 'social', '<span class="sr-only">LINE</span>', 'chat')}
              ${contactAction('email', 'social', `<span class="sr-only">${t('อีเมล', 'Email')}</span>`, 'mail')}
            </div>
          </div>
          <nav class="footer-col" aria-label="${t('เมนูส่วนท้าย', 'Footer menu')}">
            <h2>${t('เมนู', 'Menu')}</h2>
            ${NAV().map(([, href, label]) => `<a href="${href}">${label}</a>`).join('')}
            <a href="#/credits">${t('เครดิตภาพ', 'Photo credits')}</a>
          </nav>
          <nav class="footer-col" aria-label="${t('ภูมิภาค', 'Regions')}">
            <h2>${t('สำรวจตามภาค', 'Explore by region')}</h2>
            ${C.regions.map(r => `<a href="#/explore/${r.id}">${L(r.name)} · ${C.provincesByRegion(r.id).length} ${t('แขวง', 'provinces')}</a>`).join('')}
            <a href="#/explore">${t('ดูแผนที่ทั้งประเทศ', 'Map of all Laos')}</a>
          </nav>
          <div class="footer-col wide">
            <h2>${t('ติดต่อเรา', 'Contact us')}</h2>
            ${L(c.address) ? `<p class="footer-line">${icon('pin')}<span>${esc(L(c.address))}</span></p>` : ''}
            ${c.phone ? `<p class="footer-line">${icon('phone')}<a href="${contactHref('phone')}">${esc(c.phone)}</a></p>` : ''}
            ${c.line ? `<p class="footer-line">${icon('chat')}<span>LINE ${esc(c.line)}</span></p>` : ''}
            ${c.email ? `<p class="footer-line">${icon('mail')}<a href="${contactHref('email')}">${esc(c.email)}</a></p>` : ''}
            ${!hasContact() ? `<p class="contact-status">${t('ช่องทางติดต่อบริษัทอยู่ระหว่างอัปเดต คุณสามารถเตรียมและดาวน์โหลดรายละเอียดการเดินทางไว้ก่อนได้', 'Company contact details are being updated. You can prepare and download your trip details in the meantime.')}</p>` : ''}
            <a href="#/saved">${t('สถานที่ที่อยากไป', 'My saved places')}</a>
            <a href="#/faq">${t('คำถามที่พบบ่อย', 'Frequently asked questions')}</a>
          </div>
        </div>
        <div class="footer-bottom"><span>© ${year} MVM Group</span><span>Explore Laos</span></div>
      </div>
    </footer>`;
}

// A LINE button with a short greeting. It exists only when the company's real LINE account is
// filled in (content.js site.contact.line); the greeting shows once per visit and never blocks the page.
let chatFab = null;
let chatHelloTimer = 0;
let chatHelloHide = 0;
const CHAT_HELLO_KEY = 'mvm-chat-hello';
function renderChatFab(section) {
  const href = contactHref('line');
  if (!href) {
    chatFab?.remove(); chatFab = null;
    document.documentElement.classList.remove('has-chat-fab');
    return;
  }
  if (!chatFab) {
    chatFab = document.createElement('aside');
    chatFab.className = 'chat-fab';
    chatFab.id = 'chat-fab';
    chatFab.addEventListener('click', event => { if (event.target.closest('[data-chat-dismiss], .chat-fab-btn')) hideChatHello(true); });
    document.body.append(chatFab);
    document.documentElement.classList.add('has-chat-fab');
  }
  if (chatFab.dataset.lang !== state.lang) {
    const label = t('แชทกับ MVM Group ทาง LINE', 'Chat with MVM Group on LINE');
    const open = chatFab.querySelector('.chat-hello')?.hidden === false;
    chatFab.innerHTML = `<div class="chat-hello" role="status"${open ? '' : ' hidden'}><p><b lang="lo">ສະບາຍດີ!</b><span>${t('มีคำถามเรื่องเที่ยวลาว ทักเราทาง LINE ได้เลย', 'Questions about travelling in Laos? Message us on LINE.')}</span></p><button type="button" class="chat-hello-close" data-chat-dismiss aria-label="${t('ปิดข้อความทักทาย', 'Close the greeting')}">${icon('close')}</button></div><a class="chat-fab-btn" href="${esc(href)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(label)}" title="${esc(label)}">${icon('chat')}<span>LINE</span></a>`;
    chatFab.dataset.lang = state.lang;
    chatFab.setAttribute('aria-label', label);
  }
  // the trip form already offers every channel, so the button steps aside there
  chatFab.hidden = section === 'inquiry';
  if (chatFab.hidden) hideChatHello(false);
  else scheduleChatHello();
}
function scheduleChatHello() {
  if (chatHelloTimer || !chatFab) return;
  try { if (sessionStorage.getItem(CHAT_HELLO_KEY)) return; } catch {}
  // a greeting after the visitor has looked around for a moment, not on arrival
  const start = () => { chatHelloTimer = setTimeout(showChatHello, 6000); };
  addEventListener('scroll', start, { passive: true, once: true });
}
function showChatHello() {
  const hello = chatFab?.querySelector('.chat-hello');
  if (!hello || chatFab.hidden || document.documentElement.classList.contains('viewer-open')) return;
  try { if (sessionStorage.getItem(CHAT_HELLO_KEY)) return; sessionStorage.setItem(CHAT_HELLO_KEY, 'shown'); } catch {}
  hello.hidden = false;
  if (!reduceMotion() && hello.animate) hello.animate([{ opacity: 0, transform: 'translateY(10px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.22,.8,.24,1)' });
  chatHelloHide = setTimeout(() => { if (!hello.matches(':hover, :focus-within')) hideChatHello(false); }, 14000);
}
function hideChatHello(remember) {
  clearTimeout(chatHelloHide);
  if (remember) { try { sessionStorage.setItem(CHAT_HELLO_KEY, 'dismissed'); } catch {} }
  const hello = chatFab?.querySelector('.chat-hello');
  if (!hello || hello.hidden) return;
  if (reduceMotion() || !hello.animate) { hello.hidden = true; return; }
  hello.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(6px)' }], { duration: 220, easing: 'ease' }).onfinish = () => { hello.hidden = true; };
}

function renderBar(section) {
  barEl.innerHTML = kit.barHtml(section, { savedCount: savedRefs.length, planHref: contextHref() });
  barEl.setAttribute('aria-label', t('ทางลัด', 'Quick actions'));
}

function tripCard(pk, { price = false } = {}) {
  const pv = C.findProvince(pk.provinceId);
  const destination = L(pk.destination || pv.name);
  const photo = pk.photo || pk.image;
  const programLink = `<a class="${price ? 'btn btn-primary package-card-cta' : ''}" href="#/package/${pk.id}" aria-label="${t('ดูรายละเอียดโปรแกรม', 'View full itinerary')}: ${esc(destination)}">${t('ดูรายละเอียดโปรแกรม', 'View full itinerary')}${icon('arrow')}</a>`;
  return `<article class="trip-card${price ? ' trip-card-priced' : ''}">
    <a class="media" href="#/package/${pk.id}" tabindex="-1" aria-hidden="true">${media(photo, { sizes: price ? '(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw' : '(max-width: 640px) 80vw, 33vw' })}</a>
    <div class="trip-body">
      <h3><a href="#/package/${pk.id}">${esc(price ? destination : L(pk.title))}</a></h3>
      <div class="trip-meta">${price ? '' : `<span class="meta">${icon('pin')}${nameOf(pv)}</span>`}<span class="duration">${icon('calendar')}${durationText(pk)}</span></div>
      ${price ? '' : `<ul class="trip-highlights">${L(pk.highlights).map(h => `<li><span>${esc(h)}</span></li>`).join('')}</ul>`}
      ${price ? '' : `<div class="card-foot">${programLink}</div>`}
    </div>
    ${price ? `<div class="package-card-footer"><div class="card-price">${priceBlock(pk)}</div>${programLink}</div>` : ''}
  </article>`;
}

function photoCard(ref, sizes = '(max-width: 640px) 118px, (max-width: 1100px) 45vw, 400px') {
  const found = C.findPlace(ref);
  if (!found) return '';
  const { province, place } = found;
  const details = C.placeDetails[ref];
  const peek = details?.best ? `<span class="photo-card-peek" aria-hidden="true"><span>${icon('sun')}${esc(L(details.best))}</span><span class="photo-card-go">${t('ดูรายละเอียด', 'View details')}${icon('arrow')}</span></span>` : '';
  return `<div class="save-card"><a class="photo-card" href="#/province/${province.id}/${place.id}">
    <div class="photo-card-media">${media(placePhotoKey(province, place), { alt: L(place.name), sizes })}<span class="chip chip-on-photo">${icon(place.type)}${L(C.placeTypes[place.type])}</span>${peek}</div>
    <div class="photo-card-body">
      <span class="photo-card-meta">${icon('pin')}${esc(L(province.name))}</span>
      <h3>${L(place.name)}</h3>
      <p class="photo-card-text">${esc(L(place.text))}</p>
      ${details ? `<span class="photo-card-foot">${icon('clock')}${esc(L(details.time))}</span>` : ''}
    </div>
  </a>${saveHeart(ref)}</div>`;
}

function provCard(pv) {
  return `<a class="prov-card" href="#/province/${pv.id}" data-province-card="${pv.id}">
    <span class="prov-photo">${media(provincePhotos[pv.id] || pv.photo || pv.image, { alt: '', sizes: '72px' })}</span>
    <span class="prov-body"><span class="lao" lang="lo">${pv.name.lo}</span><b>${L(pv.name)}</b><span>${L(pv.tagline)}</span><small>${pv.places.length} ${t('สถานที่', 'places')}</small></span>
    ${icon('arrow')}
  </a>`;
}


function hasContact() {
  return ['line', 'whatsapp', 'phone', 'email', 'facebook'].some(kind => contactHref(kind));
}
function inquiryHref(kind = 'custom', ref = '') {
  const params = new URLSearchParams();
  if (kind !== 'custom') params.set('kind', kind);
  if (ref) params.set('ref', ref);
  return `#/inquiry${params.size ? `?${params}` : ''}`;
}
function contextHref() {
  const { parts } = parseRoute();
  if(parts[0]==='inquiry')return location.pathname+location.search;
  if (parts[0] === 'package') return inquiryHref('package', parts[1]);
  if (parts[0] === 'province') return parts[2] ? inquiryHref('place', `${parts[1]}/${parts[2]}`) : inquiryHref('province', parts[1]);
  if (parts[0] === 'saved' || savedRefs.length) return inquiryHref('saved');
  return inquiryHref();
}
function saveButton(ref) {
  const active = savedRefs.includes(ref), found = C.findPlace(ref);
  const label = active ? t('นำออกจากรายการ', 'Remove from saved') : t('บันทึกสถานที่นี้', 'Save this place');
  return `<button type="button" class="save-place${active ? ' is-saved' : ''}" data-save="${esc(ref)}" aria-pressed="${active}" aria-label="${esc(`${label} · ${L(found?.place.name)}`)}">${icon('heart')}<span>${label}</span></button>`;
}
// On the saved list the toggle only removes, so it stays quiet and says so.
function savedRemoveButton(ref) {
  const found = C.findPlace(ref);
  return `<button type="button" class="saved-remove" data-save="${esc(ref)}" aria-pressed="true" aria-label="${esc(`${t('นำออกจากรายการ', 'Remove from saved')} · ${L(found?.place.name)}`)}">${icon('close')}<span>${t('นำออก', 'Remove')}</span></button>`;
}
// The same toggle as a round heart over a card photo, so a place can be kept without opening it.
function saveHeart(ref, cls = '') {
  const active = savedRefs.includes(ref), found = C.findPlace(ref);
  if (!found) return '';
  const label = active ? t('นำออกจากรายการ', 'Remove from saved') : t('บันทึกสถานที่นี้', 'Save this place');
  return `<button type="button" class="save-heart${cls ? ` ${cls}` : ''}${active ? ' is-saved' : ''}" data-save="${esc(ref)}" aria-pressed="${active}" aria-label="${esc(`${label} · ${L(found.place.name)}`)}">${icon('heart')}</button>`;
}
function savePlace(ref, button = null) {
  savedRefs = toggleSavedRef(savedRefs, ref);
  const added = savedRefs.includes(ref);
  let persisted = true;
  try { localStorage.setItem('mvm-saved-places', JSON.stringify(savedRefs)); } catch { persisted = false; }
  $$('[data-save]').forEach(node => {
    const saved = savedRefs.includes(node.dataset.save), found = C.findPlace(node.dataset.save);
    const label = saved ? t('นำออกจากรายการ', 'Remove from saved') : t('บันทึกสถานที่นี้', 'Save this place');
    node.setAttribute('aria-pressed', String(saved));node.classList.toggle('is-saved', saved);
    node.setAttribute('aria-label', `${label} · ${L(found?.place.name)}`);
    const text = $('span', node); if (text) text.textContent = label;
  });
  $$('.saved-link').forEach(node=>node.setAttribute('aria-label', `${t('สถานที่ที่บันทึกไว้', 'Saved places')} (${savedRefs.length})`));
  const landed = celebrateSave(button, added);
  const showCount = () => {
    renderBar(parseRoute().parts[0] || 'home');
    adaptLinks(barEl);
    $$('.saved-count, [data-saved-count]').forEach(node => { node.textContent = savedRefs.length; node.hidden = !savedRefs.length; bump(node); });
  };
  if (landed) landed.then(showCount); else showCount();
  toast(persisted ? (added ? t('เก็บสถานที่ไว้แล้ว ดูได้ที่ “ที่อยากไป”', 'Place saved. Find it in Saved places.') : t('นำสถานที่ออกจากรายการแล้ว', 'Place removed from your list.')) : t('เก็บไว้ได้ระหว่างเปิดหน้านี้ เบราว์เซอร์ไม่อนุญาตให้บันทึกถาวร', 'Saved for this session. Your browser blocked persistent storage.'));
  $$('[data-context-planner]').forEach(link=>link.href=publicHref(contextHref(),state.lang));
  adaptLinks();
  if(viewer.open && main.dataset.view?.startsWith('saved?'))main.dataset.savedDirty='true';
  if (parseRoute().parts[0] === 'saved' && !viewer.open) refreshSavedPage(ref);
  siteInteractions?.saved(ref);
}

// ── saving feels like something: the heart pops, a few sparks, and it flies to “Saved” ──
const SPARKS = ['#d0782f', '#e3c47e', '#b99047', '#f2a65e'];
function bump(node) {
  if (!node || node.hidden || reduceMotion()) return;
  node.classList.remove('is-bumping'); void node.offsetWidth; node.classList.add('is-bumping');
  node.addEventListener('animationend', () => node.classList.remove('is-bumping'), { once: true });
}
const visible = node => { if (!node) return false; const box = node.getBoundingClientRect(); return box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < innerHeight && getComputedStyle(node).visibility !== 'hidden'; };
function celebrateSave(button, added) {
  const heart = button?.querySelector('svg');
  if (!heart || !added || reduceMotion() || typeof heart.animate !== 'function') return null;
  heart.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.45)' }, { transform: 'scale(.9)' }, { transform: 'scale(1)' }], { duration: 540, easing: 'cubic-bezier(.3,1.4,.5,1)' });
  const from = heart.getBoundingClientRect();
  const cx = from.left + from.width / 2, cy = from.top + from.height / 2;
  for (let k = 0; k < 10; k++) {
    const dot = document.createElement('span');
    dot.className = 'heart-dot';
    dot.style.background = SPARKS[k % SPARKS.length];
    document.body.append(dot);
    const angle = (Math.PI * 2 * k) / 10 + Math.random() * .35, distance = 26 + Math.random() * 16;
    dot.animate([{ transform: `translate(${cx - 3.5}px,${cy - 3.5}px) scale(1)`, opacity: 1 }, { transform: `translate(${cx - 3.5 + Math.cos(angle) * distance}px,${cy - 3.5 + Math.sin(angle) * distance}px) scale(.3)`, opacity: 0 }], { duration: 560 + Math.random() * 180, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => dot.remove();
  }
  // fly to the header heart (or the quick-action bar on phones); the viewer covers both, so stay put there
  if (viewer.open) return null;
  const target = [$('.saved-link svg'), $('#mobile-bar a[href*="/saved/"] svg')].find(visible);
  if (!target) return null;
  const to = target.getBoundingClientRect();
  const tx = to.left + to.width / 2, ty = to.top + to.height / 2;
  const fly = document.createElement('span');
  fly.className = 'heart-fly';
  fly.innerHTML = icon('heart');
  document.body.append(fly);
  const mx = (cx + tx) / 2, my = Math.max(14, Math.min(cy, ty) - 60);
  const flight = fly.animate([
    { transform: `translate(${cx - 13}px,${cy - 13}px) scale(1)`, opacity: 1 },
    { transform: `translate(${mx - 13}px,${my - 13}px) scale(1.3)`, opacity: 1, offset: .45 },
    { transform: `translate(${tx - 13}px,${ty - 13}px) scale(.55)`, opacity: .85 },
  ], { duration: 780, easing: 'cubic-bezier(.45,0,.4,1)' });
  return new Promise(resolve => { const done = () => { fly.remove(); resolve(); }; flight.onfinish = done; flight.oncancel = done; });
}
function refreshSavedPage() {
  const nextFocus = document.activeElement?.closest('.discovery-tile, .saved-item')?.nextElementSibling?.querySelector('[data-save]');
  const nextRef = nextFocus?.dataset.save;
  renderSaved(); keepThai(main); adaptLinks();
  (nextRef ? $(`[data-save="${nextRef}"]`, main) : $('#saved-title'))?.focus({ preventScroll: true });
}
function discoveryTile({kind = 'place', province, place, ref}) {
  const title = place ? L(place.name) : L(province.name);
  const href = place ? `#/province/${province.id}/${place.id}` : `#/province/${province.id}`;
  const key = place ? placePhotoKey(province, place) : (provincePhotos[province.id] || province.photo || province.image);
  return `<article class="discovery-tile"><a class="discovery-photo" href="${href}" tabindex="-1" aria-hidden="true">${key ? media(key,{sizes:'(max-width:640px) 100vw, 360px'}) : placeVisual(province, place || province.places[0])}</a><div class="discovery-content"><span class="meta">${esc(L(province.name))}${place ? ` · ${esc(L(C.placeTypes[place.type]))}` : ''}</span><h3><a href="${href}">${esc(title)}</a></h3><p>${esc(L(place ? place.text : province.tagline))}</p>${place ? saveButton(ref) : `<a class="link-arrow" href="${href}">${t('สำรวจแขวงนี้','Explore this province')}${icon('arrow')}</a>`}</div></article>`;
}
function renderSaved() {
  delete main.dataset.savedDirty;
  const items = savedRefs.map(ref=>({kind:'place',ref,...C.findPlace(ref)}));
  main.innerHTML = `${kit.savedHead()}<section class="container page-body" aria-label="${t('รายการสถานที่','Saved places')}">${items.length ? `<div class="saved-toolbar"><p>${items.length} ${t('สถานที่ในรายการของคุณ','places in your list')}</p><a class="btn btn-primary" href="${inquiryHref('saved')}">${icon('route')}${t('วางแผนจากรายการนี้','Plan with these places')}</a><a class="link-arrow" href="#/explore">${t('เพิ่มสถานที่','Find more places')}${icon('arrow')}</a></div>${savedPlanningHtml(savedRefs,state.lang,savedRemoveButton)}${savedTripsHtml(savedRefs,state.lang)}` : `<div class="planner-empty">${icon('heart')}<h2>${t('การเดินทางของคุณเริ่มจากที่ที่ชอบ','Every journey starts with a place')}</h2><p>${t('เปิดดูสถานที่ แล้วกดรูปหัวใจเพื่อเก็บไว้ที่นี่','Explore a place and use the heart button to keep it here.')}</p><a class="btn btn-primary" href="#/explore">${t('ไปเลือกสถานที่','Start exploring')}${icon('arrow')}</a></div>`}</section>`;
}
function reorderSaved(ref,toIndex,direction=0) {
  const next=moveSavedPlace(savedRefs,ref,toIndex);
  try { localStorage.setItem('mvm-saved-places',JSON.stringify(next)); }
  catch { toast(t('เก็บไว้ได้ระหว่างเปิดหน้านี้ เบราว์เซอร์ไม่อนุญาตให้บันทึกถาวร', 'Saved for this session. Your browser blocked persistent storage.')); }
  savedRefs=next;
  renderSaved();keepThai(main);adaptLinks();
  const row=$(`[data-saved-ref="${ref}"]`,main);
  const button=row?.querySelector(`[data-direction="${direction}"]:not(:disabled)`)||row?.querySelector('[data-move-saved]:not(:disabled)')||row?.querySelector('h3 a');
  button?.focus({preventScroll:true});
  $('[data-saved-order-status]',main).textContent=travelText(state.lang,'reordered');
}
function renderFaq() {
  main.innerHTML = `${kit.faqHead()}<section class="container page-body faq-list">${faqHtml()}<a class="btn btn-primary" href="#/inquiry">${t('วางแผนทริป','Plan a trip')}${icon('arrow')}</a></section>`;
}
function faqHtml() {
  return C.faq.map(item=>`<details class="faq-item"><summary>${esc(L(item.question))}</summary><div class="detail-content"><p>${esc(L(item.answer))}</p></div></details>`).join('');
}
function currentInquiryContext() {
  const {query}=parseRoute();return inquiryContext(query.get('kind'),query.get('ref')||'',savedRefs);
}
function contextTitle(context) {
  if(context.kind==='package')return L(context.item.title);
  if(context.kind==='province')return L(context.item.name);
  if(context.kind==='place')return `${L(context.item.place.name)} · ${L(context.item.province.name)}`;
  if(context.kind==='saved')return t(`${context.refs.length} สถานที่ที่คุณเลือก`,`${context.refs.length} saved places`, "{0} saved places", [context.refs.length]);
  return t('การเดินทางในแบบของคุณ','A journey of your own');
}
// The next twelve months, as YYYY-MM, starting with the current one.
function upcomingMonths() {
  const now=new Date();
  return Array.from({length:12},(_,i)=>{const d=new Date(Date.UTC(now.getFullYear(),now.getMonth()+i,1));return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;});
}
// Short chip text with a two-digit year in the local calendar (Thai shows the Buddhist year).
function monthChipLabel(value) {
  const [year,month]=value.split('-').map(Number);
  const parts=new Intl.DateTimeFormat(languageInfo[state.lang].tag,{month:'short',year:'numeric',timeZone:'UTC'}).formatToParts(new Date(Date.UTC(year,month-1,1)));
  const name=parts.find(part=>part.type==='month')?.value||'',yy=(parts.find(part=>part.type==='year')?.value||'').slice(-2);
  return state.lang==='zh'?`${yy}年${name}月`:state.lang==='en'?`${name} ’${yy}`:`${name} ${yy}`;
}
function pressInquiryChoice(button) {
  const form=$('#inquiry-form');if(!form)return;
  if(button.hasAttribute('data-inquiry-month')){
    $$('[data-inquiry-month]',form).forEach(chip=>chip.setAttribute('aria-pressed',String(chip===button)));
    const date=$('[name="date"]',form),month=button.dataset.inquiryMonth;
    if(date?.value&&date.value.slice(0,7)!==month)date.value='';
  }else button.setAttribute('aria-pressed',String(button.getAttribute('aria-pressed')!=='true'));
  readInquiryDraft();inquiryReady=false;const result=$('#inquiry-result');if(result)result.hidden=true;
}
function renderInquiry() {
  const context=currentInquiryContext();
  main.innerHTML=`${kit.inquiryHead()}<div class="container planner-layout page-body"><form id="inquiry-form" class="inquiry-form"><div class="inquiry-context"><span>${t('แผนการเดินทางที่สนใจ','Your chosen places or itinerary')}</span><h2>${esc(contextTitle(context))}</h2>${inquiryPhoto(context,state.lang)}${context.kind==='saved' ? `<ul>${context.refs.map(ref=>`<li>${esc(L(C.findPlace(ref).place.name))}</li>`).join('')}</ul>` : ''}${context.kind==='package'?`<p>${t('โปรแกรมและราคาเป็นตัวอย่าง ต้องยืนยันรายละเอียดก่อนจอง','This itinerary and its price are illustrative. Details must be confirmed before booking.')}</p>`:''}</div><fieldset class="inquiry-group"><legend>${esc(travelText(state.lang,'travelerHeading'))}</legend><div class="form-grid"><label>${t('ชื่อที่ให้เรียก (ไม่บังคับ)','Your name (optional)')}<input name="name" autocomplete="given-name" maxlength="80" value="${esc(inquiryDraft.name)}"></label><label>${t('จำนวนผู้เดินทาง','Number of travellers')}<input name="travelers" type="number" inputmode="numeric" min="1" max="99" required value="${esc(inquiryDraft.travelers)}"></label></div></fieldset><fieldset class="inquiry-group"><legend>${esc(travelText(state.lang,'dateHeading'))}</legend><p class="choice-label" id="inquiry-month-label">${esc(travelText(state.lang,'monthPick'))}</p><div class="choice-chips month-chips" role="group" aria-labelledby="inquiry-month-label"><button type="button" class="choice-chip" data-inquiry-month="" aria-pressed="${!inquiryDraft.month}">${esc(travelText(state.lang,'monthUnsure'))}</button>${upcomingMonths().map(value=>`<button type="button" class="choice-chip" data-inquiry-month="${value}" aria-pressed="${inquiryDraft.month===value}" aria-label="${esc(monthLabel(value,state.lang))}">${esc(monthChipLabel(value))}</button>`).join('')}</div><div class="form-grid"><label>${esc(travelText(state.lang,'exactDate'))}<input name="date" type="date" min="${new Date().toLocaleDateString('en-CA')}" value="${esc(inquiryDraft.date)}"><small>${t('เว้นว่างได้ หากยังไม่กำหนดวัน','Leave blank if your dates are flexible.')}</small></label></div></fieldset><fieldset class="inquiry-group"><legend>${esc(travelText(state.lang,'preferencesHeading'))}</legend><p class="choice-label" id="inquiry-interest-label">${esc(travelText(state.lang,'interestsLabel'))}</p><div class="choice-chips" role="group" aria-labelledby="inquiry-interest-label">${inquiryInterests.map(id=>`<button type="button" class="choice-chip" data-inquiry-interest="${id}" aria-pressed="${inquiryDraft.interests.includes(id)}">${esc(travelText(state.lang,interestKey(id)))}</button>`).join('')}</div><div class="form-grid"><label class="form-wide">${t('สิ่งที่อยากให้ช่วยวางแผน','Anything else to plan around')}<textarea name="notes" rows="4" maxlength="1500" placeholder="${t('เช่น มีผู้สูงอายุ อยากเที่ยวสบาย ๆ หรือจุดรับที่สะดวก','For example: a relaxed pace, travelling with children, or your preferred starting point')}">${esc(inquiryDraft.notes)}</textarea></label></div></fieldset><p class="planner-privacy">${t('ข้อมูลที่กรอกยังไม่ถูกส่งหรือบันทึกลงเซิร์ฟเวอร์ คุณตรวจข้อความและเลือกส่งเองในขั้นถัดไป','Your details are not submitted or stored on a server. Review the message and choose how to send it yourself.')}</p><button class="btn btn-primary" type="submit">${t('สร้างข้อความสอบถาม','Create my trip message')}${icon('arrow')}</button></form><aside class="planner-guide"><h2>${t('จากแนวคิด<br>สู่การเดินทางที่ลงตัว','From an idea<br>to your next journey')}</h2><ol><li>${t('เลือกสถานที่หรือโปรแกรมที่สนใจ','Choose your places or a sample itinerary')}</li><li>${t('บอกวัน จำนวนคน และรูปแบบที่ชอบ','Add dates, group size and your preferences')}</li><li>${t('นำข้อความไปสอบถามบริการและราคายืนยัน','Use your message to confirm services and a quote')}</li></ol>${!hasContact()?`<p class="contact-status">${t('ช่องทางติดต่อ MVM Group อยู่ระหว่างอัปเดต ขณะนี้คุณสามารถคัดลอกหรือดาวน์โหลดแผนไว้ก่อนได้','MVM Group contact details are being updated. For now, you can copy or download your plan.')}</p>`:''}<a href="#/faq" class="link-arrow">${t('อ่านคำถามที่พบบ่อย','Read the FAQ')}${icon('arrow')}</a></aside></div><section class="container inquiry-result" id="inquiry-result" hidden aria-labelledby="inquiry-result-title"><h2 id="inquiry-result-title" tabindex="-1">${t('ข้อความสอบถามการเดินทางของคุณพร้อมแล้ว','Your trip inquiry is ready')}</h2><p>${t('ตรวจข้อความก่อนนำไปส่ง ขณะนี้ยังไม่ได้ส่งให้บริษัท','Review it before sending. Nothing has been sent to the company yet.')}</p><label class="sr-only" for="inquiry-message">${t('ข้อความสอบถาม','Inquiry message')}</label><textarea id="inquiry-message" rows="10" readonly></textarea><div class="inquiry-result-actions"><button type="button" class="btn btn-primary" data-copy-inquiry>${icon('share')}${t('คัดลอกข้อความ','Copy message')}</button><button type="button" class="btn btn-outline" data-download-inquiry>${icon('route')}${t('ดาวน์โหลดรายละเอียด','Download details')}</button><span id="inquiry-channels"></span></div><p class="planner-privacy">${t('การคัดลอกและดาวน์โหลดไม่ใช่การจองหรือยืนยันราคา','Copying or downloading does not make a booking or confirm a price.')}</p></section>`;
  if(inquiryReady)updateInquiryPreview(false);
}
function readInquiryDraft() {
  const form=$('#inquiry-form');if(!form)return;
  const values=new FormData(form),month=$('[data-inquiry-month][aria-pressed="true"]',form)?.dataset.inquiryMonth||'';
  inquiryDraft={name:String(values.get('name')||'').slice(0,80),date:String(values.get('date')||''),month,interests:$$('[data-inquiry-interest][aria-pressed="true"]',form).map(button=>button.dataset.inquiryInterest),travelers:Number(values.get('travelers')),notes:String(values.get('notes')||'').slice(0,1500)};
}
function updateInquiryPreview(focus = true) {
  const result=$('#inquiry-result');if(!result)return;
  const message=buildInquiryText({...inquiryDraft,context:currentInquiryContext(),lang:state.lang});
  $('#inquiry-message').value=message;result.hidden=false;
  $('#inquiry-channels').innerHTML=['whatsapp','line','email'].map(kind=>{
    const href=inquiryChannelHref(kind,C.site.contact,message,state.lang);return href?`<a class="btn btn-outline" href="${esc(href)}"${kind==='email'?'':' target="_blank" rel="noopener noreferrer"'}>${icon(kind==='email'?'mail':'chat')}${kind==='line'?'LINE':kind==='email'?t('เปิดอีเมล','Open email'):'WhatsApp'}</a>`:'';
  }).join('');
  if(focus){siteInteractions?.results(result);result.scrollIntoView({behavior:reduceMotion()||document.documentElement.dataset.input==='keyboard'?'auto':'smooth',block:'start'});$('#inquiry-result-title').focus({preventScroll:true});}
}
function renderPackageExtras(pk) {
  const routePlaces = (pk.routeStops || []).map(ref => ({ ref, found: C.findPlace(ref) })).filter(item => item.found);
  return `${programOverview(pk,state.lang)}<section class="trip-detail-section pkg-daily-section" aria-labelledby="daily-title">
    <div class="pkg-section-head"><h2 id="daily-title">${icon('route')}${t('โปรแกรมการเดินทาง', 'Day-by-day itinerary')}</h2></div>
    <p class="pkg-section-intro">${t('อ่านกิจกรรมและสถานที่ของแต่ละวันได้ด้านล่าง ปรับลำดับได้ตามเวลาเดินทางและความพร้อมของกลุ่ม', 'Explore each day’s activities and places below. The order can be adjusted to your arrival time and your group’s needs.')}</p>
    <ol class="daily-itinerary">${pk.itinerary.map(day => {
      const stops = day.stops.map(ref => ({ ref, found: C.findPlace(ref) })).filter(item => item.found);
      const activities = L(day.activities);
      const dayActivities = Array.isArray(activities) && activities.length ? activities : stops.map(item => L(item.found.place.name));
      return `<li id="program-day-${day.day}"><details${day.day===1?' open':''}>
        <summary><span class="day-index">${icon('calendar')}<span>${t(`วันที่ ${day.day}`, `Day ${day.day}`, 'Day {0}', [day.day])}</span></span><span class="day-summary-copy"><strong>${esc(L(day.title))}</strong><span class="day-route-preview">${stops.map(item => esc(L(item.found.place.name))).join(' · ')}</span></span>${stops[0] ? `<span class="day-thumb" aria-hidden="true">${media(placePhotoKey(stops[0].found.province, stops[0].found.place), { alt: '', sizes: '72px' })}</span>` : ''}${icon('chevron')}</summary>
        <div class="day-detail">${dayPhoto(day,state.lang)}<p>${esc(L(day.summary))}</p><ul class="day-activities">${dayActivities.map(activity => `<li>${icon('check')}<span>${esc(activity)}</span></li>`).join('')}</ul><div class="day-stops">${stops.map(item => `<a href="#/province/${item.ref}">${icon('pin')}${esc(L(item.found.place.name))}</a>`).join('')}</div><a class="daily-map-link" href="${esc(routeMapHref(day.stops))}" target="_blank" rel="noopener noreferrer">${icon('map')}${t('ดูที่ตั้งจุดหมายบนแผนที่', 'Find destinations on a map')}</a></div>
      </details></li>`;
    }).join('')}</ol>
  </section>
  <section class="trip-detail-section pkg-highlights" aria-labelledby="pkg-highlights-title">
    <h2 id="pkg-highlights-title">${icon('nature')}${t('แพ็กเกจนี้มีอะไรบ้าง', 'Trip highlights')}</h2>
    <p class="pkg-section-intro">${t('สถานที่และประสบการณ์ที่แนะนำในโปรแกรมนี้ รายการบริการที่รวมต้องยืนยันในใบเสนอราคา', 'Places and experiences suggested in this itinerary. Included services need to be confirmed in your quote.')}</p>
    <ul>${L(pk.highlights).map(h => `<li>${icon('check')}<span>${esc(h)}</span></li>`).join('')}</ul>
    ${routePlaces.length > 1 ? `<h3 class="pkg-route-places-title">${esc(travelText(state.lang, 'routePlaces'))}</h3><ul class="pkg-route-places">${routePlaces.slice(0, 6).map(({ ref, found }) => `<li><a href="#/province/${ref}">${media(placePhotoKey(found.province, found.place), { alt: '', sizes: '(max-width: 640px) 44vw, 220px' })}<span class="pkg-route-name">${icon('pin')}<span>${esc(L(found.place.name))}</span></span></a></li>`).join('')}</ul>` : ''}
  </section>
  <section class="trip-detail-section pkg-suitability-section" aria-labelledby="suitability-title">
    <h2 id="suitability-title">${icon('people')}${t('เหมาะสำหรับ', 'Who it suits')}</h2>
    <ul class="pkg-suitability">${L(pk.suitability).map(item => `<li>${esc(item)}</li>`).join('')}</ul>
    <p class="pkg-activity-level"><b>${t('ลักษณะกิจกรรม', 'Activity level')}</b><span>${esc(L(pk.activityLevel))}</span></p>
  </section>
  <section class="trip-detail-section pkg-practical" aria-labelledby="practical-title">
    <h2 id="practical-title">${icon('info')}${t('รายละเอียดราคา', 'Price details')}</h2>
    <ul class="pkg-example-facts">${L(pk.quoteDetails.confirmed).map(item => `<li>${esc(item)}</li>`).join('')}</ul>
    <h3>${t('รายละเอียดที่ต้องยืนยันในใบเสนอราคา', 'Details to confirm in your quote')}</h3>
    <ul class="quote-checklist">${L(pk.quoteDetails.toConfirm).map(item => `<li>${icon('check')}<span>${esc(item)}</span></li>`).join('')}</ul>
    <a class="link-arrow" href="${inquiryHref('package', pk.id)}">${t('เตรียมคำถามสำหรับโปรแกรมนี้', 'Prepare an inquiry about this trip')}${icon('arrow')}</a>
  </section>
  <section class="trip-detail-section pkg-route-note" aria-labelledby="route-note-title">
    <h2 id="route-note-title">${icon('map')}${t('ข้อมูลประกอบการวางแผน', 'Before you plan')}</h2>
    <p>${esc(L(pk.itineraryNote))}</p>
    <p>${t('เปิดแผนที่แต่ละวันเพื่อตรวจเส้นทางและเวลาเดินทางล่าสุด', 'Open each day’s map to check routes and current journey times.')}</p>
  </section>`;
}

// ── pages ───────────────────────────────────────────────────
function renderHome() {
  const recommendedTrips = homeTripIds.map(id => C.packages.find(pk => pk.id === id)).filter(Boolean);
  main.innerHTML = `
  ${kit.homeHeroHtml(state.slide)}

  <section class="section container home-destinations" id="destinations" aria-labelledby="dest-title">
    <div class="section-head">
      <div>${eyebrow(t('เริ่มจากเมืองที่คุณชอบ', 'Find your place'))}<h2 class="h-section" id="dest-title">${t('ห้าเมือง ห้าเสน่ห์ของลาว', 'Five places. A world of possibilities.')}</h2><p class="lead">${t('เมืองเก่า ขุนเขา หรือหมู่บ้านริมน้ำ คุณอยากเริ่มที่ไหน?', 'Old towns, mountain views or a village by the river. Where will you begin?')}</p></div>
      <a class="link-arrow" href="#/explore">${t('ดูครบทั้ง 18 แขวง', 'See all 18 provinces')}${icon('arrow')}</a>
    </div>
    <div class="home-city-grid">
      ${homeDestinations.map((item, i) => `<a class="home-city-card" data-home-destination="${item.id}" aria-haspopup="dialog" aria-label="${esc(cityText(state.lang,'open',{name:L(item.name)}))}" href="${item.href}"><div class="home-city-media">${media(item.photo, { alt: L(item.name), sizes: '(max-width: 980px) 50vw, 33vw' })}</div><div class="home-city-copy"><span class="home-card-number" aria-hidden="true">${pad2(i + 1)}</span><div><h3>${esc(L(item.name))}</h3><p>${esc(L(item.summary))}</p></div><span class="home-card-arrow" aria-hidden="true">${icon('arrow')}</span></div></a>`).join('')}
      <a class="home-city-all on-dark" href="#/explore">${mountainArt}<span class="home-all-kicker">${t('อีกหลายมุมที่รอให้ค้นพบ', 'There is more to discover')}</span><span class="home-all-count">18 <small>${t('แขวง', 'provinces')}</small></span><div class="home-city-copy"><div><h3>${t('สำรวจลาวทั้งหมด', 'Find your next favourite')}</h3><p>${t('จากขุนเขาทางเหนือถึงสี่พันดอนทางใต้', 'From northern mountains to southern islands')}</p></div><span class="home-card-arrow" aria-hidden="true">${icon('arrow')}</span></div></a>
    </div>
    <nav class="home-region-links" aria-label="${t('สำรวจลาวตามภาค', 'Explore Laos by region')}"><span>${icon('map')}${t('ออกไปสำรวจต่อ', 'Keep exploring')}</span><div class="home-region-row">${C.regions.map(r => `<a href="#/explore/${r.id}">${L(r.name)}${icon('arrow')}</a>`).join('')}</div></nav>
  </section>

  <section class="section container home-atlas" aria-labelledby="home-atlas-title"><div class="section-head"><div><h2 class="h-section" id="home-atlas-title">${esc(travelText(state.lang,'mapTitle'))}</h2><p class="lead">${esc(travelText(state.lang,'mapIntro'))}</p></div><div class="atlas-regions" role="group" aria-label="${t('สำรวจลาวตามภาค','Explore Laos by region')}"><button type="button" data-atlas-region="all" aria-pressed="true">${t('ทั้งหมด','All')}</button>${C.regions.map(region=>`<button type="button" data-atlas-region="${region.id}" aria-pressed="false">${esc(L(region.name))}</button>`).join('')}</div></div>${mapBlock({id:'home-map',region:'all'})}${mapCredit()}</section>
  ${dayStoryHtml(state.lang,{saveButton})}
  <section class="section band home-styles-section" aria-labelledby="style-title">
    <div class="container">
      <div class="section-head">
        <div>${eyebrow(t('เที่ยวในจังหวะของคุณ', 'Your kind of Laos'))}<h2 class="h-section" id="style-title">${t('วันนี้คุณอยากเที่ยวแบบไหน?', 'What does your perfect day look like?')}</h2></div>
        <a class="link-arrow" href="#/highlights">${t('ดูที่เที่ยวยอดนิยม', 'See the highlights')}${icon('arrow')}</a>
      </div>
      <div class="home-style-grid">${homeStyles.map(item => `<a class="home-style-card" data-home-style="${item.id}" href="${item.href}"><div class="home-style-media">${media(item.photo, { alt: L(item.name), sizes: '(max-width: 980px) 50vw, 25vw' })}</div><div class="home-style-copy"><span class="home-style-icon" aria-hidden="true">${icon(({ nature: 'nature', culture: 'culture', riverside: 'river', activity: 'activity' })[item.id])}</span><div><h3>${esc(L(item.name))}</h3><p>${esc(L(item.summary))}</p></div>${icon('arrow')}</div></a>`).join('')}</div>
    </div>
  </section>

  <section class="section container home-moments" aria-labelledby="moments-title">
    <div class="section-head">
      <div>${eyebrow(t('เรื่องราวระหว่างทาง', 'The moments in between'))}<h2 class="h-section" id="moments-title">${t('ความทรงจำเริ่มจากช่วงเวลาเล็ก ๆ', 'A little moment. A lasting memory.')}</h2><p class="lead">${t('เดินช้าลงอีกนิด แล้วคุณอาจพบมุมที่ทำให้หลงรักลาว', 'Take your time. The small discoveries might be the ones you remember most.')}</p></div>
    </div>
    <div class="home-moment-grid">${homeMoments.map(item => `<article class="home-moment"><a class="home-moment-link" href="${item.href}"><div class="home-moment-media">${media(item.photo, { alt: L(item.name), sizes: '(max-width: 640px) 82vw, 33vw' })}</div><div class="home-moment-copy"><h3>${esc(L(item.name))}</h3><p>${esc(L(item.summary))}</p><span class="link-arrow">${t('ดูรายละเอียดสถานที่', 'View place details')}${icon('arrow')}</span></div></a><a class="home-image-credit" href="#/credits?image=${item.photo}" aria-label="${esc(t('เครดิตภาพ', 'Photo credits') + ': ' + PHOTOS[item.photo].author)}">${icon('camera')}</a>${saveHeart(item.href.replace('#/province/', ''))}</article>`).join('')}</div>
    <p class="scroll-hint" aria-hidden="true"><span>${t('เลื่อนชมเรื่องราวระหว่างทาง', 'Swipe through the moments')}</span>${icon('arrow')}</p>
  </section>

  <section class="section container home-trips" id="trips" aria-labelledby="trips-title">
    <div class="section-head">
      <div>${eyebrow(t('ต่อภาพเป็นการเดินทาง', 'Bring your journey together'))}<h2 class="h-section" id="trips-title">${t('แรงบันดาลใจสำหรับการเดินทางครั้งแรกของคุณ', 'A little inspiration for your first trip')}</h2><p class="lead">${t('เริ่มจากแผนเที่ยวตัวอย่าง แล้วกดดูรายละเอียดและราคาในแบบที่สนใจ', 'Start with a sample itinerary. Open a trip to explore its days and illustrative price.')}</p></div>
      <a class="link-arrow" href="#/packages">${t('ดูแพ็กเกจทั้งหมด', 'See all packages')}${icon('arrow')}</a>
    </div>
    <div class="card-grid home-trip-grid scroll-on-mobile">${recommendedTrips.map(pk => tripCard(pk)).join('')}</div>
    <p class="scroll-hint" aria-hidden="true"><span>${t('เลื่อนดูแผนเที่ยวแนะนำ', 'Swipe for trip ideas')}</span>${icon('arrow')}</p>
  </section>

  <section class="section home-company-section" aria-labelledby="exp-title">
    <div class="container home-company-grid">
      <div class="home-company-copy">${eyebrow('MVM Group · Explore Laos')}<h2 class="h-section" id="exp-title">${t('เลือกที่เที่ยวที่ชอบ<br>แล้วเริ่มวางแผนกับ MVM Group', 'Choose the places you love.<br>Start planning with MVM Group.')}</h2><p class="lead">${t('เก็บเมืองและสถานที่ที่อยากไป แล้วเตรียมวันเดินทาง จำนวนคน และสิ่งที่คุณสนใจ สำหรับวางแผนกับ MVM Group', 'Save the places that catch your eye. Add your dates, group size and preferences to start planning with MVM Group.')}</p><div class="home-company-links"><a class="link-arrow" href="#/about">${t('รู้จัก MVM Group', 'Meet MVM Group')}${icon('arrow')}</a><a class="link-arrow" href="#/faq">${t('คำถามก่อนออกเดินทาง', 'Before you travel')}${icon('arrow')}</a></div></div>
      <div class="home-company-notes">${C.steps.map((item, i) => `<div><span aria-hidden="true">${pad2(i + 1)}</span><h3>${esc(L(item.title))}</h3><p>${esc(L(item.text))}</p></div>`).join('')}</div>
    </div>
    ${welcomeHtml(C.companyProfile.ownerData.welcome,'container')}
    ${homeCompanyProof()}
  </section>`;
  mountHeroExperience();
}

function homeCompanyProof() {
  const data = C.companyProfile.ownerData;
  const team = data.team.slice(0, 2).map(person => `<article>${C.images[person.image] || PHOTOS[person.image] ? media(person.image, { alt: L(person.name), sizes: '(max-width: 640px) 100vw, 380px' }) : ''}<h3>${esc(L(person.name))}</h3><p>${esc(L(person.role))}</p></article>`).join('');
  const review = data.reviews[0];
  let reviewSource = '';
  try { if (new URL(review?.sourceUrl).protocol === 'https:') reviewSource = review.sourceUrl; } catch {}
  const quote = review ? `<figure><blockquote>${esc(L(review.text))}</blockquote><figcaption>${esc(review.name)}${reviewSource ? ` · <a href="${esc(reviewSource)}" target="_blank" rel="noopener noreferrer">${t('อ่านรีวิวต้นทาง', 'Read the original review')}</a>` : ''}</figcaption></figure>` : '';
  return team || quote ? `<div class="container home-proof-grid" aria-label="${t('ผู้ดูแลและเรื่องเล่าจากผู้เดินทาง', 'Our people and travellers')}">${team}${quote}</div>` : '';
}

function renderExplore(region) {
  const regionObj=C.findRegion(region), {query}=parseRoute();
  const search=query.get('q')||'', interest=C.placeTypes[query.get('interest')]?query.get('interest'):'all';
  const blocks=(regionObj?[regionObj]:C.regions).map(r=>`<section class="region-block" aria-labelledby="rg-${r.id}"><div class="region-head"><h2 id="rg-${r.id}"><i class="dot-${r.id}" aria-hidden="true"></i>${L(r.name)}</h2><p>${C.provincesByRegion(r.id).length} ${t('แขวง','provinces')} · ${L(r.tagline)}</p></div>${regionObj?`<p class="region-intro">${esc(L(r.intro))}</p>`:''}<div class="prov-grid">${C.provincesByRegion(r.id).map(provCard).join('')}</div></section>`).join('');
  main.innerHTML=`${kit.exploreHead(region, search, interest)}<section class="container search-result-section" id="search-result-section" hidden aria-labelledby="search-results-title"><div class="search-results-head"><h2 id="search-results-title">${t('จุดหมายที่พบ','Places to explore')}</h2><button type="button" class="text-button" data-clear-search>${t('ล้างการค้นหา','Clear search')}</button></div><p id="search-result-status" role="status" aria-live="polite"></p><div id="search-results" class="discovery-grid"></div></section><div class="container explore-grid" id="province-browser"><div class="explore-map">${mapBlock({region})}${legend()}${mapCredit()}</div><div class="explore-list">${blocks}</div></div>${monthChooserHtml(state.lang)}`;
  updateExploreResults(false);
}
function updateExploreResults(updateUrl = true) {
  const input=$('#destination-search'), select=$('#interest-filter');if(!input||!select)return;
  const query=input.value.trim(), interest=select.value, {parts}=parseRoute(), region=C.findRegion(parts[1])?parts[1]:'all';
  const active=!!query||interest!=='all';
  $('#province-browser').hidden=active;$('#search-result-section').hidden=!active;
  if(active){const hits=searchDestinations({query,interest,region});$('#search-result-status').textContent=t(`พบ ${hits.length} จุดหมาย`,`${hits.length} places found`, "{0} places found", [hits.length]);$('#search-results').innerHTML=hits.length?hits.map(discoveryTile).join(''):`<div class="planner-empty"><h3>${t('ยังไม่พบจุดหมายนี้','No places found yet')}</h3><p>${t('ลองชื่อเมืองหรือสถานที่อีกแบบ หรือล้างตัวกรองแล้วเลือกจากแผนที่','Try another city or place name, or clear your filters and explore the map.')}</p><button type="button" class="btn btn-outline" data-clear-search>${t('กลับไปดูแผนที่','Back to the map')}</button></div>`;keepThai($('#search-results'));}
  if(updateUrl){const params=new URLSearchParams();if(query)params.set('q',query);if(interest!=='all')params.set('interest',interest);const route=`#/explore${region==='all'?'':`/${region}`}${params.size?`?${params}`:''}`;history.replaceState(history.state,'',publicHref(route,state.lang));$$('.explore-tabs a').forEach(link=>{const url=new URL(link.href);url.search=params.toString();link.href=url.pathname+url.search;});}
  adaptLinks($('#search-results'));
  if(updateUrl && document.activeElement !== input) siteInteractions?.results(active ? $('#search-results') : $('#province-browser'));
  siteInteractions?.refresh();
}

// a place's picture: its photo, or a designed stand-in (province outline + type icon)
function placeVisual(pv, pl, { sizes = '100vw', eager = false, deferred = false } = {}) {
  const key = placePhotoKey(pv, pl);
  if (key) return media(key, { alt: L(pl.name), sizes, eager, deferred });
  return `<div class="visual-fallback r-${pv.region}" role="img" aria-label="${esc(L(pl.name))}"><span class="vf-shape">${silhouette(pv.id)}<span class="visual-icon">${icon(pl.type)}</span></span>${mountainArt}</div>`;
}

function railCard(pv, pl, i) {
  return `<div class="save-card save-card-rail" style="--i:${Math.min(i, 6)}"><a class="pcard" href="#/province/${pv.id}/${pl.id}" data-place-ref="${pv.id}/${pl.id}">
    <div class="pcard-media">${placeVisual(pv, pl, { sizes: '(max-width: 640px) 80vw, 320px' })}</div>
    <div class="pcard-top"><span class="chip-glass">${icon(pl.type)}${L(C.placeTypes[pl.type])}</span></div>
    <div class="pcard-body">
      <h3>${L(pl.name)}</h3>
      <p>${esc(L(pl.text))}</p>
      <span class="pcard-more">${t('ดูรายละเอียด', 'View details')}${icon('arrow')}</span>
    </div>
  </a>${saveHeart(`${pv.id}/${pl.id}`)}</div>`;
}

function renderProvince(pv) {
  const region = C.findRegion(pv.region);
  const pkgs = C.packagesFor({ provinceId: pv.id });
  const index = C.provinces.indexOf(pv);
  const prev = C.provinces[(index - 1 + C.provinces.length) % C.provinces.length];
  const next = C.provinces[(index + 1) % C.provinces.length];
  const siblings = C.provincesByRegion(pv.region).filter(item => item.id !== pv.id);
  main.innerHTML = `
  ${kit.provinceHeroHtml(pv)}
  <section class="places-sec" aria-labelledby="places-title">
    <div class="container places-head">
      <div>
        <h2 id="places-title">${t('สถานที่เที่ยวเด่น', 'Places to see')}<small>${pv.places.length} ${t('แห่ง', 'places')}</small></h2>
        <p>${t('เลื่อนดูทีละที่ แล้วแตะการ์ดเพื่อดูรายละเอียด', 'Browse one by one, then tap a card for the details.')}</p>
      </div>
      <div class="rail-arrows">
        <button type="button" class="round-btn" data-rail="prev" aria-label="${t('เลื่อนไปทางซ้าย', 'Scroll back')}">${icon('back')}</button>
        <button type="button" class="round-btn" data-rail="next" aria-label="${t('เลื่อนไปทางขวา', 'Scroll forward')}">${icon('arrow')}</button>
      </div>
    </div>
    <div class="place-rail" data-rail-track>${pv.places.map((pl, i) => railCard(pv, pl, i)).join('')}</div>
    <div class="container"><div class="rail-progress" aria-hidden="true"><i></i></div></div>
  </section>
  <section class="container p-facts-sec" aria-label="${t('ข้อมูลแขวง', 'Province facts')}">
    <div class="p-facts-card">
      <dl class="p-facts">
        <div><dt>${t('เมืองเอก', 'Capital')}</dt><dd>${L(pv.capital)}</dd></div>
        <div><dt>${t('ภาค', 'Region')}</dt><dd><a href="#/explore/${region.id}">${L(region.name)}</a></dd></div>
        <div><dt>${t('ภาษาลาว', 'In Lao')}</dt><dd lang="lo">${pv.name.lo}</dd></div>
      </dl>
      ${laosMapSvg({ current: pv.id, cls: 'locator' })}
      <div class="p-facts-actions">
        <button type="button" class="btn btn-primary" data-scroll="contact">${icon('chat')}${t(`วางแผนเที่ยว${nameOf(pv)}`, `Plan a trip to ${nameOf(pv)}`, "Plan a trip to {0}", [nameOf(pv)])}</button>
        ${pkgs.length ? `<a class="btn btn-outline" href="#/packages?province=${pv.id}">${t('ดูแพ็กเกจ', 'See packages')} (${pkgs.length})</a>` : ''}
      </div>
    </div>
  </section>
  <section class="container related" aria-labelledby="rel-title">
    <h2 id="rel-title">${t(`แขวงอื่นใน${L(region.name)}`, `More in ${L(region.name)}`, "More in {0}", [L(region.name)])}</h2>
    <div class="prov-grid">${siblings.map(provCard).join('')}</div>
    <nav class="pager" aria-label="${t('แขวงก่อนหน้าและถัดไป', 'Previous and next province')}">
      <a href="#/province/${prev.id}" rel="prev">${icon('back')}<span><small>${t('แขวงก่อนหน้า', 'Previous province')}</small>${L(prev.name)}</span></a>
      <a href="#/province/${next.id}" rel="next" class="pager-next"><span><small>${t('แขวงถัดไป', 'Next province')}</small>${L(next.name)}</span>${icon('arrow')}</a>
    </nav>
  </section>`;
  requestAnimationFrame(() => updateRail($('[data-rail-track]', main)));
}

// progress bar + arrow states for a horizontal place rail
function updateRail(rail) {
  if (!rail) return;
  const sec = rail.closest('.places-sec');
  const max = rail.scrollWidth - rail.clientWidth;
  if (!sec) return;
  sec.style.setProperty('--w', `${Math.min(100, (rail.clientWidth / Math.max(1, rail.scrollWidth)) * 100)}%`);
  sec.style.setProperty('--x', `${(rail.scrollLeft / Math.max(1, rail.scrollWidth)) * 100}%`);
  sec.classList.toggle('no-overflow', max <= 4);
  const prev = $('[data-rail="prev"]', sec);
  const next = $('[data-rail="next"]', sec);
  if (prev) prev.disabled = rail.scrollLeft <= 4;
  if (next) next.disabled = rail.scrollLeft >= max - 4;
}

function packageItems(province) {
  let items = province ? C.packagesFor({ provinceId: province.id }) : C.packagesFor({ region: state.pkgRegion });
  if(state.pkgDays==='short')items=items.filter(item=>item.days<=3);
  if(state.pkgDays==='long')items=items.filter(item=>item.days>=4);
  if (state.sort === 'price-low') items = [...items].sort((a, b) => a.price - b.price);
  if (state.sort === 'price-high') items = [...items].sort((a, b) => b.price - a.price);
  return items;
}
function packageGridHtml(province) {
  const items = packageItems(province);
  return items.length
    ? items.map(pk => tripCard(pk, { price: true })).join('')
    : `<div class="empty"><p>${t('ยังไม่มีโปรแกรมท่องเที่ยวในหมวดนี้', 'There are no itineraries in this category yet.')}</p><a class="link-arrow" href="#/packages">${t('ดูโปรแกรมทั้งหมด', 'See all itineraries')}${icon('arrow')}</a></div>`;
}
const packageStatus = province => t(`แสดง ${packageItems(province).length} โปรแกรม`, `Showing ${packageItems(province).length} itineraries`, "Showing {0} itineraries", [packageItems(province).length]);

function renderPackages(query) {
  const provinceId = query.get('province') || C.legacyDestinations[query.get('destination')] || '';
  const province = C.findProvince(provinceId) || null;
  state.pkgRegion=C.findRegion(query.get('region'))?.id||'all';
  state.sort=['price-low','price-high'].includes(query.get('sort'))?query.get('sort'):'recommended';
  state.pkgDays=['short','long'].includes(query.get('days'))?query.get('days'):'all';
  const regionPills = [{ id: 'all', name: { [state.lang]: t('ทั้งหมด', 'All') } }, ...C.regions];
  const filters = province
    ? `<a class="pill" href="#/packages">${t('ทั้งหมด', 'All')}</a><span class="pill" aria-current="page">${nameOf(province)}</span>`
    : regionPills.map(r => `<button type="button" class="pill" data-pkg-region="${r.id}" aria-pressed="${state.pkgRegion === r.id}">${L(r.name)}</button>`).join('');
  main.innerHTML = `
  ${kit.packagesHead()}
  <div class="container page-body packages-page-body">
    <p class="notice package-notice">${t('โปรแกรมและราคาเป็นตัวอย่าง โปรดขอใบเสนอราคาก่อนยืนยัน ยังไม่เปิดจองหรือชำระเงินผ่านเว็บไซต์', 'Itineraries and prices are examples. Request a quote before confirming. Website bookings and payments are not open.')}</p>
    <div class="package-tools">
      <div class="pills" role="group" aria-label="${t('กรองตามภาค', 'Filter by region')}">${filters}</div>
      <div class="package-selects">
      <label class="sort">${t('จำนวนวัน','Trip length')}<select id="pkg-days"><option value="all">${t('ทุกระยะเวลา','Any length')}</option><option value="short">${t('1–3 วัน','1–3 days')}</option><option value="long">${t('4 วันขึ้นไป','4+ days')}</option></select></label>
      <label class="sort">${t('เรียงตาม', 'Sort by')}<select id="pkg-sort">
        <option value="recommended">${t('แนะนำ', 'Suggested')}</option>
        <option value="price-low">${t('ราคาน้อยไปมาก', 'Price: low to high')}</option>
        <option value="price-high">${t('ราคามากไปน้อย', 'Price: high to low')}</option>
      </select></label>
      </div>
    </div>
    <h2 class="sr-only">${t('รายการโปรแกรม', 'Itineraries')}</h2>
    <p class="package-count" aria-live="polite" id="pkg-status">${packageStatus(province)}</p>
    <div class="card-grid packages-grid" id="pkg-grid" data-province="${province ? province.id : ''}">${packageGridHtml(province)}</div>
  </div>`;
  $('#pkg-sort').value = state.sort;
  $('#pkg-days').value=state.pkgDays;
}
function updatePackages() {
  const grid = $('#pkg-grid');
  if (!grid) return;
  const province = C.findProvince(grid.dataset.province) || null;
  grid.innerHTML = packageGridHtml(province);
  keepThai(grid);
  $('#pkg-status').textContent = packageStatus(province);
  const params=new URLSearchParams();if(province)params.set('province',province.id);if(state.pkgRegion!=='all'&&!province)params.set('region',state.pkgRegion);if(state.sort!=='recommended')params.set('sort',state.sort);if(state.pkgDays!=='all')params.set('days',state.pkgDays);history.replaceState(history.state,'',publicHref(`#/packages${params.size?`?${params}`:''}`,state.lang));
  adaptLinks(grid);
  $$('[data-pkg-region]').forEach(btn => btn.setAttribute('aria-pressed', String(btn.dataset.pkgRegion === state.pkgRegion)));
  siteInteractions?.results(grid);
}

function renderPackage(pk) {
  const pv = C.findProvince(pk.provinceId);
  main.innerHTML = `
  ${kit.packageTop(pk)}
  <div class="container pkg-body">
    <div class="pkg-main">
      ${renderPackageExtras(pk)}
      <a class="link-arrow" href="#/province/${pv.id}">${t(`ดูสถานที่เที่ยวทั้งหมดใน${nameOf(pv)}`, `See all highlights in ${nameOf(pv)}`, "See all highlights in {0}", [nameOf(pv)])}${icon('arrow')}</a>
    </div>
  </div>`;
  const panel=$('.price-panel',main),hero=$('.pkg-overview .pkg-hero',main),body=$('.pkg-body',main);
  if(panel&&body){$('.pkg-main',body).prepend(hero);body.append(panel);body.classList.add('pkg-with-sidebar');$('.pkg-overview',main)?.remove();}
}

function renderHighlights(region) {
  const regionObj = C.findRegion(region);
  const list = C.famousPlaces(region);
  main.innerHTML = `
  ${kit.highlightsHead(region)}
  <div class="container page-body">
    <h2 class="sr-only">${regionObj ? L(regionObj.name) : t('ที่เที่ยวทั้งหมด', 'All places')}</h2>
    <div class="photo-grid">${list.map(item => photoCard(item.ref)).join('')}</div>
    <p class="credits-note">${icon('camera')}<span>${t('ภาพถ่ายจาก Wikimedia Commons', 'Photos from Wikimedia Commons')} · <a href="#/credits">${t('ดูเครดิตภาพ', 'Photo credits')}</a></span></p>
  </div>`;
}

// ── place viewer: full-screen, swipe through every place of one province ──
const viewer = { el: null, pv: null, lang: '', index: -1, target: null, open: false, pushed: false, opener: null };
let navCount = 0;
let viewerRaf = 0;
let viewerTargetTimer = 0;
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const PAGE_PARTS = () => [$('.skip-link'), headerEl, main, footerEl, barEl].filter(Boolean);

function viewerSlide(pv, pl, i) {
  const details = C.placeDetails[`${pv.id}/${pl.id}`];
  const key = placePhotoKey(pv, pl);
  const facts = details ? [
    ['sun', t('ช่วงเวลาที่ดี', 'Best time'), details.best, ''],
    ['clock', t('ควรใช้เวลา', 'Time needed'), details.time, ''],
    ['route', t('การเดินทาง', 'Getting there'), details.access, 'wide'],
    ['info', t('น่ารู้', 'Good to know'), details.note, 'wide'],
  ].filter(([, , value]) => value) : [];
  return `<div class="v-slide" data-index="${i}" role="group" aria-roledescription="${t('สไลด์', 'slide')}" aria-label="${i + 1} / ${pv.places.length} · ${esc(L(pl.name))}">
    <div class="v-media">${placeVisual(pv, pl, { sizes: '100vw', deferred: true })}${key && PHOTOS[key] ? credit(key, 'credit v-credit') : ''}</div>
    <div class="v-info">
      <div class="v-sheet-handle" data-sheet-handle aria-hidden="true"><span></span></div>
      <h2 class="v-title" tabindex="-1">${L(pl.name)}</h2>
      <div class="v-head"><span class="chip">${icon(pl.type)}${L(C.placeTypes[pl.type])}</span><span class="v-place-meta">${esc(L(pv.name))}${details?.time ? ` · ${esc(L(details.time))}` : ''}</span></div>
      <p class="v-about">${esc(L(pl.text))}</p>
      ${L(details?.tip) ? `<div class="v-tip" role="note">${icon('chat')}<div><b>${t('เคล็ดลับจากทีมงาน', 'A tip from our team')}</b><p>${esc(L(details.tip))}</p></div></div>` : ''}
      <div class="v-quick-actions"><a class="btn btn-light" href="${inquiryHref('place', `${pv.id}/${pl.id}`)}">${icon('chat')}${t('วางแผนไปที่นี่', 'Plan a visit')}</a>${saveButton(`${pv.id}/${pl.id}`)}</div>
      ${details ? `<details class="place-more"><summary>${t('ข้อมูลเพิ่มเติม', 'More about this place')}${icon('chevron')}</summary><div class="place-more-body"><p class="place-story">${esc(L(details.about))}</p><ul class="v-highlights">${L(details.highlights).map(item => `<li>${icon('check')}<span>${esc(item)}</span></li>`).join('')}</ul>${facts.length ? `<dl class="v-facts">${facts.map(([name, label, value, wide]) => `<div${wide ? ' class="wide"' : ''}><dt>${icon(name)}${label}</dt><dd>${esc(L(value))}</dd></div>`).join('')}</dl>` : ''}</div></details>` : ''}
      <div class="v-actions">
        ${contactAction('line', 'btn btn-ghost', t('สอบถามทาง LINE', 'Ask on LINE'), 'chat')}
        ${contactAction('whatsapp', 'btn btn-ghost', 'WhatsApp', 'chat')}
        <button type="button" class="btn btn-ghost" data-share>${icon('share')}${t('แชร์', 'Share')}</button>
      </div>
    </div>
  </div>`;
}

function viewerThumb(pv, pl, i) {
  const key = placePhotoKey(pv, pl);
  const ph = key && PHOTOS[key];
  const pic = ph
    ? `<img src="${smallPhoto(key)}" alt="" width="40" height="40" loading="lazy" decoding="async">`
    : key ? `<img src="assets/images/${key}-160.webp" alt="" width="40" height="40" loading="lazy" decoding="async">` : `<span class="thumb-icon">${icon(pl.type)}</span>`;
  return `<button type="button" class="v-thumb" data-viewer-go="${i}" aria-current="false">${pic}<span>${esc(L(pl.name))}</span></button>`;
}

function renderViewer() {
  viewerGestureCleanup?.();viewerGestureCleanup=null;
  const { pv } = viewer;
  viewer.el.innerHTML = `
    <div class="v-top">
      <button type="button" class="v-close" data-viewer="close" aria-label="${t('ปิด', 'Close')}">${icon('close')}</button>
      <div class="v-where"><b id="viewer-title">${esc(t(`ที่เที่ยวใน${L(pv.name)}`, `Places in ${L(pv.name)}`, "Places in {0}", [L(pv.name)]))}</b><span class="v-count" role="status" aria-live="polite" aria-atomic="true"></span></div>
      <div class="v-arrows">
        <button type="button" class="round-btn" data-viewer="prev" aria-label="${t('ที่ก่อนหน้า', 'Previous place')}">${icon('back')}</button>
        <button type="button" class="round-btn" data-viewer="next" aria-label="${t('ที่ถัดไป', 'Next place')}">${icon('arrow')}</button>
      </div>
      <div class="v-progress" aria-hidden="true"><i></i></div>
    </div>
    <div class="v-track">${pv.places.map((pl, i) => viewerSlide(pv, pl, i)).join('')}</div>
    <nav class="v-rail" aria-label="${t('เลือกสถานที่', 'Choose a place')}">${pv.places.map((pl, i) => viewerThumb(pv, pl, i)).join('')}</nav>`;
  keepThai(viewer.el);
}

function openViewer(pv, index) {
  if (!viewer.el) {
    viewer.el = document.createElement('div');
    viewer.el.className = 'viewer';
    viewer.el.hidden = true;
    viewer.el.setAttribute('role', 'dialog');
    viewer.el.setAttribute('aria-modal', 'true');
    viewer.el.setAttribute('aria-labelledby', 'viewer-title');
    viewer.el.tabIndex = -1;
    document.body.append(viewer.el);
  }
  if (viewer.pv !== pv || viewer.lang !== state.lang || !viewer.el.firstChild) {
    viewer.pv = pv;
    viewer.lang = state.lang;
    viewer.index = -1;
    renderViewer();
    void viewer.el.offsetWidth; // new slides start hidden, so the first one can animate in
  }
  if (!viewer.open) {
    viewer.open = true;
    viewer.pushed = !!history.state?.viewerFrom;
    viewer.opener = document.activeElement;
    viewer.el.hidden = false;
    viewer.el.inert = false;
    document.documentElement.classList.add('viewer-open');
    PAGE_PARTS().forEach(part => { part.inert = true; });
    holdBackground('place', true);
    void viewer.el.offsetWidth; // let the fade-in transition run
    viewer.el.classList.add('is-open');
    viewer.el.focus({ preventScroll: true }); // Tab reaches the close button first; arrow keys work straight away
  }
  if(!viewerGestureCleanup)viewerGestureCleanup=attachViewerGestures(viewer.el,{onClose:()=>closeViewer()});
  goToSlide(index, false);
}

function goToSlide(index, smooth = true) {
  const track = viewer.el && $('.v-track', viewer.el);
  if (!track) return;
  const i = Math.max(0, Math.min(viewer.pv.places.length - 1, index));
  const animate = smooth && !reduceMotion() && document.documentElement.dataset.input !== 'keyboard';
  viewer.target = animate ? i : null;
  clearTimeout(viewerTargetTimer);
  if (animate) viewerTargetTimer = setTimeout(() => { viewer.target = null; }, 900);
  track.scrollTo({ left: i * track.clientWidth, behavior: animate ? 'smooth' : 'auto' });
  setViewerIndex(i);
}

function setViewerIndex(i) {
  if (!viewer.open || viewer.index === i) return;
  const departingSlide = document.activeElement?.closest('.v-slide');
  viewer.index = i;
  const { pv, el } = viewer;
  const pl = pv.places[i];
  $$('.v-slide', el).forEach((slide, n) => {
    slide.classList.toggle('is-active', n === i);
    slide.inert = n !== i;
  });
  const activate = (n, priority) => {
    const image = $(`.v-slide[data-index="${n}"] .v-media img`, el);
    if (!image) return null;
    image.loading = 'eager'; image.fetchPriority = priority;
    if (image.dataset.srcset) { image.srcset = image.dataset.srcset; delete image.dataset.srcset; }
    if (image.dataset.src) { image.src = image.dataset.src; delete image.dataset.src; }
    return image;
  };
  const image = activate(i, 'high');
  // Sources, not lazy-loading proximity, enforce the inactive-slide boundary.
  const prepareNeighbors = () => {
    if (!viewer.open || viewer.pv !== pv || viewer.index !== i) return;
    for (const n of [i - 1, i + 1]) if (n >= 0 && n < pv.places.length) activate(n, 'low');
  };
  if (image) image.decode().then(prepareNeighbors, () => {});
  if (departingSlide && departingSlide.dataset.index !== String(i)) $('.v-slide.is-active .v-title', el)?.focus({ preventScroll: true });
  $('.v-count', el).textContent = `${pad2(i + 1)} / ${pad2(pv.places.length)}`;
  $('.v-progress i', el).style.width = `${((i + 1) / pv.places.length) * 100}%`;
  $$('.v-thumb', el).forEach((thumb, n) => thumb.setAttribute('aria-current', String(n === i)));
  const thumb = $(`.v-thumb[data-viewer-go="${i}"]`, el);
  const rail = $('.v-rail', el);
  if (thumb && rail) rail.scrollTo({ left: thumb.offsetLeft - (rail.clientWidth - thumb.offsetWidth) / 2, behavior: reduceMotion() || document.documentElement.dataset.input === 'keyboard' ? 'auto' : 'smooth' });
  $('[data-viewer="prev"]', el).disabled = i === 0;
  $('[data-viewer="next"]', el).disabled = i === pv.places.length - 1;
  updateMore($('.v-slide.is-active .v-info', el));
  const href = publicHref(`#/province/${pv.id}/${pl.id}`,state.lang);
  if (location.pathname + location.search !== href) history.replaceState(history.state, '', href);
  adaptLinks(el);
  document.title = `${L(pl.name)} · ${L(pv.name)} | MVM Group`;
  syncMetadata();
}

// on short screens the details panel scrolls: fade its bottom edge while there is more to read
function updateMore(info) {
  if (info) info.classList.toggle('more-below', info.scrollHeight - info.scrollTop - info.clientHeight > 8);
}

function closeViewer({ fromRoute = false } = {}) {
  cancelAnimationFrame(viewerRaf);
  viewerRaf = 0;
  clearTimeout(viewerTargetTimer);
  viewer.target = null;
  if (!viewer.open) return;
  if (!fromRoute) {
    if (viewer.pushed) history.back();
    else navigate(`#/province/${viewer.pv.id}`, true);
    return; // the route change closes the viewer
  }
  viewer.open = false;
  holdBackground('place', false);
  viewerGestureCleanup?.();viewerGestureCleanup=null;
  const { el, pv } = viewer;
  el.classList.remove('is-open');
  el.inert = true; // fading out: no longer reachable
  document.documentElement.classList.remove('viewer-open');
  PAGE_PARTS().forEach(part => { part.inert = false; });
  setTimeout(() => { if (!viewer.open) el.hidden = true; }, reduceMotion() ? 0 : 260);
  const pl = pv.places[viewer.index];
  const card = pl && $(`[data-place-ref="${pv.id}/${pl.id}"]`, main);
  if (card) {
    const rail = card.closest('.place-rail'), item = card.closest('.save-card') || card;
    if (rail) rail.scrollLeft = Math.max(0, item.offsetLeft - (rail.clientWidth - item.offsetWidth) / 2);
    card.focus({ preventScroll: true });
  } else if (viewer.opener && document.contains(viewer.opener)) viewer.opener.focus({ preventScroll: true });
}

function renderCredits() {
  const selected = parseRoute().query.get('image');
  const rows = Object.entries(PHOTOS).map(([key, ph]) => {
    const used = [...new Set(C.provinces.flatMap(pv => [...(provincePhotos[pv.id] === key ? [L(pv.name)] : []), ...pv.places.filter(pl => placePhotoKey(pv, pl) === key).map(pl => L(pl.name))]))];
    const source = smallPhoto(key, 320);
    const generated = ph.kind === 'generated';
    const license = ph.licenseUrl ? `<a href="${esc(ph.licenseUrl)}" target="_blank" rel="noopener noreferrer license">${esc(ph.license)}</a>` : esc(ph.license);
    const references = generated
      ? `<span>${t('ภาพประกอบสร้างด้วย AI จากข้อมูลและภาพอ้างอิงของสถานที่จริง ไม่ใช่ภาพถ่ายหน้างาน', 'AI-generated illustration grounded in references to the real place; not an on-location photograph.')}</span>${(ph.referenceUrls || []).map((url, i) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${t('ข้อมูลและภาพอ้างอิงสถานที่', 'Location reference')} ${i + 1}</a>`).join('')}`
      : `<span>${t('ภาพ', 'Photo')}: ${esc(ph.author)} · ${license}</span><a href="${esc(commonsPage(ph))}" target="_blank" rel="noopener noreferrer">${t('ไฟล์ต้นฉบับและข้อมูลผู้ถ่าย', 'Original image and photographer')}</a>`;
    return `<li id="image-${esc(key)}" class="${selected === key ? 'credit-selected' : ''}" tabindex="-1"><img src="${esc(source)}" alt="" width="96" height="72" loading="lazy" decoding="async"><div><b>${esc(used.join(' · ') || ph.file || key)}</b>${references}</div></li>`;
  }).join('');
  main.innerHTML = `${kit.creditsHead()}<div class="container page-body"><ul class="credit-list">${rows}</ul><p class="credits-note">${t('ภาพประกอบหน้าแรกและการ์ดโปรแกรมบางภาพเป็นภาพออกแบบเพื่อแนะนำจุดหมาย', 'Some homepage and itinerary-card illustrations are designed imagery introducing the destinations.')}</p><p class="credits-note">${t('ข้อมูลแผนที่', 'Map data')}: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> (ODbL)</p></div>`;
  if(selected)requestAnimationFrame(()=>{const row=document.getElementById(`image-${selected}`);row?.scrollIntoView({block:'center'});row?.focus({preventScroll:true});});
}

function renderOwnerProfile(data) {
  const image = key => C.images[key] || PHOTOS[key] ? media(key,{sizes:'(max-width:640px) 100vw, 380px'}) : '';
  const source = value => {try{const url=new URL(value);return url.protocol==='https:'?url.href:'';}catch{return '';}};
  return `${L(data.serviceAreas)?.length?`<section class="owner-section"><h2>${t('พื้นที่ให้บริการ','Where we work')}</h2><p>${L(data.serviceAreas).map(esc).join(' · ')}</p></section>`:''}${data.team.length?`<section class="owner-section"><h2>${t('ทีมที่ดูแลการเดินทาง','The people behind your journey')}</h2><div class="owner-grid">${data.team.map(item=>`<article>${image(item.image)}<h3>${esc(L(item.name))}</h3><p>${esc(L(item.role))}</p></article>`).join('')}</div></section>`:''}${data.fleet.length?`<section class="owner-section"><h2>${t('การเดินทางของเรา','Travelling with us')}</h2><div class="owner-grid">${data.fleet.map(item=>`<article>${image(item.image)}<h3>${esc(L(item.title))}</h3><p>${esc(L(item.description))}</p></article>`).join('')}</div></section>`:''}${data.reviews.length?`<section class="owner-section"><h2>${t('เรื่องเล่าจากผู้เดินทาง','From our travellers')}</h2><div class="owner-grid">${data.reviews.map(item=>`<figure><blockquote>${esc(L(item.text))}</blockquote><figcaption>${esc(item.name)}${source(item.sourceUrl)?` · <a href="${esc(source(item.sourceUrl))}" target="_blank" rel="noopener noreferrer">${t('อ่านรีวิวต้นทาง','Read the original review')}</a>`:''}</figcaption></figure>`).join('')}</div></section>`:''}`;
}

// A personal note from the team appears only when the owner adds a real one (content.js ownerData.welcome).
function welcomeHtml(welcome, cls = '') {
  if (!welcome || !L(welcome.message)) return '';
  const portrait = welcome.image && (C.images[welcome.image] || PHOTOS[welcome.image]) ? media(welcome.image, { alt: L(welcome.name), sizes: '160px' }) : `<span class="welcome-mark" aria-hidden="true">${icon('chat')}</span>`;
  return `<section class="welcome-note ${cls}" aria-labelledby="welcome-title"><div class="welcome-portrait">${portrait}</div><div><p class="welcome-hello" lang="lo">ສະບາຍດີ</p><h2 id="welcome-title">${t('ยินดีต้อนรับจากทีมงาน', 'A welcome from our team')}</h2><blockquote>${esc(L(welcome.message))}</blockquote>${L(welcome.name) ? `<p class="welcome-sign"><b>${esc(L(welcome.name))}</b>${L(welcome.role) ? ` · ${esc(L(welcome.role))}` : ''}</p>` : ''}</div></section>`;
}
function renderAbout() {
  const profile=C.companyProfile, data=profile.ownerData;
  main.innerHTML=`${kit.aboutHead()}${kit.aboutGallery()}<div class="container about-content page-body">${welcomeHtml(data.welcome)}<section class="company-intro"><div><h2>${t('เว็บไซต์นี้ช่วยคุณอย่างไร','How this website helps')}</h2><p>${t('เว็บไซต์นี้ช่วยให้คุณรู้จักลาว เลือกจุดหมาย และเตรียมรายละเอียดการเดินทางก่อนสอบถามบริการกับ MVM Group','This website helps you discover Laos, choose your places and prepare the details of a trip to discuss with MVM Group.')}</p><a class="btn btn-primary" href="#/explore">${t('เริ่มต้นสำรวจลาว','Start exploring Laos')}${icon('arrow')}</a></div><div class="approach-list">${profile.approach.map(item=>`<div><h3>${esc(L(item.title))}</h3><p>${esc(L(item.text))}</p></div>`).join('')}</div></section>${renderOwnerProfile(data)}${data.legalName||data.registration||data.tourLicence||L(data.officeAddress)?`<section class="company-facts"><h2>${t('ข้อมูลบริษัท','Company details')}</h2><dl>${data.legalName?`<dt>${t('ชื่อบริษัท','Legal name')}</dt><dd>${esc(data.legalName)}</dd>`:''}${data.registration?`<dt>${t('ทะเบียนบริษัท','Registration')}</dt><dd>${esc(data.registration)}</dd>`:''}${data.tourLicence?`<dt>${t('ใบอนุญาต','Licence')}</dt><dd>${esc(data.tourLicence)}</dd>`:''}${L(data.officeAddress)?`<dt>${t('ที่อยู่','Address')}</dt><dd>${esc(L(data.officeAddress))}</dd>`:''}</dl></section>`:''}<section class="faq-list"><h2>${t('วางแผนได้อย่างเข้าใจ','A little clarity before you plan')}</h2>${faqHtml()}</section></div>`;
}

function renderNotFound() {
  main.innerHTML = kit.notFoundHtml();
}

// ── routing ─────────────────────────────────────────────────
function parseRoute() { return parseBrowserRoute(location); }
function adaptLinks(root = document) {
  $$('a[href^="#/"]', root).forEach(link => {
    link.dataset.route=link.getAttribute('href');link.setAttribute('href',publicHref(link.dataset.route,state.lang));
  });
}
function navigate(route, replace = false, { source = null } = {}) {
  const target=publicHref(route,state.lang), url=new URL(target,location.origin);
  if(url.origin!==location.origin)return;
  saveScroll();
  const dest=parseBrowserRoute({pathname:url.pathname,search:url.search,hash:''});
  const isPlace=dest.parts[0]==='province'&&dest.parts.length===3;
  const next={mvm:true,y:0,...(isPlace&&!viewer.open?{viewerFrom:location.pathname+location.search}:{})};
  history[replace?'replaceState':'pushState'](next,'',url.pathname+url.search);
  if(!replace)navCount+=1;
  if (replace) onRoute(false);
  else withPageTransition(() => onRoute(false), source);
}

// ── page transitions: a short dissolve; a card's photo grows into the next page's hero ──
const CARD_PHOTO = '.pcard, .photo-card, .home-city-card, .home-style-card, .trip-card, .discovery-tile, .month-card, .day-card, .about-shot, .atlas-card, .saved-item';
let transitionRunning = false;
function heroImageNow() {
  if (viewer.open && viewer.el) return $('.v-slide.is-active .v-media>img', viewer.el);
  return $('.p-hero>img, .pkg-hero img, #hero-img', main);
}
function withPageTransition(update, source = null) {
  const canAnimate = typeof document.startViewTransition === 'function' && !reduceMotion() && document.documentElement.dataset.input !== 'keyboard' && !transitionRunning && !document.hidden;
  if (!canAnimate) { update(); return; }
  let from = source?.closest?.(CARD_PHOTO)?.querySelector('img');
  const link=source?.closest?.('a[href]');
  if(from){
    const target=link?parseBrowserRoute(new URL(link.href,document.baseURI)).parts:[];
    let key='';
    if(target[0]==='province'){
      const pv=C.findProvince(target[1]),pl=pv?.places.find(place=>place.id===target[2]);
      key=pl?placePhotoKey(pv,pl):pv&&(provincePhotos[pv.id]||pv.photo||pv.image);
    }else if(target[0]==='package'){const pk=C.packages.find(item=>item.id===target[1]);key=pk?.photo||pk?.image;}
    if(!key||from.dataset.photo!==key)from=null;
  }
  if (from) from.style.viewTransitionName = 'vt-photo';
  transitionRunning = true;
  const transition = document.startViewTransition(async () => {
    if (from) from.style.viewTransitionName = '';
    document.documentElement.classList.add('vt-instant');
    update();
    const to = from && heroImageNow();
    if (to && to.dataset.photo===from.dataset.photo) {
      to.style.viewTransitionName = 'vt-photo';
      await Promise.race([to.decode?.().catch(() => {}), new Promise(resolve => setTimeout(resolve, 260))]);
    }
  });
  transition.finished.finally(() => {
    transitionRunning = false;
    document.documentElement.classList.remove('vt-instant');
    $$('[style*="view-transition-name"]').forEach(node => { node.style.viewTransitionName = ''; });
  });
}
function redirect(route) { navigate(route,true); }

function render({ force = false } = {}) {
  cityDeck?.close({immediate:true,restoreFocus:false});
  const { parts, query, lang } = parseRoute();
  if(lang)state.lang=lang;
  const head = parts[0] || '';
  if (head === 'destination') {
    redirect(`#/province/${C.legacyDestinations[parts[1]] || ''}`.replace(/\/$/, '') || '#/explore');
    return null;
  }
  if (head === 'experiences') {
    redirect('#/highlights');
    return null;
  }
  if (head === 'place') {
    // old place pages now open in the viewer of their province
    redirect(C.findPlace(`${parts[1]}/${parts[2]}`) ? `#/province/${parts[1]}/${parts[2]}` : '#/highlights');
    return null;
  }
  setMenu(false);
  document.documentElement.lang = languageInfo[state.lang].tag;
  const routeProvince = head === 'province' ? C.findProvince(parts[1]) : null;
  const placeIndex = routeProvince && parts[2] ? routeProvince.places.findIndex(pl => pl.id === parts[2]) : -1;
  if (routeProvince && parts[2] && placeIndex < 0) {
    redirect(`#/province/${routeProvince.id}`);
    return null;
  }
  // opening a place keeps the page underneath as it is (the viewer covers it)
  if (placeIndex >= 0 && main.dataset.view && !force) {
    openViewer(routeProvince, placeIndex);
    adaptLinks(); syncMetadata();
    return { overlay: true, head };
  }
  const viewKey = `${parts.join('/')}?${query}|${state.lang}`;
  if (!force && viewKey === main.dataset.view) {
    closeViewer({ fromRoute: true });
    if(head==='saved'&&main.dataset.savedDirty){renderSaved();keepThai(main);$('#saved-title')?.focus({preventScroll:true});}
    renderBar(head);
    $$('[data-context-planner]').forEach(link=>link.href=publicHref(contextHref(),state.lang));
    adaptLinks();
    document.title = main.dataset.title || document.title;
    return { reused: true, head };
  }
  heroExperience?.destroy();
  heroExperience = null;
  discoveryUI?.destroy();discoveryUI=null;
  planningUI?.destroy();planningUI=null;
  mapObserver?.disconnect();
  cancelAnimationFrame(searchFrame);composingSearch=false;
  siteInteractions?.beforeRoute();
  setHot(null);
  dismissedHotId = null;
  $('.skip-link').textContent = t('ข้ามไปยังเนื้อหา', 'Skip to content');
  main.classList.toggle('compact-content', ['explore','province','highlights','packages','package','saved'].includes(head));
  let section = 'none';
  let title = '';
  if (!head || head === 'destinations') { section = 'home'; renderHome(); }
  else if (head === 'explore') {
    const region = C.findRegion(parts[1]) ? parts[1] : 'all';
    section = 'explore';
    renderExplore(region);
    title = region === 'all' ? t('สำรวจลาว', 'Explore Laos') : `${L(C.findRegion(region).name)} · ${t('สำรวจลาว', 'Explore Laos')}`;
  } else if (head === 'province' && C.findProvince(parts[1])) {
    const pv = C.findProvince(parts[1]);
    section = 'explore';
    if (placeIndex >= 0) main.replaceChildren();
    else renderProvince(pv);
    title = placeIndex >= 0 ? `${L(pv.places[placeIndex].name)} · ${L(pv.name)}` : `${L(pv.name)} · ${t('สำรวจลาว', 'Explore Laos')}`;
  } else if (head === 'packages') { section = 'packages'; renderPackages(query); title = t('แพ็กเกจทัวร์', 'Tour packages'); }
  else if (head === 'package' && C.packages.some(pk => pk.id === parts[1])) {
    const pk = C.packages.find(item => item.id === parts[1]);
    section = 'packages';
    renderPackage(pk);
    title = L(pk.title);
  } else if (head === 'highlights') {
    const region = C.findRegion(parts[1]) ? parts[1] : 'all';
    section = 'highlights';
    renderHighlights(region);
    title = region === 'all' ? t('ที่เที่ยวยอดนิยม', 'Top places') : `${L(C.findRegion(region).name)} · ${t('ที่เที่ยวยอดนิยม', 'Top places')}`;
  } else if (head === 'credits') { renderCredits(); title = t('เครดิตภาพ', 'Photo credits'); }
  else if (head === 'about') { section = 'about'; renderAbout(); title = t('เกี่ยวกับเรา', 'About us'); }
  else if (head === 'saved') { section = 'saved'; renderSaved(); title = t('สถานที่ที่อยากไป', 'Saved places'); }
  else if (head === 'inquiry') { section = 'inquiry'; renderInquiry(); title = t('วางแผนเที่ยว', 'Plan a trip'); }
  else if (head === 'faq') { renderFaq(); title = t('คำถามที่พบบ่อย', 'FAQ'); }
  else { renderNotFound(); title = t('ไม่พบหน้า', 'Page not found'); }
  renderHeader(section);
  renderFooter();
  renderBar(section);
  renderChatFab(section);
  if(section==='inquiry')$('#contact').hidden=true;
  keepThai(main);
  keepThai(footerEl);
  $$('[data-atlas]', main).forEach(wrap => setAtlasRegion(wrap, wrap.dataset.region));
  adaptLinks();
  document.title = title ? `${title} | MVM Group` : t('MVM Group — ออกเดินทางไปหลงรักลาว', 'MVM Group — A journey to fall for Laos');
  main.dataset.view = viewKey;
  main.dataset.title = document.title;
  if (placeIndex >= 0) openViewer(routeProvince, placeIndex);
  else closeViewer({ fromRoute: true });
  discoveryUI=mountDiscovery(main,{lang:state.lang,saveButton});
  discoveryUI.hold(overlayHolds.size > 0);
  planningUI=mountPlanning(main,{onMove:reorderSaved});
  mountMaps();
  syncMetadata();
  siteInteractions?.refresh();
  return { section, head, overlay: placeIndex >= 0 };
}

let restoreY = null;
function onRoute(initial = false, force = false) {
  const info = render({ force });
  if (!info) return;
  const keep = state.keepScroll;
  state.keepScroll = false;
  if (info.reused || (info.overlay && !initial)) {
    restoreY = null; // the page underneath did not change, so it is still where the visitor left it
    return;
  }
  if (restoreY !== null) {
    const y = restoreY;
    restoreY = null;
    requestAnimationFrame(() => window.scrollTo(0, y));
  } else if (info.head === 'destinations') {
    requestAnimationFrame(() => $('#destinations')?.scrollIntoView({ block: 'start' }));
  } else if (!initial && !keep) {
    window.scrollTo(0, 0);
  }
  if (!initial && !info.overlay) main.focus({ preventScroll: true });
  siteInteractions?.routeChanged({ ...info, initial });
}

function syncMetadata() {
  const {parts}=parseRoute();
  const found=parts[0]==='province'&&parts[2]?C.findPlace(`${parts[1]}/${parts[2]}`):null;
  const pv=parts[0]==='province'?C.findProvince(parts[1]):null;
  const pk=parts[0]==='package'?C.packages.find(item=>item.id===parts[1]):null;
  const description=found?L(C.placeDetails[`${pv.id}/${found.place.id}`]?.about||found.place.text):pv?L(pv.intro):pk?L(pk.itineraryNote):t('สำรวจลาวครบ 18 แขวง เก็บสถานที่ที่ชอบ แล้ววางแผนการเดินทางกับ MVM Group','Explore all 18 provinces of Laos, save your favourite places and plan your trip with MVM Group.');
  const base=new URL(document.querySelector('link[rel="canonical"]')?.href||location.origin).origin+'/';
  const path=publicHref({parts,query:new URLSearchParams()},state.lang);
  const url=new URL(path,base).href;
  const set=(selector,content)=>{const node=document.querySelector(selector);if(node)node.content=content;};
  set('meta[name="description"]',description);set('meta[property="og:title"]',document.title);set('meta[property="og:description"]',description);set('meta[property="og:url"]',url);set('meta[property="og:locale"]',languageInfo[state.lang].og);
  const key=found?placePhotoKey(pv,found.place):pv?(provincePhotos[pv.id]||pv.image||pv.photo):(pk?.photo||pk?.image||(!parts.length?C.slides[0].photo:''));
  const pictureUrl=key?(localPhotos[key]?.src||PHOTOS[key]?.src||(C.images[key]?`assets/images/${key}-1600.webp`:'')):'';
  set('meta[property="og:image"]',new URL(pictureUrl||'assets/images/og-image.jpg',base).href);
  set('meta[property="og:image:alt"]',`${PHOTOS[key]?.kind==='generated'?t('ภาพประกอบ AI อ้างอิงสถานที่จริง · ','AI illustration based on the real location · '):''}${found?L(found.place.name):pv?L(pv.name):document.title}`);
  const canonical=document.querySelector('link[rel="canonical"]');if(canonical)canonical.href=url;
  $$('link[rel="alternate"][hreflang]').forEach(link=>{const lang=languages.find(code=>languageInfo[code].tag===link.hreflang)||'th';link.href=new URL(publicHref({parts,query:new URLSearchParams()},lang),base).href;});
  $$('meta[property="og:locale:alternate"]').forEach((node,index)=>{node.content=languages.filter(lang=>lang!==state.lang).map(lang=>languageInfo[lang].og)[index];});
  const robots=document.querySelector('meta[name="robots"]');if(robots)robots.content=(['saved','inquiry'].includes(parts[0])||!resolveRoute(parseRoute()).exists)?'noindex,follow':'index,follow';
}

function saveScroll() {
  // The scenic dialog fixes the body; its negative top retains the real page offset.
  const y = document.documentElement.classList.contains('city-deck-open')
    ? Math.max(0, -parseFloat(document.body.style.top) || 0)
    : window.scrollY;
  try { history.replaceState({ ...(history.state || {}), y }, ''); } catch {}
}

// ── interactions ────────────────────────────────────────────
function setSlide(index) {
  if (heroExperience) heroExperience.goTo(index);
  else state.slide = C.wrapSlide(index, C.slides.length);
}

function mountHeroExperience() {
  heroExperience?.destroy();
  heroExperience = createHeroExperience($('#home-hero'), {
    initialIndex: state.slide,
    slides: C.slides.map(slide => {
      const photo = PHOTOS[slide.photo], cached = localPhotos[slide.photo];
      return {
        name: L(slide.name), alt: L(slide.alt), photo: slide.photo || '', focus: HERO_FOCUS[slide.photo] || '60% 50%',
        src: cached?.src || photo?.src || `assets/images/${slide.image}-1600.webp`,
        srcset: cached?.srcset || (photo ? '' : `assets/images/${slide.image}-800.webp 800w, assets/images/${slide.image}-1600.webp 1600w`),
        href: publicHref(heroSlideHref(slide), state.lang),
        creditHref: slide.photo ? publicHref(`#/credits?image=${slide.photo}`, state.lang) : '',
        creditLabel: photo ? `${t('เครดิตภาพ', 'Photo credits')}: ${photo.author} · ${photo.license}` : '',
        linkLabel: t(`สำรวจ${L(slide.name)}`, `Explore ${L(slide.name)}`, "Explore {0}", [L(slide.name)]),
      };
    }),
    onChange: index => { state.slide = index; },
    labels: {
      play: t('เล่นภาพอัตโนมัติ', 'Play slideshow'),
      pause: t('หยุดภาพอัตโนมัติ', 'Pause slideshow'),
      playAction: t('เล่นภาพสถานที่อัตโนมัติ', 'Play destination slideshow'),
      pauseAction: t('หยุดเล่นภาพสถานที่อัตโนมัติ', 'Pause destination slideshow'),
      manual: t('เลือกชมได้ตามจังหวะของคุณ', 'Explore at your own pace'),
      playing: t('เปลี่ยนภาพทุก 8 วินาที', 'A new destination every 8 seconds'),
      held: t('พักภาพอัตโนมัติระหว่างที่คุณสำรวจ', 'Autoplay pauses while you explore'),
      loading: name => t(`กำลังโหลดภาพ${name}…`, `Loading ${name}…`, "Loading {0}…", [name]),
      failed: name => t(`โหลดภาพ${name}ไม่สำเร็จ ลองเลือกอีกครั้ง`, `Couldn’t load ${name}. Select it to try again.`, "Couldn’t load {0}. Select it to try again.", [name]),
    },
  });
}

let toastTimer;
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 4500);
}

async function copyLink() {
  try { await navigator.clipboard.writeText(location.href); toast(t('คัดลอกลิงก์แล้ว', 'Link copied')); }
  catch { toast(t('คัดลอก URL จากแถบที่อยู่ของเบราว์เซอร์เพื่อแชร์หน้านี้', 'Copy the URL from your browser’s address bar to share this page.')); }
}

function setMenu(open, focusButton = false) {
  state.menuOpen = open;
  document.documentElement.classList.toggle('menu-open', open);
  const btn = $('.menu-btn');
  const nav = $('#mobile-nav');
  if (!btn || !nav) return;
  const restoreFocus = !open && nav.contains(document.activeElement);
  btn.setAttribute('aria-expanded', String(open));
  btn.setAttribute('aria-label', open ? t('ปิดเมนู', 'Close menu') : t('เปิดเมนู', 'Open menu'));
  btn.innerHTML = icon(open ? 'close' : 'menu');
  if (siteInteractions) siteInteractions.menu(nav, open);
  else nav.hidden = !open;
  if (focusButton || restoreFocus) btn.focus({ preventScroll: true });
}

function scrollToContact() { setMenu(false); navigate(contextHref()); }

// highlight a province on the map and in the list together
let hotId = null;
let dismissedHotId = null;
let hotTimer;
function setHot(id) {
  clearTimeout(hotTimer);
  if (id && dismissedHotId === id) return;
  if (hotId === id) return;
  dismissedHotId = null;
  if (hotId) $$(`[data-province="${hotId}"], [data-province-card="${hotId}"]`).forEach(el => el.classList.remove('is-hot'));
  hotId = id;
  if (!id) return;
  $$(`[data-province="${id}"], [data-province-card="${id}"]`).forEach(el => el.classList.add('is-hot'));
  const pv = C.findProvince(id);
  $$('.map-preview').forEach(preview => { preview.innerHTML = mapPreview(pv); });
}

document.addEventListener('click', async event => {
  const el = event.target.closest('a, button');
  if (!event.target.closest('[data-language-picker]')) setLanguagePicker(false);
  if (state.menuOpen && !event.target.closest('#site-header')) setMenu(false);
  if (!el) return;
  if(el.matches('a.home-city-card[data-home-destination]')&&!event.defaultPrevented&&event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){
    event.preventDefault();openCity(el.dataset.homeDestination,el);return;
  }
  if(el.matches('[data-atlas-region]')){
    const section=el.closest('.home-atlas'),region=el.dataset.atlasRegion;
    section.querySelectorAll('[data-atlas-region]').forEach(button=>button.setAttribute('aria-pressed',String(button===el)));
    setAtlasRegion($('[data-atlas]',section),region);
    dismissedHotId=null;
    setHot(featuredProvince(region)?.id);
    return;
  }
  if (el.matches('.skip-link')) {
    event.preventDefault();
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: 'start' });
    return;
  }
  // SVG links (the map) expose href/target as animated objects, so read the attributes directly.
  const href = el.matches('a[href]') ? el.getAttribute('href') : null;
  const routeLink = href ? new URL(href, document.baseURI) : null;
  if (routeLink && !event.defaultPrevented && routeLink.origin===location.origin && /^\/(th|lo|en|zh)(\/|$)/.test(routeLink.pathname) && !el.hasAttribute('download') && !el.getAttribute('target')) {
    if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    event.preventDefault();
    if (el.closest('.explore-tabs')) state.keepScroll = true;
    navigate(routeLink.pathname+routeLink.search, false, { source: el });
    return;
  }
  if(el.dataset.save){event.preventDefault();savePlace(el.dataset.save, el);return;}
  if(el.matches('[data-inquiry-month],[data-inquiry-interest]')){pressInquiryChoice(el);return;}
  if(el.dataset.inquiry){navigate(inquiryHref(el.dataset.inquiry,el.dataset.ref||''));return;}
  if(el.hasAttribute('data-clear-search')){$('#destination-search').value='';$('#interest-filter').value='all';updateExploreResults();$('#destination-search').focus();return;}
  if(el.hasAttribute('data-copy-inquiry')){
    const text=$('#inquiry-message').value;
    try{await navigator.clipboard.writeText(text);toast(t('คัดลอกรายละเอียดการเดินทางแล้ว ยังไม่ได้ส่งให้บริษัท','Trip details copied. Nothing has been sent yet.'));}
    catch{$('#inquiry-message').focus();$('#inquiry-message').select();toast(t('เลือกข้อความไว้แล้ว ใช้คำสั่งคัดลอกของอุปกรณ์ได้เลย','Text selected. Use your device’s copy command.'));}
    return;
  }
  if(el.hasAttribute('data-download-inquiry')){
    const blob=new Blob(['\uFEFF'+$('#inquiry-message').value],{type:'text/plain;charset=utf-8'}), url=URL.createObjectURL(blob), link=document.createElement('a');
    link.href=url;link.download='MVM-Group-trip-inquiry.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;
  }
  if (el.dataset.viewer === 'close') { closeViewer(); return; }
  if (el.dataset.viewer === 'prev') { goToSlide(viewer.index - 1); return; }
  if (el.dataset.viewer === 'next') { goToSlide(viewer.index + 1); return; }
  if (el.dataset.viewerGo) { goToSlide(Number(el.dataset.viewerGo)); return; }
  if (el.dataset.rail) {
    const sec = el.closest('.places-sec');
    const rail = sec && $('[data-rail-track]', sec);
    if (!rail) return;
    const card = $('.pcard', rail);
    const step = card ? card.offsetWidth + parseFloat(getComputedStyle(rail).columnGap || 18) : rail.clientWidth * 0.8;
    const count = Math.max(1, Math.floor(rail.clientWidth / step));
    rail.scrollBy({ left: (el.dataset.rail === 'next' ? 1 : -1) * step * count, behavior: reduceMotion() ? 'auto' : 'smooth' });
    return;
  }
  if (el.matches('[data-language-toggle]')) {
    const open = el.getAttribute('aria-expanded') !== 'true';
    setMenu(false);
    setLanguagePicker(open, { focusOption: event.detail === 0 });
    return;
  }
  if (el.matches('.menu-btn')) { setLanguagePicker(false); setMenu(!state.menuOpen); return; }
  if (el.dataset.lang) {
    setLanguage(el.dataset.lang);
    return;
  }
  if (el.dataset.slide) { setSlide(Number(el.dataset.slide)); return; }
  if (el.dataset.scroll === 'contact') { scrollToContact(); return; }
  if (el.dataset.missing) { toast(t('ช่องทางนี้ยังไม่ได้ตั้งค่า กรุณาติดต่อผ่านช่องทางอื่น', 'This contact channel is not set up yet.')); return; }
  if (el.dataset.pkgRegion) { state.pkgRegion = el.dataset.pkgRegion; updatePackages(); return; }
  if (el.hasAttribute('data-share')) {
    if (navigator.share) {
      try { await navigator.share({ title: document.title, url: location.href }); }
      catch (error) { if (error.name !== 'AbortError') await copyLink(); }
    } else await copyLink();
  }
});

document.addEventListener('change', event => {
  if (event.target.id === 'pkg-sort') { state.sort = event.target.value; updatePackages(); }
  if (event.target.id === 'pkg-days') { state.pkgDays = event.target.value; updatePackages(); }
  if (event.target.id === 'interest-filter') updateExploreResults();
});

// keyboard focus wraps around inside the open viewer (slides that are not showing are inert)
const viewerTabbables = () => $$('a[href], button:not([disabled]), summary', viewer.el).filter(el => !el.closest('[inert]') && el.getClientRects().length && (!el.closest('details:not([open])') || el.matches('details:not([open]) > summary')));
document.addEventListener('keydown', event => {
  const picker = event.target.closest?.('[data-language-picker]');
  if (picker) {
    const trigger = $('[data-language-toggle]', picker);
    const open = trigger.getAttribute('aria-expanded') === 'true';
    if (event.key === 'Escape' && open) { event.preventDefault(); setLanguagePicker(false, { returnFocus: true }); return; }
    if (event.target === trigger && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault(); setMenu(false); setLanguagePicker(true, { focusOption: true });
      if (event.key === 'ArrowUp') $$('[data-language-option]', picker).at(-1)?.focus();
      return;
    }
    const options = $$('[data-language-option]', picker);
    const index = options.indexOf(event.target);
    if (open && index >= 0 && ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
      options[next].focus(); return;
    }
  }
  if (event.key === 'Escape' && hotId) {
    const preview = document.activeElement?.closest?.('.map-preview');
    if (preview) $(`[data-province="${hotId}"]`, preview.closest('.map-wrap'))?.focus({ preventScroll: true });
    dismissedHotId = hotId;
    $$('.map-preview').forEach(panel => { panel.innerHTML = mapPrompt(); });
  }
  if (viewer.open) {
    if (event.key === 'Tab') {
      const items = viewerTabbables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === viewer.el || !viewer.el.contains(active))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (active === last || !viewer.el.contains(active))) { event.preventDefault(); first.focus(); }
      return;
    }
    if (event.key === 'Escape') { event.preventDefault(); closeViewer(); }
    else if (event.key === 'ArrowRight' && !event.altKey && !event.metaKey) { event.preventDefault(); goToSlide(viewer.index + 1); }
    else if (event.key === 'ArrowLeft' && !event.altKey && !event.metaKey) { event.preventDefault(); goToSlide(viewer.index - 1); }
    return;
  }
  if (event.key === 'Escape' && state.menuOpen) setMenu(false, true);
});

document.addEventListener('toggle', event => {
  if (event.target.matches?.('.place-more')) updateMore(event.target.closest('.v-info'));
}, true);

// horizontal scrollers: the place rail and the viewer track
document.addEventListener('scroll', event => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (target.matches('.place-rail')) { updateRail(target); return; }
  if (target.matches('.v-info')) { updateMore(target); return; }
  if (target.matches('.v-track') && viewer.open) {
    cancelAnimationFrame(viewerRaf);
    viewerRaf = requestAnimationFrame(() => {
      if (!viewer.open || target !== $('.v-track', viewer.el)) return;
      const i = Math.round(target.scrollLeft / Math.max(1, target.clientWidth));
      if (viewer.target !== null) {
        if (i !== viewer.target) return;
        viewer.target = null;
      }
      setViewerIndex(i);
    });
  }
}, true);
window.addEventListener('resize', () => {
  if (state.menuOpen && matchMedia('(min-width:981px)').matches) setMenu(false);
  if (viewer.open) {
    const track = $('.v-track', viewer.el);
    if (track) track.scrollLeft = viewer.index * track.clientWidth;
    updateMore($('.v-slide.is-active .v-info', viewer.el));
  }
  $$('[data-rail-track]').forEach(updateRail);
});

const provinceFrom = node => node?.closest?.('[data-province], [data-province-card]');
document.addEventListener('mouseover', event => {
  clearTimeout(hotTimer);
  if(event.target.closest?.('.map-preview'))return;
  const node = provinceFrom(event.target);
  if(node)setHot(node.dataset.province||node.dataset.provinceCard);
  else hotTimer=setTimeout(()=>setHot(null),180);
  const regionLink = event.target.closest?.('[data-hot-region]');
  $$('.teaser .laos-map').forEach(svg => { if (regionLink) svg.dataset.hotRegion = regionLink.dataset.hotRegion; else delete svg.dataset.hotRegion; });
});
document.addEventListener('pointerover', event => prefetchTranslations(event.target), { passive: true });
document.addEventListener('focusin', event => {
  prefetchTranslations(event.target);
  if (!event.target.closest?.('[data-language-picker]')) setLanguagePicker(false);
  if(event.target.closest?.('.map-preview'))return;
  const node = provinceFrom(event.target);
  setHot(node ? node.dataset.province || node.dataset.provinceCard : null);
});

let scrollTimer;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(saveScroll, 200);
}, { passive: true });
window.addEventListener('popstate', event => {
  restoreY = event.state && typeof event.state.y === 'number' ? event.state.y : null;
  onRoute();
});
window.addEventListener('hashchange', () => {
  if(location.hash.startsWith('#/')){history.replaceState(history.state,'',publicHref(parseBrowserRoute(location),state.lang));onRoute();}
});
let searchFrame = 0, composingSearch = false;
function queueExploreResults() {
  cancelAnimationFrame(searchFrame);
  searchFrame = requestAnimationFrame(() => { searchFrame = 0; updateExploreResults(); });
}
document.addEventListener('compositionstart',event=>{if(event.target.id==='destination-search'){composingSearch=true;cancelAnimationFrame(searchFrame);}});
document.addEventListener('compositionend',event=>{if(event.target.id==='destination-search'){composingSearch=false;queueExploreResults();}});
document.addEventListener('input',event=>{
  if(event.target.id==='destination-search'&&!event.isComposing&&!composingSearch)queueExploreResults();
  if(event.target.matches('#inquiry-form [name="date"]')&&event.target.value){const month=event.target.value.slice(0,7);$$('#inquiry-form [data-inquiry-month]').forEach(chip=>chip.setAttribute('aria-pressed',String(chip.dataset.inquiryMonth===month)));}
  if(event.target.closest('#inquiry-form')){readInquiryDraft();inquiryReady=false;const result=$('#inquiry-result');if(result)result.hidden=true;}
});
document.addEventListener('submit',event=>{
  if(event.target.id==='explore-search'){
    cancelAnimationFrame(searchFrame);composingSearch=false;
    event.preventDefault();updateExploreResults();
    const heading=$('#search-result-section')?.hidden ? $('#province-browser') : $('#search-results-title');
    if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});heading.scrollIntoView({block:'start',behavior:reduceMotion()||document.documentElement.dataset.input==='keyboard'?'auto':'smooth'});}
  }
  if(event.target.id==='inquiry-form'){event.preventDefault();if(!event.target.reportValidity())return;readInquiryDraft();inquiryReady=true;updateInquiryPreview();}
});
document.addEventListener('error', event=>{
  const img=event.target;if(!(img instanceof HTMLImageElement)||img.dataset.failed||img.matches('.hero .hero-img'))return;
  img.dataset.failed='true';const fallback=document.createElement('div');fallback.className=`${img.className} image-unavailable`;fallback.setAttribute('role','img');fallback.setAttribute('aria-label',img.alt||t('ไม่สามารถโหลดภาพได้','Image unavailable'));
  fallback.innerHTML=`${icon('camera')}<span>${t('ไม่สามารถโหลดภาพนี้ได้','This image is unavailable')}</span>`;img.replaceWith(fallback);
},true);
// ── photos that arrive after the page sharpen into view; cached ones simply appear ──
const lazyPhotos = node => [...(node.matches?.('img[data-photo][loading="lazy"]') ? [node] : []), ...(node.querySelectorAll?.('img[data-photo][loading="lazy"]') || [])];
new MutationObserver(records => {
  for (const record of records) for (const node of record.addedNodes) if (node.nodeType === 1) for (const img of lazyPhotos(node)) if (img.complete) img.classList.add('photo-ready');
}).observe(document.body, { childList: true, subtree: true });
document.addEventListener('load', event => {
  const img = event.target;
  if (!(img instanceof HTMLImageElement) || !img.matches('[data-photo][loading="lazy"]') || img.classList.contains('photo-ready')) return;
  img.classList.add('photo-ready');
  if (!reduceMotion()) img.classList.add('photo-fresh');
}, true);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const initialRoute=parseBrowserRoute(location);
history.replaceState({...history.state,mvm:true},'',publicHref(initialRoute,routeLanguage||state.lang));
// Lao and Chinese pages load their reviewed translations first; Thai and English start at once.
async function boot() {
  try { await ensureTranslations(state.lang); }
  catch { state.lang = 'en'; history.replaceState(history.state, '', localeHref(location, 'en')); }
  siteInteractions = createSiteInteractions({ main, header: headerEl, language: () => state.lang, dismissMenu: () => setMenu(false) });
  onRoute(true);
  window.__mvmReady = true;
  clearTimeout(window.__mvmBootTimer);
  document.documentElement.classList.add('js', 'app-ready');
}
boot();
