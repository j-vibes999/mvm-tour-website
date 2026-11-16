import test from 'node:test';
import assert from 'node:assert/strict';
import { searchDestinations, cleanSavedRefs, toggleSavedRef, buildInquiryText, inquiryContext } from '../dist/trip-tools.js';

test('search accepts Thai, English, aliases, region and interest', () => {
  assert.ok(searchDestinations({query:'วังเวียง'}).some(x=>x.kind==='province'&&x.province.id==='vientiane-province'));
  assert.ok(searchDestinations({query:'KUANG SI'}).some(x=>x.ref==='luang-prabang/kuang-si'));
  assert.ok(searchDestinations({query:'vang-vieng',region:'central'}).length);
  assert.equal(searchDestinations({query:'Kuang Si',region:'south'}).length,0);
  assert.ok(searchDestinations({interest:'waterfall'}).every(x=>x.place?.type==='waterfall'));
  assert.equal(searchDestinations({query:'<script>madeup987</script>'}).length,0);
});
test('saved references reject stale/corrupt input, deduplicate and toggle', () => {
  assert.deepEqual(cleanSavedRefs(null),[]);
  assert.deepEqual(cleanSavedRefs(['bad','luang-prabang/kuang-si','luang-prabang/kuang-si',{}]),['luang-prabang/kuang-si']);
  assert.deepEqual(toggleSavedRef([], 'luang-prabang/kuang-si'),['luang-prabang/kuang-si']);
  assert.deepEqual(toggleSavedRef(['luang-prabang/kuang-si'], 'luang-prabang/kuang-si'),[]);
  assert.deepEqual(toggleSavedRef([], 'unknown/unknown'),[]);
});
test('inquiry keeps the actual package or selected places and states sample status', () => {
  const context=inquiryContext('package','luang-prabang-discovery');
  const th=buildInquiryText({context,lang:'th',travelers:4,date:'2026-12-10',notes:'มีผู้สูงอายุ'});
  assert.match(th,/หลวงพระบาง/);assert.match(th,/4/);assert.match(th,/2026-12-10/);assert.match(th,/มีผู้สูงอายุ/);assert.match(th,/ตัวอย่าง/);
  const en=buildInquiryText({context:inquiryContext('saved','',['luang-prabang/kuang-si']),lang:'en',travelers:2});
  assert.match(en,/Kuang Si/);assert.match(en,/2/);assert.match(en,/not a booking/i);
  assert.equal(inquiryContext('package','missing').kind,'custom');
});

test('inquiry channels reject unsafe configuration and encode a message', async () => {
  const {inquiryChannelHref}=await import('../dist/trip-tools.js');
  assert.equal(inquiryChannelHref('email',{email:'x\n@example.com'},'hello'),'');
  assert.equal(inquiryChannelHref('whatsapp',{whatsapp:'javascript:bad'},'hello'),'');
  assert.match(inquiryChannelHref('whatsapp',{whatsapp:'+856 20 1234 5678'},'Kuang Si & Laos'),/wa\.me\/8562012345678\?text=Kuang%20Si%20%26%20Laos/);
  assert.match(inquiryChannelHref('line',{line:'@mvm'},'test'),/oaMessage\/%40mvm\/\?test/);
});

test('route map links preserve actual selected places without fabricating coordinates', async () => {
  const {routeMapHref}=await import('../dist/trip-tools.js');
  const url=new URL(routeMapHref(['luang-prabang/wat-xieng-thong','luang-prabang/kuang-si']));
  assert.equal(url.hostname,'www.google.com');
  assert.equal(url.searchParams.get('api'),'1');
  assert.match(url.searchParams.get('origin'),/Xieng Thong/);
  assert.match(url.searchParams.get('destination'),/Kuang Si/);
  assert.equal(routeMapHref(['missing/place']), '');
});
