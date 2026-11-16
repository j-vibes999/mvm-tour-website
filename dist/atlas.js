// Keep regional framing in the map's own viewport; native province links stay clickable.
export function setAtlasRegion(root, region = 'all') {
  const svg = root?.matches?.('svg') ? root : root?.querySelector('.laos-map');
  if (!svg) return;
  const selected = ['north', 'central', 'south'].includes(region) ? region : 'all';
  svg.dataset.region = selected;
  const wrap = svg.closest('[data-atlas]');
  if (wrap) wrap.dataset.region = selected;
  const original = svg.dataset.fullViewBox || svg.getAttribute('viewBox');
  svg.dataset.fullViewBox = original;
  const paths = [...svg.querySelectorAll('a[data-province]')];
  for (const link of paths) {
    const visible = selected === 'all' || link.classList.contains(`r-${selected}`);
    link.style.visibility = visible ? '' : 'hidden';
  }
  if (selected === 'all') { svg.setAttribute('viewBox', original); return; }
  const boxes = paths.filter(link => link.classList.contains(`r-${selected}`)).map(link => link.querySelector('path').getBBox());
  if (!boxes.length) return;
  const left = Math.min(...boxes.map(b => b.x)), top = Math.min(...boxes.map(b => b.y));
  const right = Math.max(...boxes.map(b => b.x + b.width)), bottom = Math.max(...boxes.map(b => b.y + b.height));
  const padding = 18;
  svg.setAttribute('viewBox', `${left - padding} ${top - padding} ${right - left + padding * 2} ${bottom - top + padding * 2}`);
}
