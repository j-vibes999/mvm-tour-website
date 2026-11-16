import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  provinces, regions, placeTypes, tagLabels, images, photos, featured, slides, packages, placeDetails, mustSee,
  legacyDestinations, provincesByRegion, packagesFor, findPlace, findProvince, famousPlaces, wrapSlide,
} from '../dist/content.js';
import { laosMap } from '../dist/map-data.js';

const ids = list => list.map(({ id }) => id);
const imageFile = key => new URL(`../dist/assets/images/${key}-800.webp`, import.meta.url);

test('Laos has 18 provinces split 9 / 5 / 4 across the three regions', () => {
  assert.equal(provinces.length, 18);
  assert.equal(provincesByRegion('north').length, 9);
  assert.equal(provincesByRegion('central').length, 5);
  assert.equal(provincesByRegion('south').length, 4);
  assert.equal(provincesByRegion('all').length, 18);
  assert.deepEqual(provincesByRegion('unknown'), []);
});

test('Vang Vieng (Vientiane Province) belongs to the central region', () => {
  assert.equal(findProvince('vientiane-province').region, 'central');
  assert.deepEqual(ids(packagesFor({ region: 'central' })), ['vientiane-capital-discovery','vang-vieng-nature']);
});

test('every province has a map shape and every map shape has a province', () => {
  assert.deepEqual(Object.keys(laosMap.provinces).sort(), ids(provinces).sort());
});

test('province ids are unique and each province is complete in Thai, English and Lao', () => {
  assert.equal(new Set(ids(provinces)).size, provinces.length);
  for (const province of provinces) {
    assert.ok(regions.some(region => region.id === province.region), province.id);
    for (const field of ['name', 'tagline', 'intro', 'capital']) {
      assert.ok(province[field].th && province[field].en, `${province.id}.${field}`);
    }
    assert.ok(province.name.lo, `${province.id} Lao name`);
    assert.ok(province.places.length >= 3, `${province.id} has at least three places`);
    for (const tag of province.tags) assert.ok(tagLabels[tag], `${province.id} tag ${tag}`);
  }
});

test('every place has a known type, both languages and a unique id', () => {
  for (const province of provinces) {
    assert.equal(new Set(ids(province.places)).size, province.places.length, province.id);
    for (const place of province.places) {
      assert.ok(placeTypes[place.type], `${province.id}/${place.id} type`);
      assert.ok(place.name.th && place.name.en && place.text.th && place.text.en, `${province.id}/${place.id}`);
    }
  }
});

test('every referenced image exists', () => {
  const keys = [
    ...provinces.flatMap(province => [province.image, ...province.places.map(place => place.image)]),
    ...featured.map(item => item.image),
    ...slides.map(item => item.image),
    ...packages.map(item => item.image),
  ].filter(Boolean);
  for (const key of new Set(keys)) {
    assert.ok(images[key], `images.${key}`);
    assert.ok(fs.existsSync(imageFile(key)), `${key}-800.webp`);
  }
});

test('featured places, slides, packages and old links point at real provinces', () => {
  for (const item of [...featured, ...slides, ...packages]) assert.ok(findProvince(item.provinceId), item.provinceId);
  for (const slide of slides.filter(item=>item.placeRef)) assert.equal(findPlace(slide.placeRef)?.province.id,slide.provinceId,slide.placeRef);
  for (const target of Object.values(legacyDestinations)) assert.ok(findProvince(target), target);
});

test('every photo reference exists and every photo is credited', () => {
  const refs = [...provinces.flatMap(province => [province.photo, ...province.places.map(place => place.photo)]),...packages.map(trip=>trip.photo),...slides.map(slide=>slide.photo)].filter(Boolean);
  for (const key of refs) assert.ok(photos[key], `photos.${key}`);
  for (const [key, photo] of Object.entries(photos)) {
    assert.ok(photo.author && photo.license && photo.file, `${key} credit`);
    assert.match(photo.src, /\/960px-/, `${key} src`);
    assert.ok(photo.w >= 1920 || photo.w > 960, `${key} size`);
    assert.ok(refs.includes(key), `${key} is used`);
  }
});

test('top places have complete details and a photo', () => {
  const list = famousPlaces();
  assert.equal(list.length, Object.keys(placeDetails).length);
  assert.equal(famousPlaces('north').length + famousPlaces('central').length + famousPlaces('south').length, list.length);
  for (const { ref, place, details } of list) {
    assert.ok(place.photo || place.image, `${ref} photo`);
    for (const field of ['about', 'best', 'time', 'access']) assert.ok(details[field].th && details[field].en, `${ref}.${field}`);
    assert.equal(details.highlights.th.length, details.highlights.en.length, `${ref} highlights`);
    assert.ok(details.highlights.th.length >= 3, `${ref} highlights count`);
  }
  for (const ref of mustSee) assert.ok(placeDetails[ref], ref);
  assert.equal(findPlace('nowhere/nothing'), null);
});

test('places named by the owner are featured', () => {
  for (const ref of ['luang-prabang/nong-khiaw', 'luang-prabang/muang-ngoi', 'vientiane-province/vang-vieng', 'vientiane-capital/that-luang']) {
    assert.ok(placeDetails[ref], ref);
  }
});

test('packages can be filtered by province', () => {
  assert.deepEqual(ids(packagesFor({ provinceId: 'luang-prabang' })), ['luang-prabang-discovery','nong-khiaw-discovery','muang-ngoi-discovery']);
  assert.deepEqual(packagesFor({ provinceId: 'phongsaly' }), []);
  assert.equal(packagesFor().length, packages.length);
});

test('previous navigation wraps from the first slide to the last', () => {
  assert.equal(wrapSlide(-1, 4), 3);
  assert.equal(wrapSlide(-9, 4), 3);
});

test('next navigation wraps past the last slide to the beginning', () => {
  assert.equal(wrapSlide(4, 4), 0);
  assert.equal(wrapSlide(9, 4), 1);
});

test('an index within the slide list remains unchanged', () => {
  assert.equal(wrapSlide(2, 4), 2);
});

test('an empty slide list keeps navigation at zero', () => {
  assert.equal(wrapSlide(1, 0), 0);
  assert.equal(wrapSlide(-1, 0), 0);
  assert.equal(wrapSlide(2, -1), 0);
});
