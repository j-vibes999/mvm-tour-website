import * as C from './content.js';
import {createKit,icon,esc,placePhotoKey} from './ui-kit.js';
import {publicHref} from './routes.js';
import {languageInfo} from './i18n.js';
import {travelText as text} from './travel-copy.js';

// Only explicit month ranges already stated in placeDetails.best. Missing data is unknown.
export const recommendedMonths={
  'luang-prabang/nong-khiaw':[11,12,1,2],
  'luang-prabang/muang-ngoi':[10,11,12,1,2,3,4],
  'xiengkhouang/plain-of-jars':[11,12,1,2,3,4],
  'bokeo/slow-boat':[11,12,1,2,3,4],
  'vientiane-province/vang-vieng':[11,12,1,2],
  'vientiane-province/balloon':[11,12,1,2,3],
  'vientiane-province/nam-song':[11,12,1,2,3,4],
  'khammouane/kong-lor':[11,12,1,2,3,4],
  'champasak/si-phan-don':[11,12,1,2],
  'champasak/khone-phapheng':[8,9,10],
  'champasak/tad-fane':[9,10,11,12],
  'champasak/paksong-coffee':[11,12,1,2],
};
export const dayStoryStops=[
  {ref:'luang-prabang/alms-giving',period:'dawn'},
  {ref:'luang-prabang/kuang-si',period:'morning'},
  {ref:'luang-prabang/wat-xieng-thong',period:'afternoon'},
  {ref:'luang-prabang/phousi',period:'evening'},
  {ref:'luang-prabang/night-market',period:'night'},
];
export function placesForMonth(month) {
  return Object.entries(recommendedMonths).filter(([,months])=>months.includes(Number(month))).map(([ref,months])=>({ref,months,...C.findPlace(ref)}));
}
function photoFor(kit,province,place,options={}){
  return kit.media(placePhotoKey(province,place),options);
}

function monthCards(lang,month) {
  const kit=createKit(()=>lang),{L}=kit,items=placesForMonth(month);
  const status=`<p class="season-status" role="status" aria-live="polite">${esc(text(lang,'monthResults',{count:items.length}))}</p>`;
  if(!items.length)return `${status}<div class="season-empty"><h3>${esc(text(lang,'monthEmptyTitle'))}</h3><p>${esc(text(lang,'monthEmptyText'))}</p><a class="link-arrow" href="${publicHref('#/explore',lang)}">${esc(text(lang,'browseAll'))}${icon('arrow')}</a></div>`;
  return `${status}<div class="season-grid">${items.map(({ref,province,place})=>`<a class="season-card" href="${publicHref(`#/province/${ref}`,lang)}"><div class="season-photo">${photoFor(kit,province,place,{alt:L(place.name),sizes:'(max-width:480px) 72px, 88px'})}</div><div><span class="meta">${esc(L(province.name))}</span><h3>${esc(L(place.name))}</h3><p>${esc(L(C.placeDetails[ref].best))}</p></div>${icon('arrow')}</a>`).join('')}</div>`;
}
export function monthChooserHtml(lang,month=new Date().getMonth()+1) {
  const formatter=new Intl.DateTimeFormat(languageInfo[lang].tag,{month:'short',timeZone:'UTC'});
  return `<section class="container season-section" data-month-chooser aria-labelledby="season-title"><div class="section-head"><div><h2 class="h-section" id="season-title">${esc(text(lang,'monthsTitle'))}</h2><p class="lead">${esc(text(lang,'monthsIntro'))}</p></div></div><div class="month-options" role="group" aria-label="${esc(text(lang,'monthsTitle'))}">${Array.from({length:12},(_,i)=>`<button type="button" data-month="${i+1}" aria-pressed="${month===i+1}">${esc(formatter.format(new Date(Date.UTC(2020,i,1))))}</button>`).join('')}</div><div data-month-results>${monthCards(lang,month)}</div><p class="travel-note">${esc(text(lang,'monthsNote'))}</p></section>`;
}

function storyFrame(lang,index,saveButton) {
  const kit=createKit(()=>lang),{L}=kit,item=dayStoryStops[index],{province,place}=C.findPlace(item.ref),detail=C.placeDetails[item.ref];
  const actions=`<a class="link-arrow" href="${publicHref(`#/province/${item.ref}`,lang)}">${esc(text(lang,'explorePlace'))}${icon('arrow')}</a>${typeof saveButton==='function'?saveButton(item.ref):''}`;
  return `<a class="day-story-photo" href="${publicHref(`#/province/${item.ref}`,lang)}">${photoFor(kit,province,place,{alt:L(place.name),sizes:'(max-width:768px) 100vw, 56vw'})}</a><div class="day-story-copy"><p class="eyebrow">${esc(text(lang,item.period))}</p><h3>${esc(L(place.name))}</h3><p>${esc(L(place.text))}</p><p class="day-best">${icon('sun')}${esc(L(detail.best))}</p><div class="day-story-actions">${actions}</div></div>`;
}
export function dayStoryHtml(lang,{saveButton}={}) {
  return `<section class="section container day-story" data-day-story aria-labelledby="day-story-title"><div class="section-head"><div><h2 class="h-section" id="day-story-title">${esc(text(lang,'dayTitle'))}</h2><p class="lead">${esc(text(lang,'dayIntro'))}</p></div><button type="button" class="round-btn day-play" data-day-play aria-pressed="false" aria-label="${esc(text(lang,'playDay'))}">${icon('play')}</button></div><div class="day-story-frame" data-day-frame>${storyFrame(lang,0,saveButton)}</div><div class="day-periods" role="group" aria-label="${esc(text(lang,'dayTitle'))}">${dayStoryStops.map((item,i)=>`<button type="button" data-day-period="${i}" aria-pressed="${i===0}"><span aria-hidden="true">0${i+1}</span>${esc(text(lang,item.period))}</button>`).join('')}</div><div class="day-story-footer"><p class="travel-note">${esc(text(lang,'dayNote'))}</p><a class="link-arrow" href="${publicHref('#/package/luang-prabang-discovery',lang)}">${esc(text(lang,'dayTrip'))}${icon('arrow')}</a></div></section>`;
}

export function mountDiscovery(root,{lang,saveButton}={}) {
  const abort=new AbortController(),signal=abort.signal,section=root.querySelector('[data-day-story]');
  let index=0,enabled=false,visible=true,timer=0,covered=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const sync=()=>{
    clearTimeout(timer);
    if(!section)return;
    const button=section.querySelector('[data-day-play]');
    button.disabled=reduced.matches;button.hidden=reduced.matches;
    button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',text(lang,enabled?'pauseDay':'playDay'));button.innerHTML=icon(enabled?'pause':'play');
    section.querySelector('[data-day-frame]').setAttribute('aria-live',enabled?'off':'polite');
    if(enabled&&visible&&!covered&&!document.hidden&&!reduced.matches)timer=setTimeout(()=>{if(index===dayStoryStops.length-1){enabled=false;sync();}else select(index+1);},6500);
  };
  const select=i=>{
    if(!section)return;index=Math.max(0,Math.min(dayStoryStops.length-1,i));
    section.querySelector('[data-day-frame]').innerHTML=storyFrame(lang,index,saveButton);
    section.dataset.period=dayStoryStops[index].period;
    section.querySelectorAll('[data-day-period]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.dayPeriod)===index)));
    sync();
  };
  root.addEventListener('click',event=>{
    const month=event.target.closest('[data-month]');
    if(month){const chooser=month.closest('[data-month-chooser]');chooser.querySelectorAll('[data-month]').forEach(button=>button.setAttribute('aria-pressed',String(button===month)));chooser.querySelector('[data-month-results]').innerHTML=monthCards(lang,Number(month.dataset.month));}
    const period=event.target.closest('[data-day-period]');if(period){enabled=false;select(Number(period.dataset.dayPeriod));}
    if(event.target.closest('[data-day-play]')){enabled=!enabled;if(enabled&&index===dayStoryStops.length-1)select(0);else sync();}
  },{signal});
  document.addEventListener('visibilitychange',sync,{signal});
  reduced.addEventListener('change',()=>{if(reduced.matches)enabled=false;sync();},{signal});
  const observer=section&&'IntersectionObserver'in window?new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.15}):null;
  if(section){observer?.observe(section);sync();}
  return {hold(value){covered=value;sync();},destroy(){abort.abort();clearTimeout(timer);observer?.disconnect();}};
}
