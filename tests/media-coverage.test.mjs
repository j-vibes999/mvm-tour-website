import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { provinces, photos as originalPhotos, images } from '../dist/content.js';
import { extraPhotos, placePhotos, localPhotos } from '../dist/complete-media.js';
const photos = {...originalPhotos,...extraPhotos};

test('every listed destination has its own resolvable raster image', () => {
  let covered=0;
  for(const province of provinces)for(const place of province.places){
    const ref=`${province.id}/${place.id}`,key=place.photo||placePhotos[ref]||place.image;
    assert.ok(key,`${ref}: image required`);
    assert.ok(photos[key]||images[key],`${ref}: known image metadata`);
    if(photos[key]){
      const local=localPhotos[key];assert.ok(local,`${ref}: local optimized images`);
      assert.ok(local.widths.length>=2,`${ref}: responsive sizes`);
      for(const candidate of local.srcset.split(', ')){
        const [file,width]=candidate.split(' ');assert.ok(existsSync(new URL('../dist/'+file,import.meta.url)),`${ref}: ${file}`);
        assert.ok(Number.parseInt(width,10)<=local.w,`${ref}: no upscaling`);
        const bytes=readFileSync(new URL('../dist/'+file,import.meta.url));assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');
      }
    }
    covered++;
  }
  assert.equal(covered,86);
});

test('generated illustrations disclose their origin and document real-place references', () => {
  for(const [key,photo] of Object.entries(extraPhotos)){
    if(photo.kind!=='generated')continue;
    assert.match(photo.author,/AI|ImageGen/i,`${key}: honest origin`);
    assert.match(photo.license,/illustration|generated/i,`${key}: separate from photography`);
    assert.ok(photo.referenceUrls?.length,`${key}: location evidence`);
    for(const url of photo.referenceUrls)assert.match(url,/^https:\/\//);
    assert.ok(localPhotos[key],`${key}: visible image available`);
    assert.ok(!/CC BY|Public domain/.test(photo.license),`${key}: no inherited reference-photo license claim`);
  }
});
