import test from 'node:test';
import assert from 'node:assert/strict';
import { packages, companyProfile, faq, findPlace } from '../dist/content.js';

const bilingual = (value, field) => {
  for (const language of ['th', 'en']) assert.ok(value?.[language]?.length, `${field}.${language}`);
};

test('the five requested destinations have separate example-priced programs', () => {
  const expected=[
    ['vientiane-capital','vientiane-capital-discovery'],
    ['vang-vieng','vang-vieng-nature'],
    ['luang-prabang','luang-prabang-discovery'],
    ['nong-khiaw','nong-khiaw-discovery'],
    ['muang-ngoi','muang-ngoi-discovery'],
  ];
  for(const [destinationId,id] of expected){
    const trip=packages.find(item=>item.destinationId===destinationId);
    assert.ok(trip,`${destinationId}: separate program`);assert.equal(trip.id,id);
    assert.ok(Number.isFinite(trip.price)&&trip.price>0);assert.equal(trip.priceStatus,'example');bilingual(trip.destination,`${id}.destination`);
    assert.ok(trip.itinerary.every(day=>day.activities?.th?.length&&day.activities?.en?.length),`${id}: day activities`);
  }
});

test('sample packages distinguish suggestions and prices from an agreed booking', () => {
  for (const trip of packages) {
    assert.equal(trip.priceStatus, 'example', trip.id);
    assert.equal(trip.currency, 'THB', trip.id);
    assert.equal(trip.itineraryStatus, 'suggestion', trip.id);
    for (const field of ['priceBasis', 'itineraryNote', 'suitability', 'activityLevel']) bilingual(trip[field], `${trip.id}.${field}`);
    bilingual(trip.quoteDetails.confirmed, `${trip.id}.confirmed`);
    bilingual(trip.quoteDetails.toConfirm, `${trip.id}.toConfirm`);
    for (const language of ['th', 'en']) assert.ok(trip.quoteDetails.toConfirm[language].length >= 5, `${trip.id} quote checklist`);
  }
});

test('day-by-day suggestions cover each day and refer only to existing places', () => {
  for (const trip of packages) {
    assert.equal(trip.itinerary.length, trip.days, trip.id);
    assert.deepEqual(trip.itinerary.map(day => day.day), Array.from({ length: trip.days }, (_, index) => index + 1));
    const stops = trip.itinerary.flatMap(day => day.stops);
    assert.deepEqual(trip.routeStops, [...new Set(stops)], `${trip.id} route order`);
    for (const day of trip.itinerary) {
      bilingual(day.title, `${trip.id}.day${day.day}.title`);
      bilingual(day.summary, `${trip.id}.day${day.day}.summary`);
      assert.ok(day.stops.length, `${trip.id}.day${day.day} has places`);
      for (const ref of day.stops) {
        const result = findPlace(ref);
        assert.ok(result, `${trip.id}: ${ref}`);
        assert.equal(result.province.id, trip.provinceId, `${trip.id}: ${ref} belongs to the trip province`);
      }
    }
  }
});

test('company profile keeps factual owner data editable and FAQs are bilingual', () => {
  bilingual(companyProfile.title, 'companyProfile.title');
  bilingual(companyProfile.intro, 'companyProfile.intro');
  for (const field of ['legalName', 'registration', 'tourLicence']) assert.equal(typeof companyProfile.ownerData[field], 'string');
  for (const field of ['team', 'fleet', 'reviews']) assert.ok(Array.isArray(companyProfile.ownerData[field]));
  assert.ok(faq.length >= 4);
  assert.equal(new Set(faq.map(item => item.id)).size, faq.length);
  for (const item of faq) {
    bilingual(item.question, `faq.${item.id}.question`);
    bilingual(item.answer, `faq.${item.id}.answer`);
  }
});
