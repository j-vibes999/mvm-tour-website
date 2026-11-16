import * as C from './content.js';
import {createKit,icon,esc,placePhotoKey} from './ui-kit.js';
import {provincePhotos} from './complete-media.js';
import {publicHref} from './routes.js';
import {routeMapHref} from './trip-tools.js';
import {mapRouteBatches} from './travel-planning.js';
import {travelText as text} from './travel-copy.js';

export function programOverview(pk,lang) {
  const {L}=createKit(()=>lang);
  return `<div class="program-overview"><h2>${esc(text(lang,'routeTitle'))}</h2><ol>${pk.itinerary.map(day=>`<li><button type="button" data-day-open="${day.day}"><span>${esc(text(lang,'dayNumber',{day:day.day}))}</span><strong>${esc(L(day.title))}</strong>${icon('arrow')}</button></li>`).join('')}</ol><p class="travel-note">${esc(text(lang,'routeNote'))}</p></div>`;
}

export function dayPhoto(day,lang) {
  const {L,media}=createKit(()=>lang),found=day.stops.map(C.findPlace).find(Boolean);
  return found?`<div class="day-photo">${media(placePhotoKey(found.province,found.place),{alt:L(found.place.name),sizes:'(max-width:899px) 100vw, 680px'})}</div>`:'';
}

export function savedPlanningHtml(refs,lang,saveButton) {
  const {L,media}=createKit(()=>lang),selected=new Set(refs.map(ref=>ref.split('/')[0]));
  const batches=mapRouteBatches(refs);
  return `<div class="saved-planning"><section aria-labelledby="saved-order-title"><h2 id="saved-order-title">${esc(text(lang,'savedOrderTitle'))}</h2><p class="travel-note">${esc(text(lang,'savedOrderHelp'))}</p><ol class="saved-list">${refs.map((ref,index)=>{
    const {province,place}=C.findPlace(ref),name=L(place.name),href=publicHref(`#/province/${ref}`,lang);
    return `<li class="discovery-tile saved-row" data-saved-ref="${ref}"><span class="saved-order-number" aria-hidden="true">${index+1}</span><a class="saved-place-photo" href="${href}" tabindex="-1" aria-hidden="true">${media(placePhotoKey(province,place),{sizes:'140px'})}</a><div class="saved-place-copy"><span class="meta">${esc(L(province.name))}</span><h3><a href="${href}">${esc(name)}</a></h3><p class="saved-place-facts">${esc([L(C.placeTypes[place.type]),L(C.placeDetails[ref]?.time)].filter(Boolean).join(' · '))}</p>${saveButton(ref)}</div><div class="saved-order-controls"><button type="button" class="round-btn" data-move-saved="${ref}" data-direction="-1" aria-label="${esc(text(lang,'moveEarlier',{name}))}"${index===0?' disabled':''}>${icon('chevron')}</button><button type="button" class="round-btn" data-move-saved="${ref}" data-direction="1" aria-label="${esc(text(lang,'moveLater',{name}))}"${index===refs.length-1?' disabled':''}>${icon('chevron')}</button><span class="saved-drag" draggable="true" data-saved-drag="${ref}" aria-hidden="true">⠿</span></div></li>`;
  }).join('')}</ol><p class="sr-only" role="status" data-saved-order-status></p></section><section class="saved-plan-map" aria-labelledby="saved-map-title"><h2 id="saved-map-title">${esc(text(lang,'savedMapTitle'))}</h2><p class="travel-note" id="saved-map-note">${esc(text(lang,'savedMapNote'))}</p><svg viewBox="0 0 520 640" role="img" aria-labelledby="saved-map-title saved-map-note">${C.provinces.map(pv=>`<use href="/assets/maps/provinces.svg#province-${pv.id}" fill="${selected.has(pv.id)?'var(--green, #1c4a3e)':'#e2e5dc'}" stroke="#faf8f1" stroke-width="2"><title>${esc(L(pv.name))}</title></use>`).join('')}</svg><div class="saved-map-links"><h3>${esc(text(lang,'mapsForList'))}</h3>${batches.map((batch,i)=>`<a class="link-arrow" href="${esc(routeMapHref(batch))}" target="_blank" rel="noopener noreferrer">${icon('map')}${esc(batches.length>1?text(lang,'mapPart',{part:i+1}):text(lang,'viewMap'))}${icon('arrow')}</a>`).join('')}</div></section></div>`;
}

// Sample itineraries whose stops include places on the saved list, best match first.
export function savedTripMatches(refs) {
  return C.packages.map((pk,order)=>{
    const stops=new Set([...(pk.routeStops||[]),...pk.itinerary.flatMap(day=>day.stops||[])]);
    return {pk,order,matched:refs.filter(ref=>stops.has(ref))};
  }).filter(item=>item.matched.length).sort((a,b)=>b.matched.length-a.matched.length||a.order-b.order);
}

export function savedTripsHtml(refs,lang) {
  const matches=savedTripMatches(refs).slice(0,3);
  if(!matches.length)return '';
  const {L,media,durationText}=createKit(()=>lang),separator=lang==='zh'?'、':', ';
  return `<section class="saved-trips" aria-labelledby="saved-trips-title"><h2 id="saved-trips-title">${esc(text(lang,'savedTripsTitle'))}</h2><p class="travel-note">${esc(text(lang,'savedTripsIntro'))}</p><ul class="saved-trip-list">${matches.map(({pk,matched})=>{
    const names=matched.map(ref=>L(C.findPlace(ref).place.name)).join(separator);
    return `<li><a class="saved-trip" href="${publicHref(`#/package/${pk.id}`,lang)}" data-saved-trip="${pk.id}"><span class="saved-trip-photo">${media(pk.photo||pk.image,{alt:'',sizes:'(max-width:640px) 96px, 120px'})}</span><span class="saved-trip-copy"><b>${esc(L(pk.destination||pk.title))}</b><span class="saved-trip-meta">${icon('calendar')}${esc(durationText(pk))}</span><span class="saved-trip-match">${icon('heart')}<span>${esc(text(lang,'savedTripsMatch',{count:matched.length,names}))}</span></span></span>${icon('arrow')}</a></li>`;
  }).join('')}</ul></section>`;
}

export function inquiryPhoto(context,lang) {
  const {L,media}=createKit(()=>lang);let key='',name='';
  if(context.kind==='package'){key=context.item.photo||context.item.image;name=L(context.item.title);}
  if(context.kind==='province'){key=provincePhotos[context.item.id]||context.item.photo;name=L(context.item.name);}
  if(context.kind==='place'){key=placePhotoKey(context.item.province,context.item.place);name=L(context.item.place.name);}
  if(context.kind==='saved'&&context.refs.length){const found=C.findPlace(context.refs[0]);key=placePhotoKey(found.province,found.place);name=L(found.place.name);}
  return key?`<div class="inquiry-photo-summary">${media(key,{alt:name,sizes:'180px'})}<p>${icon('pin')}${esc(name)}</p></div>`:'';
}

export function mountPlanning(root,{onMove}={}) {
  const abort=new AbortController();let dragged=null;
  root.addEventListener('click',event=>{
    const day=event.target.closest('[data-day-open]');
    if(day){const details=root.querySelector(`#program-day-${day.dataset.dayOpen} details`);if(details){details.open=true;details.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});details.querySelector('summary').focus({preventScroll:true});}}
    const move=event.target.closest('[data-move-saved]');
    if(move){const rows=[...root.querySelectorAll('[data-saved-ref]')],index=rows.indexOf(move.closest('[data-saved-ref]'));onMove?.(move.dataset.moveSaved,index+Number(move.dataset.direction),Number(move.dataset.direction));}
  },{signal:abort.signal});
  root.addEventListener('dragstart',event=>{const handle=event.target.closest('[data-saved-drag]');if(!handle)return;dragged=handle.dataset.savedDrag;event.dataTransfer.setData('text/plain',dragged);event.dataTransfer.effectAllowed='move';handle.closest('[data-saved-ref]').classList.add('is-dragging');},{signal:abort.signal});
  root.addEventListener('dragover',event=>{if(dragged&&event.target.closest('[data-saved-ref]')){event.preventDefault();event.dataTransfer.dropEffect='move';}},{signal:abort.signal});
  root.addEventListener('drop',event=>{const row=event.target.closest('[data-saved-ref]');if(!dragged||!row)return;event.preventDefault();const rows=[...root.querySelectorAll('[data-saved-ref]')],ref=dragged;dragged=null;onMove?.(ref,rows.indexOf(row),0);},{signal:abort.signal});
  root.addEventListener('dragend',()=>{dragged=null;root.querySelectorAll('.is-dragging').forEach(row=>row.classList.remove('is-dragging'));},{signal:abort.signal});
  return {destroy(){abort.abort();}};
}
