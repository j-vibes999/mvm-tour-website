const PLAY_PATH = 'm9 5 10 7-10 7Z';
const PAUSE_PATH = 'M9 5v14M15 5v14';
const DURATION = 8000; // each destination stays for eight seconds while the slideshow plays
const KEN_BURNS = [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }];
const KEN_BURNS_TIMING = { duration: 9500, easing: 'linear', fill: 'forwards' };

// A living hero: the photo drifts slowly, the next one dissolves in only after it has loaded
// and decoded, and the active thumbnail shows how long until the next destination.
export function createHeroExperience(root, { slides, initialIndex = 0, onChange, labels }) {
  const image = root?.querySelector('#hero-img');
  if (!root || !image || !slides.length) return null;
  const picker = root.querySelector('.slide-picker');
  const buttons = [...root.querySelectorAll('[data-slide]')];
  const playButton = root.querySelector('[data-hero-play]');
  const playIcon = playButton.querySelector('svg path');
  const current = root.querySelector('.hero-current');
  const nameNode = root.querySelector('[data-hero-name]');
  const feedback = root.querySelector('[data-hero-feedback]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const listeners = new AbortController();
  const wrap = index => ((Math.trunc(index) % slides.length) + slides.length) % slides.length;
  const held = new Set();
  const failed = new Set();
  let index = wrap(initialIndex), requestedIndex = index;
  let enabled = !motion.matches, destroyed = false, busy = false, error = '';
  let renderedEnabled = null;
  let timer = 0, request = 0, cancelLoad = null, transition = null, animation = null, incoming = null;
  let drag = null, suppressClickUntil = 0, touch = null;
  let elapsed = 0, runningSince = 0;
  let drift = null, incomingDrift = null, progressBar = null, progressAnimation = null;
  let prefetchRequest = 0, prefetchTimer = 0;

  const playingNow = () => !destroyed && enabled && !held.size && !busy;
  const keyboard = () => document.documentElement.dataset.input === 'keyboard';

  function startDrift(element, from = 0) {
    if (motion.matches || typeof element.animate !== 'function') return null;
    const run = element.animate(KEN_BURNS, KEN_BURNS_TIMING);
    run.pause();
    run.currentTime = from;
    return run;
  }

  function syncDrift(playing) {
    for (const run of [drift, incomingDrift]) {
      if (!run) continue;
      if (playing && run.playState === 'paused' && Number(run.currentTime) < KEN_BURNS_TIMING.duration) run.play();
      else if (!playing && run.playState === 'running') run.pause();
    }
  }

  function renderStatus() {
    if (destroyed) return;
    if (renderedEnabled !== enabled) {
      playButton.setAttribute('aria-pressed', String(enabled));
      playButton.setAttribute('aria-label', enabled ? labels.pauseAction : labels.playAction);
      playIcon.setAttribute('d', enabled ? PAUSE_PATH : PLAY_PATH);
      current.setAttribute('aria-live', enabled ? 'off' : 'polite');
      renderedEnabled = enabled;
    }
    const playing = String(playingNow());
    if (root.dataset.heroPlaying !== playing) root.dataset.heroPlaying = playing;
    if (root.getAttribute('aria-busy') !== String(busy)) root.setAttribute('aria-busy', String(busy));
    const message = busy ? labels.loading(slides[requestedIndex].name) : error || (enabled ? (held.size ? labels.held : labels.playing) : labels.manual);
    if (feedback.textContent !== message) feedback.textContent = message;
  }

  // The progress line under the active thumbnail mirrors the time already spent on this slide.
  function syncProgress(playing) {
    const bar = buttons[index]?.querySelector('.slide-progress') || null;
    if (bar !== progressBar) { progressAnimation?.cancel(); progressAnimation = null; progressBar = bar; }
    if (!bar || motion.matches || typeof bar.animate !== 'function') { progressAnimation?.cancel(); progressAnimation = null; return; }
    if (!progressAnimation) {
      progressAnimation = bar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: DURATION, easing: 'linear', fill: 'forwards' });
      progressAnimation.pause();
    }
    progressAnimation.currentTime = Math.min(DURATION, elapsed + (runningSince ? performance.now() - runningSince : 0));
    if (playing) progressAnimation.play(); else progressAnimation.pause();
  }

  function schedule() {
    clearTimeout(timer);
    const playing = playingNow();
    if (playing) {
      if (!runningSince) runningSince = performance.now();
      const remaining = Math.max(0, DURATION - elapsed - (performance.now() - runningSince));
      timer = setTimeout(() => {
        let next = wrap(index + 1);
        while (next !== index && failed.has(next)) next = wrap(next + 1);
        if (next === index) { enabled = false; schedule(); return; }
        goTo(next, { automatic: true });
      }, remaining);
    } else if (runningSince) {
      elapsed += performance.now() - runningSince;
      runningSince = 0;
    }
    if (!destroyed) { syncProgress(playing); syncDrift(playing); }
    renderStatus();
    if (playing) prefetch(wrap(index + 1));
  }

  function hold(reason, value) {
    if (held.has(reason) === value) return;
    if (value) held.add(reason);
    else held.delete(reason);
    schedule();
  }

  function load(slide) {
    const candidate = new Image();
    candidate.decoding = 'async';
    candidate.sizes = image.sizes || '100vw';
    return new Promise((resolve, reject) => {
      let settled = false;
      const timeout = setTimeout(() => finish(false), 15000);
      const cleanup = () => {
        clearTimeout(timeout);
        candidate.onload = candidate.onerror = null;
        if (cancelLoad === cancel) cancelLoad = null;
      };
      const finish = async success => {
        if (settled) return;
        settled = true;
        cleanup();
        if (!success) { reject(new Error('Image unavailable')); return; }
        try { await candidate.decode?.(); } catch {}
        if (candidate.naturalWidth) resolve(candidate);
        else reject(new Error('Image unavailable'));
      };
      const cancel = () => { if (!settled) { settled = true; cleanup(); resolve(null); } };
      cancelLoad = cancel;
      candidate.onload = () => finish(true);
      candidate.onerror = () => finish(false);
      candidate.srcset = slide.srcset;
      candidate.src = slide.src;
      if (candidate.complete) queueMicrotask(() => finish(candidate.naturalWidth > 0));
    });
  }

  // CPU idle is not network idle: the visible photograph gets the connection first.
  function prefetch(next) {
    const slide = slides[next];
    const connection = navigator.connection;
    if (!slide || slide.prefetched || !playingNow() || !image.complete || !image.naturalWidth || connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;
    const own = ++prefetchRequest;
    const warm = () => {
      if (destroyed || own !== prefetchRequest || !playingNow() || next !== wrap(index + 1) || slide.prefetched) return;
      slide.prefetched = true;
      const img = new Image(); img.decoding = 'async'; img.fetchPriority = 'low'; img.sizes = image.sizes || '100vw'; img.srcset = slide.srcset; img.src = slide.src;
    };
    image.decode().catch(() => {}).then(() => {
      if (destroyed || own !== prefetchRequest) return;
      if ('requestIdleCallback' in window) requestIdleCallback(warm, { timeout: 2500 });
      else prefetchTimer = setTimeout(warm, 1200);
    });
  }

  function commit(next, { announce = false } = {}) {
    const changed = next !== index;
    index = next;
    failed.delete(next);
    if (changed) { elapsed = 0; runningSince = 0; }
    nameNode.textContent = slides[index].name;
    if (announce && !motion.matches && typeof nameNode.animate === 'function') {
      nameNode.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.22,.8,.24,1)' });
    }
    root.querySelector('[data-hero-count]').textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    const link = root.querySelector('#hero-place-link');
    link.href = slides[index].href;
    link.querySelector('[data-hero-place-label]').textContent = slides[index].linkLabel;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.slide) === index)));
    const selected = buttons[index];
    if (selected && !drag) {
      const left = selected.offsetLeft - picker.offsetLeft - (picker.clientWidth - selected.offsetWidth) / 2;
      picker.scrollTo({ left: Math.max(0, left), behavior: motion.matches || keyboard() ? 'auto' : 'smooth' });
    }
    const credit = root.querySelector('[data-hero-credit]');
    if (credit) {
      credit.hidden = !slides[index].creditHref;
      if (slides[index].creditHref) {
        credit.href = slides[index].creditHref;
        credit.setAttribute('aria-label', slides[index].creditLabel);
      }
    }
    if (slides[index].photo) image.dataset.photo = slides[index].photo;
    else delete image.dataset.photo;
    if (enabled) prefetch(wrap(index + 1));
    onChange?.(index);
  }

  async function crossfade(candidate, next, { instant, automatic }) {
    const slide = slides[next];
    candidate.className = 'hero-img hero-incoming';
    candidate.alt = '';
    candidate.setAttribute('aria-hidden', 'true');
    candidate.style.setProperty('--focus', slide.focus);
    root.insertBefore(candidate, image.nextSibling);
    incoming = candidate;
    incomingDrift = instant ? null : startDrift(candidate);
    if (!instant && !motion.matches && typeof candidate.animate === 'function') {
      animation = candidate.animate([{ opacity: 0 }, { opacity: 1 }], { duration: automatic ? 1400 : 700, easing: 'cubic-bezier(.45,.05,.55,.95)', fill: 'forwards' });
      try { await animation.finished; } catch {}
      animation = null;
    }
    if (destroyed) { incomingDrift?.cancel(); candidate.remove(); return; }
    // The original node adopts the decoded photo and continues its drift from the same frame.
    image.srcset = slide.srcset;
    image.sizes = candidate.sizes;
    image.src = slide.src;
    image.alt = slide.alt;
    image.style.setProperty('--focus', slide.focus);
    try { await image.decode?.(); } catch {}
    if (destroyed) { incomingDrift?.cancel(); candidate.remove(); return; }
    drift?.cancel();
    drift = startDrift(image, incomingDrift ? Number(incomingDrift.currentTime) || 0 : 0);
    incomingDrift?.cancel();
    incomingDrift = null;
    image.style.removeProperty('opacity');
    delete root.dataset.heroImageFailed;
    candidate.remove();
    incoming = null;
    commit(next, { announce: !instant });
  }

  async function goTo(value, { automatic = false } = {}) {
    if (destroyed || !Number.isFinite(Number(value))) return false;
    const next = wrap(Number(value));
    const instant = !automatic && keyboard();
    if (instant) enabled = false;
    const ownRequest = ++request;
    requestedIndex = next;
    cancelLoad?.();
    clearTimeout(timer);
    busy = true;
    error = '';
    schedule();
    // Finish the current dissolve before the newest request takes the image over.
    animation?.finish();
    if (transition) await transition;
    if (destroyed || ownRequest !== request) return false;
    if (next === index && !root.dataset.heroImageFailed) { busy = false; schedule(); return true; }
    try {
      const candidate = await load(slides[next]);
      if (!candidate || destroyed || ownRequest !== request) return false;
      transition = crossfade(candidate, next, { instant, automatic });
      await transition;
      transition = null;
      if (destroyed || ownRequest !== request) return false;
      busy = false;
      schedule();
      return true;
    } catch {
      if (destroyed || ownRequest !== request) return false;
      requestedIndex = index;
      busy = false;
      error = labels.failed(slides[next].name);
      if (automatic) failed.add(next);
      schedule();
      return false;
    }
  }

  const listen = (node, name, callback) => node.addEventListener(name, callback, { signal: listeners.signal });
  listen(root, 'click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-hero-prev')) goTo(requestedIndex - 1);
    if (button.hasAttribute('data-hero-next')) goTo(requestedIndex + 1);
    if (button.hasAttribute('data-hero-play')) { enabled = !enabled; error = ''; schedule(); }
  });
  listen(picker, 'keydown', event => {
    const button = event.target.closest('[data-slide]');
    if (!button || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : wrap(Number(button.dataset.slide) + (event.key === 'ArrowRight' ? 1 : -1));
    buttons[next]?.focus({ preventScroll: true });
    goTo(next);
  });
  // Pointer hover must not stop a slideshow while the visitor is watching it.
  // Keyboard exploration stops rotation until the visitor explicitly presses Play.
  const pauseForKeyboard = () => { if (enabled) { enabled = false; schedule(); } };
  listen(root, 'focusin', () => { if (keyboard()) pauseForKeyboard(); });
  listen(root, 'keydown', event => {
    if (!event.target.closest('[data-hero-play]') || !['Enter', ' '].includes(event.key)) pauseForKeyboard();
  });

  listen(picker, 'dragstart', event => event.preventDefault());
  listen(picker, 'pointerdown', event => {
    hold('gesture', true);
    if (event.button === 0 && event.pointerType !== 'touch') drag = { id: event.pointerId, x: event.clientX, left: picker.scrollLeft, moved: false };
  });
  listen(picker, 'pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const distance = event.clientX - drag.x;
    if (!drag.moved && Math.abs(distance) < 7) return;
    if (!drag.moved) { drag.moved = true; picker.dataset.dragging = 'true'; picker.setPointerCapture(event.pointerId); }
    event.preventDefault();
    picker.scrollLeft = drag.left - distance;
  });
  const endDrag = event => {
    if (event.pointerType === 'touch') return;
    if (drag && event.pointerId === drag.id) {
      if (drag.moved) suppressClickUntil = performance.now() + 300;
      if (picker.hasPointerCapture(event.pointerId)) picker.releasePointerCapture(event.pointerId);
      drag = null;
      delete picker.dataset.dragging;
    }
    hold('gesture', false);
  };
  listen(window, 'pointerup', endDrag);
  listen(window, 'pointercancel', endDrag);
  picker.addEventListener('click', event => {
    if (performance.now() < suppressClickUntil) { event.preventDefault(); event.stopPropagation(); }
  }, { capture: true, signal: listeners.signal });
  root.addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || event.target.closest('a,button,.slide-picker')) return;
    touch = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    hold('gesture', true);
  }, { passive: true, signal: listeners.signal });
  root.addEventListener('touchend', event => {
    hold('gesture', false);
    if (!touch) return;
    const point = event.changedTouches[0], dx = point.clientX - touch.x, dy = point.clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) goTo(requestedIndex + (dx < 0 ? 1 : -1));
  }, { passive: true, signal: listeners.signal });
  listen(root, 'touchcancel', () => { touch = null; hold('gesture', false); });
  listen(document, 'visibilitychange', () => hold('hidden', document.hidden));
  listen(image, 'load', () => prefetch(wrap(index + 1)));
  listen(motion, 'change', () => {
    if (motion.matches) { enabled = false; animation?.finish(); drift?.cancel(); drift = null; incomingDrift?.cancel(); incomingDrift = null; }
    else if (!drift) drift = startDrift(image);
    schedule();
  });
  listen(image, 'error', () => {
    root.dataset.heroImageFailed = 'true';
    image.style.opacity = '0';
    error = labels.failed(slides[index].name);
    renderStatus();
  });
  const bounds = root.getBoundingClientRect();
  if (document.hidden) held.add('hidden');
  if (keyboard() && root.contains(document.activeElement)) enabled = false;
  if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) held.add('offscreen');
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => hold('offscreen', !entries[0].isIntersecting), { threshold: .15 }) : null;
  observer?.observe(root);
  if (image.complete && !image.naturalWidth) { root.dataset.heroImageFailed = 'true'; image.style.opacity = '0'; error = labels.failed(slides[index].name); }
  image.style.setProperty('--focus', slides[index].focus);
  drift = startDrift(image);
  commit(index);
  schedule();

  return {
    goTo,
    hold(reason, value) { hold(reason, value); if (!value) prefetch(wrap(index + 1)); },
    destroy() {
      destroyed = true;
      prefetchRequest++;
      clearTimeout(prefetchTimer);
      request++;
      clearTimeout(timer);
      cancelLoad?.();
      listeners.abort();
      observer?.disconnect();
      animation?.cancel();
      drift?.cancel();
      incomingDrift?.cancel();
      progressAnimation?.cancel();
      incoming?.remove();
    },
  };
}
