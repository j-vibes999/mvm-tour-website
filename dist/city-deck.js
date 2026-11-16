import {homeDestinations} from './home-discovery.js';
import {createKit,icon,esc,pad2,smallPhoto} from './ui-kit.js';
import {publicHref} from './routes.js';
import {getCityDestination,cityText} from './city-deck-data.js';

const wrap=index=>(index+homeDestinations.length)%homeDestinations.length;
const unmodified=event=>event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.altKey&&!event.shiftKey;
const photoFocus={'vientiane-capital':'42% 55%','vang-vieng':'45% 67%','luang-prabang':'40% 58%','nong-khiaw':'42% 58%','muang-ngoi':'40% 58%'};

// A scenic preview keeps the homepage in place and leads to the complete city guide.
export function createCityDeck({getLanguage,onNavigate,onOpenChange}={}) {
  if(typeof HTMLDialogElement==='undefined'||!HTMLDialogElement.prototype.showModal)return {open:()=>false,close(){},destroy(){}};
  const {L,t,media,credit}=createKit(getLanguage),motion=matchMedia('(prefers-reduced-motion: reduce)');
  const listeners=new AbortController(),animations=new Set();
  let dialog=null,index=0,opener=null,effectTimer=0,sequence=0,drag=null,ignoreClickUntil=0,scrollLock=null;
  let closingRestoreFocus=true,backdropPress=false;
  const lang=()=>getLanguage?.()||'en';
  const text=(key,values)=>cityText(lang(),key,values);
  const animate=()=>!motion.matches&&dialog?.dataset.input!=='keyboard'&&document.documentElement.dataset.input!=='keyboard'&&!document.hidden;

  function cancelEffects() {
    clearTimeout(effectTimer);effectTimer=0;
    for(const animation of animations)animation.cancel();animations.clear();
    dialog?.querySelectorAll('[data-outgoing]').forEach(element=>element.remove());
  }
  function run(element,frames,duration=280) {
    if(!element||!animate()||!element.animate)return;
    const animation=element.animate(frames,{duration,easing:'cubic-bezier(.22,.8,.24,1)'});
    animations.add(animation);animation.finished.catch(()=>{}).finally(()=>animations.delete(animation));
  }
  function lockScroll() {
    if(scrollLock)return;
    const style=document.body.style;
    scrollLock={x:scrollX,y:scrollY,styles:Object.fromEntries(['position','top','left','width','overflow'].map(key=>[key,style[key]]))};
    document.documentElement.classList.add('city-deck-open');
    Object.assign(style,{position:'fixed',top:`-${scrollLock.y}px`,left:`-${scrollLock.x}px`,width:'100%',overflow:'hidden'});
  }
  function unlockScroll() {
    if(!scrollLock)return;
    const previous=scrollLock;scrollLock=null;
    Object.assign(document.body.style,previous.styles);
    document.documentElement.classList.remove('city-deck-open');
    scrollTo({left:previous.x,top:previous.y,behavior:'instant'});
  }
  function infoHtml(destination) {
    const {item,overview,highlights,facts}=destination,name=L(item.name);
    return `<div class="city-deck-heading"><h2 id="city-deck-title" tabindex="-1">${esc(name)}</h2></div><p class="city-deck-intro">${esc(L(overview))}</p><div class="city-deck-highlights"><h3>${esc(text('highlights'))}</h3><ul>${highlights.map(value=>`<li>${icon('check')}<span>${esc(L(value))}</span></li>`).join('')}</ul></div>${facts.length?`<ul class="city-deck-facts">${facts.map(fact=>`<li>${icon(fact.icon)}<span><b>${esc(text(fact.key))}</b><span>${esc(L(fact.value))}</span></span></li>`).join('')}</ul>`:''}<div class="city-deck-actions"><a class="btn btn-primary" data-city-explore href="${publicHref(item.href,lang())}"><span>${esc(text('exploreCity',{name}))}</span>${icon('arrow')}</a></div>`;
  }
  function renderDetails(destination) {
    const {item}=destination,name=L(item.name);
    const info=dialog.querySelector('.city-deck-info'),focusInside=info.contains(document.activeElement);
    info.innerHTML=infoHtml(destination);
    dialog.querySelector('.city-scene-caption').innerHTML=`<p class="city-scene-title">${esc(name)}</p><p class="city-scene-summary">${esc(L(item.summary))}</p>`;
    dialog.querySelector('.city-scene-attribution').innerHTML=credit(item.photo,'credit city-scene-credit');
    dialog.dataset.city=item.id;
    const counter=dialog.querySelector('.city-deck-counter');counter.textContent=`${pad2(index+1)} / ${pad2(homeDestinations.length)}`;
    counter.setAttribute('aria-label',text('position',{index:index+1,total:homeDestinations.length}));
    for(const button of dialog.querySelectorAll('[data-city-select]'))button.setAttribute('aria-pressed',String(button.dataset.citySelect===item.id));
    if(focusInside)dialog.querySelector('#city-deck-title').focus({preventScroll:true});
  }
  function imageFor(item) {
    const holder=document.createElement('div');
    holder.innerHTML=media(item.photo,{alt:L(item.name),sizes:'(max-width:700px) 100vw, 1120px',eager:true,style:`--city-focus:${photoFocus[item.id]||'50% 58%'}`});
    const image=holder.querySelector('img');image.draggable=false;return image;
  }
  async function selectCity(next,{opening=false}={}) {
    if(!dialog?.open||dialog.dataset.phase==='closing')return;
    const own=++sequence;cancelEffects();drag=null;index=wrap(next);
    const destination=getCityDestination(homeDestinations[index].id),image=imageFor(destination.item);
    dialog.dataset.phase=opening?'opening':'changing';dialog.querySelector('.city-deck-stage').setAttribute('aria-busy','true');
    // Decode before replacing the old scene so rapid choices cannot mix cities and images.
    let available=true;
    try {await image.decode();} catch {available=image.complete&&image.naturalWidth>0;}
    if(own!==sequence||!dialog.open||dialog.dataset.phase==='closing')return;
    const holder=dialog.querySelector('.city-scene-media'),previous=holder.querySelector('img'),moving=animate();
    if(previous&&available&&moving){previous.dataset.outgoing='';previous.setAttribute('aria-hidden','true');}
    else holder.replaceChildren();
    if(available)holder.append(image);
    else holder.innerHTML=`<span class="city-scene-unavailable" role="status">${icon('camera')}<span>${esc(t('ภาพนี้ไม่พร้อมแสดง','This image is unavailable'))}</span></span>`;
    if(!opening)renderDetails(destination);
    dialog.querySelector('.city-deck-stage').removeAttribute('aria-busy');
    if(!opening&&moving){
      if(available){run(image,[{opacity:0},{opacity:1}]);if(previous)run(previous,[{opacity:1},{opacity:0}]);}
      run(dialog.querySelector('.city-deck-info'),[{opacity:.5,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],240);
    }
    const finish=()=>{if(own!==sequence||!dialog.open)return;cancelEffects();dialog.dataset.phase='idle';};
    if(moving)effectTimer=setTimeout(finish,opening?300:280);else finish();
  }
  const step=direction=>selectCity(index+direction);

  function finishClose(restoreFocus) {
    sequence++;cancelEffects();drag=null;backdropPress=false;
    if(dialog?.open)dialog.close();
    unlockScroll();
    onOpenChange?.(false);
    if(dialog){dialog.dataset.phase='idle';dialog.querySelector('.city-deck-stage').removeAttribute('aria-busy');}
    const target=opener;opener=null;
    if(restoreFocus&&target?.isConnected)target.focus({preventScroll:true});
  }
  function close({immediate=false,restoreFocus=true}={}) {
    if(!dialog?.open){unlockScroll();return;}
    if(immediate||!animate()){finishClose(restoreFocus);return;}
    closingRestoreFocus=restoreFocus;
    const own=++sequence;cancelEffects();drag=null;dialog.dataset.phase='closing';
    run(dialog.querySelector('.city-deck-shell'),[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(8px)'}],150);
    effectTimer=setTimeout(()=>{if(sequence===own)finishClose(restoreFocus);},150);
  }
  function settleEffects() {
    if(!dialog?.open)return;
    if(dialog.dataset.phase==='closing'){finishClose(closingRestoreFocus);return;}
    cancelEffects();drag=null;backdropPress=false;
    // A pending decode still owns its commit; settling motion must not cancel that request.
    if(!dialog.querySelector('.city-deck-stage').hasAttribute('aria-busy'))dialog.dataset.phase='idle';
  }
  function ensureDialog() {
    if(dialog)return;
    dialog=document.createElement('dialog');dialog.className='city-deck';dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','city-deck-title');
    dialog.innerHTML=`<div class="city-deck-shell"><button type="button" class="city-deck-close" aria-label="${esc(text('close'))}">${icon('close')}</button><div class="city-deck-stage"><div class="city-scene"><div class="city-scene-media"></div><div class="city-scene-caption"></div><div class="city-scene-attribution"></div></div><article class="city-deck-info"></article></div><div class="city-deck-footer"><nav class="city-deck-controls" aria-label="${esc(text('chooseCity'))}"><button type="button" class="round-btn" data-city-step="-1" aria-label="${esc(text('previous'))}">${icon('back')}</button><span class="city-deck-counter" role="status" aria-live="polite" aria-atomic="true"></span><button type="button" class="round-btn" data-city-step="1" aria-label="${esc(text('next'))}">${icon('arrow')}</button></nav><nav class="city-deck-cities" aria-label="${esc(text('chooseCity'))}">${homeDestinations.map(item=>`<button type="button" data-city-select="${item.id}" aria-pressed="false"><img src="${esc(smallPhoto(item.photo))}" alt="" width="40" height="32" loading="lazy" draggable="false"><span>${esc(L(item.name))}</span></button>`).join('')}</nav></div></div>`;
    document.body.append(dialog);
    dialog.addEventListener('cancel',event=>{event.preventDefault();close();},{signal:listeners.signal});
    dialog.addEventListener('close',()=>{if(!dialog.open){sequence++;cancelEffects();unlockScroll();}},{signal:listeners.signal});
    dialog.addEventListener('click',event=>{
      const beganOnBackdrop=backdropPress;backdropPress=false;
      if(performance.now()<ignoreClickUntil)return;
      const button=event.target.closest('button'),link=event.target.closest('[data-city-explore]');
      if(button?.matches('.city-deck-close')){close();return;}
      if(button?.hasAttribute('data-city-step')){step(Number(button.dataset.cityStep));return;}
      if(button?.hasAttribute('data-city-select')){const next=homeDestinations.findIndex(item=>item.id===button.dataset.citySelect);if(next!==index)selectCity(next);return;}
      if(link&&unmodified(event)){event.preventDefault();event.stopPropagation();const href=link.getAttribute('href');close({immediate:true,restoreFocus:false});onNavigate?.(href);return;}
      if(beganOnBackdrop&&event.target===dialog)close();
    },{signal:listeners.signal});
    dialog.addEventListener('keydown',event=>{
      dialog.dataset.input='keyboard';settleEffects();
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close({immediate:true});return;}
      if((event.key==='ArrowLeft'||event.key==='ArrowRight')&&!event.altKey&&!event.metaKey&&!event.ctrlKey){event.preventDefault();event.stopPropagation();step(event.key==='ArrowLeft'?-1:1);return;}
      if(event.key==='Tab'){
        const items=[...dialog.querySelectorAll('button,a[href],[tabindex]')].filter(el=>el.tabIndex>=0&&!el.closest('[inert]')&&el.getClientRects().length);
        const active=document.activeElement;
        if(event.shiftKey&&(active===items[0]||!items.includes(active))){event.preventDefault();items.at(-1)?.focus();}
        else if(!event.shiftKey&&active===items.at(-1)){event.preventDefault();items[0]?.focus();}
      }
    },{signal:listeners.signal});
    dialog.addEventListener('pointerdown',event=>{
      dialog.dataset.input='pointer';backdropPress=event.target===dialog;
      if(event.button!==0||event.isPrimary===false||!event.target.closest('.city-scene')||event.target.closest('button,a,input,textarea,select'))return;
      drag={id:event.pointerId,x:event.clientX,y:event.clientY};
    },{signal:listeners.signal});
    dialog.addEventListener('pointermove',event=>{
      if(!drag||drag.id!==event.pointerId)return;
      const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
      if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)){drag=null;return;}
      if(Math.abs(dx)>16&&Math.abs(dx)>Math.abs(dy)*1.5)event.preventDefault();
    },{signal:listeners.signal});
    dialog.addEventListener('pointerup',event=>{
      if(!drag||drag.id!==event.pointerId)return;
      const dx=event.clientX-drag.x,dy=event.clientY-drag.y;drag=null;
      if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.5){ignoreClickUntil=performance.now()+250;step(dx<0?1:-1);}
    },{signal:listeners.signal});
    for(const name of ['pointercancel','lostpointercapture'])dialog.addEventListener(name,()=>{drag=null;backdropPress=false;},{signal:listeners.signal});
  }
  function open(id,source) {
    const next=homeDestinations.findIndex(item=>item.id===id);if(next<0)return false;
    ensureDialog();sequence++;cancelEffects();index=next;opener=source||document.activeElement;
    drag=null;backdropPress=false;ignoreClickUntil=0;
    dialog.dataset.input=document.documentElement.dataset.input||'pointer';dialog.dataset.phase='opening';
    dialog.querySelector('.city-deck-close').setAttribute('aria-label',text('close'));
    for(const nav of dialog.querySelectorAll('nav'))nav.setAttribute('aria-label',text('chooseCity'));
    for(const direction of [-1,1])dialog.querySelector(`[data-city-step="${direction}"]`).setAttribute('aria-label',text(direction===-1?'previous':'next'));
    for(const button of dialog.querySelectorAll('[data-city-select]'))button.querySelector('span').textContent=L(homeDestinations.find(item=>item.id===button.dataset.citySelect).name);
    renderDetails(getCityDestination(id));dialog.querySelector('.city-scene-media').replaceChildren();
    if(!dialog.open){lockScroll();dialog.showModal();onOpenChange?.(true);}
    dialog.querySelector('.city-deck-shell').scrollTop=0;
    dialog.querySelector('#city-deck-title').focus({preventScroll:true});
    selectCity(next,{opening:true});
    run(dialog.querySelector('.city-deck-shell'),[{opacity:.7,transform:'translateY(8px) scale(.98)'},{opacity:1,transform:'translateY(0) scale(1)'}],300);
    return true;
  }
  motion.addEventListener('change',settleEffects,{signal:listeners.signal});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)settleEffects();},{signal:listeners.signal});
  window.addEventListener('resize',settleEffects,{signal:listeners.signal});
  return {open,close,destroy(){close({immediate:true,restoreFocus:false});listeners.abort();dialog?.remove();}};
}
