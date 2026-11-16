import { translate } from './i18n.js';
// Small, interruptible feedback. Content and native controls work without motion.
export function createSiteInteractions({ main, header, language, dismissMenu }) {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Set();
  const finishers = new Map();
  const running = new WeakMap();
  const disclosures = new Map();
  const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
  let frame = 0;
  // Pointer is the starting assumption so hover feedback works at once; the first key press switches to keyboard mode.
  document.documentElement.dataset.input ||= 'pointer';

  const progress = document.createElement('div');
  progress.className = 'journey-progress';
  progress.setAttribute('aria-hidden', 'true');
  const fill = document.createElement('span');
  fill.className = 'journey-progress-fill';
  progress.append(fill);
  const top = document.createElement('button');
  top.type = 'button';
  top.className = 'back-to-top';
  top.hidden = true;
  top.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6"/></svg>';
  document.body.append(progress, top);

  const shouldAnimate = () => !preference.matches && document.documentElement.dataset.input !== 'keyboard' && !document.hidden;
  function run(element, keyframes, options = {}, done) {
    const previous = running.get(element);
    if (previous) { previous.onfinish = null; previous.cancel(); active.delete(previous); }
    if (!element?.isConnected || !shouldAnimate() || !element.animate) { done?.(); return; }
    const animation = element.animate(keyframes, { duration: 180, easing: ease, ...options });
    running.set(element, animation);
    active.add(animation);
    const finish = () => {
      active.delete(animation);
      finishers.delete(animation);
      if (running.get(element) === animation) running.delete(element);
      done?.();
    };
    animation.onfinish = finish;
    finishers.set(animation, () => { animation.onfinish = null; animation.cancel(); finish(); });
    animation.oncancel = () => { active.delete(animation); finishers.delete(animation); };
    return animation;
  }
  function finishAll() {
    for (const animation of [...active]) {
      finishers.get(animation)?.();
    }
  }
  // On phones the quick-action bar is always there, so the button only appears while the reader
  // heads back up, then steps aside instead of resting on top of the content.
  const compact = matchMedia('(max-width: 980px)');
  let lastPosition = Math.max(0, scrollY), headingUp = false, idleTimer = 0;
  function measure() {
    frame = 0;
    const range = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const position = Math.max(0, scrollY);
    fill.style.transform = `scaleX(${range ? Math.min(1, position / range) : 0})`;
    progress.hidden = range < 100;
    header.classList.toggle('is-scrolled', position > 12);
    const deep = position > Math.max(500, innerHeight * .6);
    let visible = deep;
    if (compact.matches && document.documentElement.dataset.input !== 'keyboard') {
      const moved = position - lastPosition;
      if (moved < -4) headingUp = true;
      else if (moved > 4) headingUp = false;
      visible = deep && (headingUp || top.matches(':focus-visible, :hover'));
      clearTimeout(idleTimer);
      if (visible) idleTimer = setTimeout(() => { if (!top.matches(':focus, :hover')) { headingUp = false; scheduleMeasure(); } }, 2400);
    }
    lastPosition = position;
    top.hidden = !visible;
    top.classList.toggle('is-visible', visible);
  }
  function scheduleMeasure() { if (!frame) frame = requestAnimationFrame(measure); }
  function refresh() {
    const label = translate('กลับด้านบน', 'Back to top', language());
    top.setAttribute('aria-label', label);
    top.title = label;
    scheduleMeasure();
  }
  top.addEventListener('click', event => {
    main.focus({ preventScroll: true });
    scrollTo({ top: 0, behavior: shouldAnimate() && event.detail ? 'smooth' : 'auto' });
  });
  document.addEventListener('pointerdown', () => { document.documentElement.dataset.input = 'pointer'; }, { passive: true });
  document.addEventListener('keydown', event => {
    if (['Tab', 'Enter', ' ', 'Escape', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      document.documentElement.dataset.input = 'keyboard';
      finishAll();
    }
  }, true);
  document.addEventListener('focusin', event => {
    if (document.documentElement.classList.contains('menu-open') && !header.contains(event.target)) dismissMenu();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) finishAll(); });
  preference.addEventListener('change', () => { finishAll(); scheduleMeasure(); });
  window.addEventListener('scroll', scheduleMeasure, { passive: true });
  window.addEventListener('resize', scheduleMeasure, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(scheduleMeasure).observe(document.body);

  // Disclosure height is bounded to this one control; fast repeated taps reverse it.
  document.addEventListener('click', event => {
    const summary = event.target.closest?.('summary');
    const details = summary?.parentElement;
    if (!details?.matches('details.faq-item, .daily-itinerary details, details.place-more')) return;
    if (!shouldAnimate() || event.detail === 0) { finishAll(); return; }
    event.preventDefault();
    const previous = disclosures.get(details);
    const open = previous ? !previous.open : !details.open;
    const start = details.getBoundingClientRect().height;
    if (previous) { previous.animation.onfinish = null; previous.animation.cancel(); disclosures.delete(details); }
    details.style.height = '';
    details.open = true;
    const end = open ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height;
    const settle = () => {
      details.open = open;
      details.style.removeProperty('overflow');
      details.style.removeProperty('height');
      disclosures.delete(details);
    };
    // Very long articles retain instant native layout rather than animating a page.
    if (!details.animate || Math.abs(end - start) > 900) { settle(); return; }
    details.style.overflow = 'hidden';
    const animation = run(details, [{ height: `${start}px` }, { height: `${end}px` }], { duration: open ? 220 : 160 }, settle);
    if (animation) disclosures.set(details, { open, animation });
  }, true);

  refresh();
  return {
    refresh,
    beforeRoute() { finishAll(); },
    routeChanged({ initial = false, overlay = false, reused = false } = {}) {
      refresh();
      if (!initial && !overlay && !reused) {
        const heading = main.querySelector('.page-head');
        if (heading) run(heading, [{ opacity: .6 }, { opacity: 1 }], { duration: 180 });
      }
    },
    results(element) { if (element) run(element, [{ opacity: .55 }, { opacity: 1 }], { duration: 160 }); scheduleMeasure(); },
    saved(ref) {
      for (const button of document.querySelectorAll('[data-save]')) {
        if (button.dataset.save === ref) run(button.querySelector('svg'), [{ transform: 'scale(.86)' }, { transform: 'scale(1)' }], { duration: 200 });
      }
      refresh();
    },
    menu(nav, open) {
      const hidden = nav.hidden;
      const opacity = hidden ? 0 : Number(getComputedStyle(nav).opacity);
      nav.inert = !open;
      if (open) {
        nav.hidden = false;
        nav.removeAttribute('aria-hidden');
        run(nav, [{ opacity, clipPath: 'inset(0 0 12% 0)' }, { opacity: 1, clipPath: 'inset(0)' }], { duration: 200 });
      } else {
        nav.setAttribute('aria-hidden', 'true');
        run(nav, [{ opacity }, { opacity: 0 }], { duration: 130 }, () => { nav.hidden = true; });
      }
    },
  };
}
