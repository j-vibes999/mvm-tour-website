import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createKit, smallPhoto, silhouette } from '../dist/ui-kit.js';
import { localPhotos } from '../dist/complete-media.js';
import { findProvince } from '../dist/content.js';
import { languageInfo } from '../dist/i18n.js';

const kit = createKit(() => 'en');
const attributes = html => Object.fromEntries([...html.match(/<img\b[^>]*>/)[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(([, name, value]) => [name, value]));
function webpSize(bytes) {
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const type = bytes.toString('ascii', offset, offset + 4), size = bytes.readUInt32LE(offset + 4);
    if (type === 'VP8 ') return [bytes.readUInt16LE(offset + 14) & 0x3fff, bytes.readUInt16LE(offset + 16) & 0x3fff];
    if (type === 'VP8X') return [bytes.readUIntLE(offset + 12, 3) + 1, bytes.readUIntLE(offset + 15, 3) + 1];
    if (type === 'VP8L') { const value = bytes.readUInt32LE(offset + 9); return [(value & 0x3fff) + 1, ((value >>> 14) & 0x3fff) + 1]; }
    offset += 8 + size + size % 2;
  }
  throw new Error('Unsupported WebP image');
}

test('small controls receive a true thumbnail and larger thumbnail callers can request 320 pixels', () => {
  assert.equal(smallPhoto('kuang-si'), 'assets/images/thumbnails/kuang-si-160.webp');
  assert.equal(smallPhoto('kuang-si', 320), 'assets/images/thumbnails/kuang-si-320.webp');
  assert.equal(smallPhoto('kuang-si', 480), 'assets/images/photos/kuang-si-480.webp');
  assert.equal(smallPhoto('champasak'), 'assets/images/champasak-800.webp');
  assert.equal(smallPhoto('not-a-photo'), '');
});

test('every local photo has valid small thumbnail files with honest dimensions and preserved aspect ratio', async () => {
  const catalogUrl = new URL('../dist/media-thumbnails.js', import.meta.url);
  assert.ok(existsSync(catalogUrl), 'generated thumbnail catalogue exists');
  const { photoThumbnails } = await import(catalogUrl);
  assert.deepEqual(Object.keys(photoThumbnails).sort(), Object.keys(localPhotos).sort());
  for (const [key, widths] of Object.entries(photoThumbnails)) {
    assert.deepEqual(widths, [160, 320], `${key}: both small and larger controls are covered`);
    const original = webpSize(readFileSync(new URL('../dist/' + localPhotos[key].src, import.meta.url)));
    for (const width of widths) {
      const path = `assets/images/thumbnails/${key}-${width}.webp`;
      const bytes = readFileSync(new URL('../dist/' + path, import.meta.url));
      const size = webpSize(bytes);
      assert.equal(size[0], width, `${key}: actual candidate width`);
      assert.ok(Math.abs(size[1] - original[1] * width / original[0]) <= 1, `${key}: no cropping or distortion`);
      assert.ok(bytes.length < readFileSync(new URL('../dist/' + localPhotos[key].srcset.split(',')[0].split(' ')[0], import.meta.url)).length, `${key}: thumbnail saves bytes over 480px`);
    }
  }
});

test('hero thumbnails select 160 or 320 pixels while retaining an existing high density candidate', () => {
  const image = attributes(kit.heroThumb({ photo: 'kuang-si' }));
  assert.equal(image.src, 'assets/images/thumbnails/kuang-si-320.webp');
  assert.equal(image.srcset, 'assets/images/thumbnails/kuang-si-160.webp 160w, assets/images/thumbnails/kuang-si-320.webp 320w, assets/images/photos/kuang-si-480.webp 480w');
  assert.equal(image.sizes, '(max-width: 640px) 146px, (max-width: 1000px) 158px, 168px');
  assert.equal(image.loading, 'lazy');
});

test('deferred photograph markup has no requestable source while retaining its presentation and activation data', () => {
  const image = attributes(kit.media('kuang-si', { deferred: true, alt: 'Kuang Si', cls: 'viewer-photo', sizes: '80vw', id: 'active-photo', eager: true }));
  assert.equal(image.src, undefined);
  assert.equal(image.srcset, undefined);
  assert.equal(image['data-src'], 'assets/images/photos/kuang-si-960.webp');
  assert.match(image['data-srcset'], /kuang-si-480.webp 480w/);
  assert.equal(image.sizes, '80vw');
  assert.equal(image.alt, 'Kuang Si');
  assert.equal(image.class, 'viewer-photo');
  assert.equal(image.id, 'active-photo');
  assert.equal(image.fetchpriority, 'high');
  assert.ok(Number(image.width) > 0 && Number(image.height) > 0);
});

test('deferred illustration fallback also withholds sources and normal media stays active', () => {
  const deferred = attributes(kit.media('champasak', { deferred: true }));
  assert.equal(deferred.src, undefined);
  assert.equal(deferred.srcset, undefined);
  assert.equal(deferred['data-src'], 'assets/images/champasak-1600.webp');
  assert.match(deferred['data-srcset'], /champasak-800.webp 800w/);
  const normal = attributes(kit.media('kuang-si'));
  assert.equal(normal.src, 'assets/images/photos/kuang-si-960.webp');
  assert.equal(normal['data-src'], undefined);
  assert.equal(normal.loading, 'lazy');
});

test('a deferred province underlay retains its hero layout without requesting its image', () => {
  const image = attributes(kit.provinceHeroHtml(findProvince('luang-prabang'), { deferred: true }));
  assert.equal(image.src, undefined);
  assert.equal(image.srcset, undefined);
  assert.equal(image['data-src'], 'assets/images/photos/phousi-960.webp');
  assert.equal(image.class, 'p-hero-img');
});

test('the language trigger accessible name includes its visible current language in every locale', () => {
  for (const [code, language] of Object.entries(languageInfo)) {
    const header = createKit(() => code).headerHtml('home');
    const label = header.match(/<button[^>]*data-language-toggle[^>]*aria-label="([^"]*)"/)[1];
    assert.ok(label.includes(language.label), `${code}: visible language is part of the name`);
  }
});

test('province silhouettes retain their framing and reference one shared external sprite', () => {
  for (const [id, viewBox] of [
    ['luang-prabang', '95.6 113.4 158.1 158.1'],
    ['vientiane-capital', '135.6 290.7 77.4 77.4'],
    ['champasak', '344.1 507.2 114.8 114.8'],
  ]) {
    const markup = silhouette(id);
    assert.ok(markup.includes(`viewBox="${viewBox}"`), `${id}: existing viewport`);
    assert.ok(markup.includes(`<use href="/assets/maps/provinces.svg#province-${id}">`), `${id}: shared sprite reference`);
    assert.doesNotMatch(markup, /<path\b/, `${id}: large geometry is not inline JavaScript markup`);
  }
});

test('the silhouette sprite preserves every province path and compact bounding box', async () => {
  const spriteUrl = new URL('../dist/assets/maps/provinces.svg', import.meta.url);
  assert.ok(existsSync(spriteUrl), 'generated SVG sprite exists');
  const sprite = readFileSync(spriteUrl, 'utf8');
  const { laosMap } = await import('../dist/map-data.js');
  const { provinceBounds } = await import('../dist/province-bounds.js');
  assert.deepEqual(Object.keys(provinceBounds).sort(), Object.keys(laosMap.provinces).sort());
  const paths = [...sprite.matchAll(/<path\b([^>]*)>/g)];
  assert.equal(paths.length, 18);
  const spritePaths = Object.fromEntries(paths.map(([, attributes]) => [attributes.match(/id="([^"]*)"/)[1], attributes.match(/\bd="([^"]*)"/)[1]]));
  for (const [id, shape] of Object.entries(laosMap.provinces)) {
    assert.equal(spritePaths['province-' + id], shape.d, `${id}: preserve exact source path`);
    assert.deepEqual(provinceBounds[id], shape.b, `${id}: preserve exact framing bounds`);
  }
});
