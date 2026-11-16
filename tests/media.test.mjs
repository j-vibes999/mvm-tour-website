import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { photos, provinces, findPlace } from '../dist/content.js';
import { extraPhotos, provincePhotos, placePhotos, localPhotos } from '../dist/media-catalog.js';
const allPhotos = { ...photos, ...extraPhotos };
const photoRoot = new URL('../dist/', import.meta.url);

function webpWidth(buffer) {
  assert.equal(buffer.toString('ascii', 0, 4), 'RIFF');
  assert.equal(buffer.toString('ascii', 8, 12), 'WEBP');
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const type = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (type === 'VP8 ') return buffer.readUInt16LE(offset + 14) & 0x3fff;
    if (type === 'VP8X') return buffer.readUIntLE(offset + 12, 3) + 1;
    offset += 8 + size + (size % 2);
  }
  throw new Error('Unsupported or corrupt WebP variant');
}

test('every Commons source has a complete local responsive photo cache', () => {
  assert.deepEqual(Object.keys(localPhotos).sort(), Object.keys(allPhotos).sort());
  for (const [key, photo] of Object.entries(localPhotos)) {
    assert.ok(photo.derivative, `${key}: disclose format/size changes`);
    assert.ok(photo.widths.length >= 2, `${key}: mobile and large variants`);
    assert.ok(photo.widths.every(width => width <= Math.min(1600, allPhotos[key].w)), `${key}: no upscaling`);
    assert.ok(!/^https?:/.test(photo.src), `${key}: no runtime hotlink`);
    assert.equal(photo.srcset.split(', ').length, photo.widths.length);
    for (const [index, candidate] of photo.srcset.split(', ').entries()) {
      const [file, descriptor] = candidate.split(' ');
      assert.equal(descriptor, `${photo.widths[index]}w`);
      const url = new URL(file, photoRoot);
      assert.ok(url.pathname.includes('/assets/images/photos/'));
      const buffer = fs.readFileSync(url);
      assert.equal(webpWidth(buffer), photo.widths[index], `${key}: honest srcset width`);
      assert.ok(buffer.length < 600000, `${key}: each derivative stays under600KB`);
    }
  }
});

test('all18 provinces have verified licensed photograph references', () => {
  assert.deepEqual(Object.keys(provincePhotos).sort(), provinces.map(province => province.id).sort());
  for (const [provinceId, key] of Object.entries(provincePhotos)) {
    assert.ok(allPhotos[key], `${provinceId}: source exists`);
    assert.ok(localPhotos[key], `${provinceId}: local derivative exists`);
  }
  assert.equal(provincePhotos.bokeo, 'huay-xai-town', 'Bokeo uses a Huay Xai photo, rather than the Pakbeng dock');
});

test('new place photo mappings name existing places and attributed sources', () => {
  for (const [ref, key] of Object.entries(placePhotos)) {
    assert.ok(findPlace(ref), `${ref}: real destination`);
    assert.ok(allPhotos[key] && localPhotos[key], `${ref}: known local photo`);
  }
  for (const [key, photo] of Object.entries(extraPhotos)) {
    assert.ok(photo.author && photo.file && photo.license && photo.description, `${key}: complete provenance`);
    assert.match(photo.sourceUrl, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    if (photo.license.startsWith('CC ')) assert.match(photo.licenseUrl, /^https:\/\/creativecommons\.org\/licenses\//);
  }
});
