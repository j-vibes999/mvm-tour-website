import { test } from 'node:test';
import assert from 'node:assert/strict';
import { travelCopy, travelText, inquiryInterests, interestKey } from '../dist/travel-copy.js';
import { buildInquiryText, inquiryContext, monthLabel } from '../dist/trip-tools.js';
import { savedTripMatches, savedTripsHtml } from '../dist/planning-ui.js';
import * as C from '../dist/content.js';

const thaiScript = /[฀-๿]/;

test('every planning message has reviewed Thai, Lao, English and Chinese text', () => {
  for (const [key, value] of Object.entries(travelCopy)) {
    for (const lang of ['th', 'lo', 'en', 'zh']) assert.ok(typeof value[lang] === 'string' && value[lang].trim(), `${key}/${lang}`);
    assert.doesNotMatch(value.lo, thaiScript, `${key}: Lao text must not fall back to Thai`);
    assert.doesNotMatch(value.zh, thaiScript, `${key}: Chinese text must not fall back to Thai`);
    const tokens = text => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort().join();
    for (const lang of ['th', 'lo', 'zh']) assert.equal(tokens(value[lang]), tokens(value.en), `${key}/${lang}: same placeholders`);
  }
  for (const id of inquiryInterests) assert.ok(travelCopy[interestKey(id)], id);
});

test('a chosen month and interests reach the inquiry in the traveller\'s language', () => {
  const context = inquiryContext('package', 'luang-prabang-discovery');
  const th = buildInquiryText({ context, lang: 'th', month: '2027-01', interests: ['food', 'nature'], travelers: 3 });
  assert.match(th, /มกราคม 2570/, 'Thai uses the Buddhist year');
  assert.ok(th.includes(`${travelText('th', 'interestsLine')}: ${travelText('th', 'interestNature')}, ${travelText('th', 'interestFood')}`), 'interests keep the form order');
  for (const lang of ['lo', 'zh']) {
    const message = buildInquiryText({ context, lang, month: '2027-01', interests: ['culture'], travelers: 2 });
    assert.doesNotMatch(message, thaiScript, `${lang}: no Thai fallback`);
    assert.ok(message.includes(travelText(lang, 'interestCulture')));
    assert.ok(message.includes(monthLabel('2027-01', lang)));
  }
  assert.match(buildInquiryText({ context, lang: 'en', month: '2027-01' }), /Preferred month: January 2027/);
  const dated = buildInquiryText({ context, lang: 'en', month: '2027-01', date: '2027-02-03' });
  assert.match(dated, /2027-02-03/);
  assert.doesNotMatch(dated, /Preferred month/, 'an exact date takes precedence over the month');
  assert.match(buildInquiryText({ context, lang: 'en', month: 'soon', interests: ['unknown'] }), /Flexible \/ to be confirmed/);
  assert.doesNotMatch(buildInquiryText({ context, lang: 'en', interests: ['unknown'] }), /Interests/);
  assert.equal(monthLabel('2027-13', 'en'), '');
});

test('saved places suggest only itineraries that already visit them, best match first', () => {
  const matches = savedTripMatches(['luang-prabang/kuang-si', 'luang-prabang/alms-giving', 'vientiane-province/vang-vieng']);
  assert.equal(matches[0].pk.id, 'luang-prabang-discovery');
  assert.deepEqual(matches[0].matched, ['luang-prabang/kuang-si', 'luang-prabang/alms-giving']);
  assert.ok(matches.some(item => item.pk.id === 'vang-vieng-nature'));
  for (const { pk, matched } of matches) {
    const stops = new Set([...(pk.routeStops || []), ...pk.itinerary.flatMap(day => day.stops || [])]);
    assert.ok(matched.every(ref => stops.has(ref)), `${pk.id}: every match is a real stop`);
  }
  assert.deepEqual(savedTripMatches(['luang-prabang/nong-khiaw']).map(item => item.pk.id).sort(), ['muang-ngoi-discovery', 'nong-khiaw-discovery']);
  const unmatched = C.provinces.flatMap(pv => pv.places.map(pl => `${pv.id}/${pl.id}`)).find(ref => !savedTripMatches([ref]).length);
  assert.ok(unmatched, 'some places are not on any itinerary');
  assert.equal(savedTripsHtml([unmatched], 'th'), '', 'no section without a real match');
  const html = savedTripsHtml(['luang-prabang/kuang-si'], 'en');
  assert.match(html, /href="\/en\/package\/luang-prabang-discovery\/"/);
  assert.match(html, /Includes 1 of your places: Kuang Si/);
});
