import {test} from 'node:test';
import assert from 'node:assert/strict';
import {moveSavedPlace, mapRouteBatches} from '../dist/travel-planning.js';
import {recommendedMonths, placesForMonth, dayStoryStops} from '../dist/discovery.js';
import * as C from '../dist/content.js';

test('saved places move to the requested position without mutating or losing the list',()=>{
 const refs=['luang-prabang/kuang-si','vientiane-province/vang-vieng','luang-prabang/nong-khiaw'];
 assert.deepEqual(moveSavedPlace(refs,refs[2],0),[refs[2],refs[0],refs[1]]);
 assert.deepEqual(moveSavedPlace(refs,refs[0],99),[refs[1],refs[2],refs[0]]);
 assert.deepEqual(moveSavedPlace(refs,'missing',0),refs);
 assert.deepEqual(moveSavedPlace(refs,refs[0],-1),refs);
 assert.deepEqual(refs,['luang-prabang/kuang-si','vientiane-province/vang-vieng','luang-prabang/nong-khiaw']);
});

test('map batches include every saved stop and connect adjacent batches',()=>{
 const refs=Array.from({length:12},(_,i)=>`province/place-${i}`);
 const batches=mapRouteBatches(refs);
 assert.ok(batches.every(batch=>batch.length<=5));
 assert.deepEqual([...new Set(batches.flat())],refs);
 assert.equal(batches[0].at(-1),batches[1][0]);
 assert.deepEqual(mapRouteBatches([]),[]);
 assert.deepEqual(mapRouteBatches(['province/place']),[['province/place']]);
});

test('season recommendations use stated month ranges, including ranges across New Year',()=>{
 assert.ok(placesForMonth(1).some(item=>item.ref==='luang-prabang/nong-khiaw'));
 assert.ok(placesForMonth(10).some(item=>item.ref==='champasak/khone-phapheng'));
 assert.ok(!placesForMonth(7).some(item=>item.ref==='luang-prabang/muang-ngoi'));
 assert.deepEqual(placesForMonth(6),[],'a lack of month-specific data is returned as empty, not a travel ban or invented recommendation');
 for(const[ref,months]of Object.entries(recommendedMonths)){
  assert.ok(C.findPlace(ref),ref);assert.ok(C.placeDetails[ref]?.best);
  assert.ok(months.length&&months.every(month=>Number.isInteger(month)&&month>=1&&month<=12));
 }
});

test('the Luang Prabang day story links to existing places and their practical information',()=>{
 assert.equal(dayStoryStops.length,5);
 for(const item of dayStoryStops){assert.ok(item.ref.startsWith('luang-prabang/'));assert.ok(C.findPlace(item.ref));assert.ok(C.placeDetails[item.ref]?.best);}
});
