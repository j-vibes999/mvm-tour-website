// Optional pointer enhancement. Reading, place navigation and the close button stay native.
export function attachViewerGestures(viewerElement, { onClose } = {}) {
  if (!viewerElement) return () => {};
  const listeners = new AbortController();
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 899px)');
  let drag = null, settling = null;

  function reset(animate = false) {
    const previous = drag;
    drag = null;
    if (!previous) return;
    const { sheet, handle, id, distance } = previous;
    if (handle.hasPointerCapture?.(id)) handle.releasePointerCapture(id);
    sheet.style.removeProperty('transform');
    if (animate && distance > 0 && !motion.matches && typeof sheet.animate === 'function') {
      const run = sheet.animate([{ transform: `translateY(${distance}px)` }, { transform: 'translateY(0)' }], { duration: 180, easing: 'cubic-bezier(.22,.8,.24,1)' });
      settling = run;
      run.finished.catch(() => {}).then(() => { if (settling === run) settling = null; });
    }
  }

  viewerElement.addEventListener('pointerdown', event => {
    const handle = event.target.closest('[data-sheet-handle]');
    if (!mobile.matches || !handle || !viewerElement.contains(handle) || event.button !== 0 || event.isPrimary === false) return;
    const sheet = handle.closest('.v-info');
    if (!sheet || drag) return;
    settling?.cancel();
    settling = null;
    drag = { id: event.pointerId, handle, sheet, x: event.clientX, y: event.clientY, distance: 0, vertical: false };
    // Synthetic pointer events have no active pointer to capture; real pointers do.
    try { handle.setPointerCapture(event.pointerId); } catch {}
  }, { signal: listeners.signal });

  viewerElement.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.vertical) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 6) return;
      if (dy <= 0 || Math.abs(dx) > dy) { reset(); return; }
      drag.vertical = true;
    }
    drag.distance = Math.max(0, dy);
    drag.sheet.style.transform = `translateY(${drag.distance}px)`;
    event.preventDefault();
  }, { signal: listeners.signal });

  viewerElement.addEventListener('pointerup', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const threshold = Math.min(120, Math.max(80, drag.sheet.clientHeight * .22));
    const dismiss = drag.vertical && drag.distance >= threshold;
    reset(!dismiss);
    if (dismiss) onClose?.();
  }, { signal: listeners.signal });
  viewerElement.addEventListener('pointercancel', event => { if (event.pointerId === drag?.id) reset(true); }, { signal: listeners.signal });
  viewerElement.addEventListener('lostpointercapture', event => { if (event.pointerId === drag?.id) reset(true); }, { signal: listeners.signal });
  window.addEventListener('blur', () => reset(), { signal: listeners.signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); }, { signal: listeners.signal });
  motion.addEventListener('change', () => { reset(); settling?.cancel(); settling = null; }, { signal: listeners.signal });
  mobile.addEventListener('change', () => { reset(); settling?.cancel(); settling = null; }, { signal: listeners.signal });

  return () => {
    listeners.abort();
    reset();
    settling?.cancel();
    settling = null;
  };
}
