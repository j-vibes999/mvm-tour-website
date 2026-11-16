import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let S = {};
try { S = await import('../scripts/build-static.mjs'); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error; }

test('static attraction pages contain localized content, distinct share metadata and language alternatives without JavaScript', async () => {
  assert.equal(typeof S.buildStatic, 'function', 'static site builder is available');
  const outDir = await mkdtemp(join(tmpdir(), 'mvm-static-test-'));
  try {
    await S.buildStatic({ outDir, siteUrl: 'https://travel.example/' });
    const html = await readFile(join(outDir, 'en/province/luang-prabang/kuang-si/index.html'), 'utf8');
    assert.match(html, /<html lang="en">/);
    // Relative requests must resolve at the domain root even on a direct attraction load.
    let assetBase = 'https://travel.example/en/province/luang-prabang/kuang-si/';
    let appUrl;
    for (const tag of html.matchAll(/<(?:base|script)\b[^>]*>/g)) {
      const href = tag[0].match(/href="([^"]+)"/)?.[1];
      if (tag[0].startsWith('<base') && href) assetBase = new URL(href, assetBase).href;
      const src = tag[0].match(/src="([^"]+)"/)?.[1];
      if (src && /^assets\/js\/app-[a-zA-Z0-9]+\.js$/.test(src)) appUrl = new URL(src, assetBase).href;
    }
    assert.match(appUrl, /^https:\/\/travel\.example\/assets\/js\/app-[a-zA-Z0-9]+\.js$/);
    assert.match(html, /<title>Kuang Si Falls · Luang Prabang \| MVM Group<\/title>/);
    assert.match(html, /rel="canonical" href="https:\/\/travel\.example\/en\/province\/luang-prabang\/kuang-si\/"/);
    assert.match(html, /hreflang="th" href="https:\/\/travel\.example\/th\/province\/luang-prabang\/kuang-si\/"/);
    assert.match(html, /property="og:locale" content="en_US"/);
    assert.match(html, /property="og:image" content="[^"]*(?:kuang-si|Kuang_Si)/);
    assert.match(html, /<main[^>]*>[\s\S]*<h1>Kuang Si Falls<\/h1>/);
    assert.match(html, /Tiered limestone falls in the forest/);
    assert.match(html, /href="\/en\/province\/luang-prabang\/"/);
    assert.doesNotMatch(html, /\[เบอร์โทร\]|"telephone":""/);
    const credits = await readFile(join(outDir, 'en/credits/index.html'), 'utf8');
    assert.match(credits, /Phongsali1\.jpg/);
    assert.doesNotMatch(credits, /href=""/);
    const packagePage = await readFile(join(outDir, 'en/package/vang-vieng-nature/index.html'), 'utf8');
    assert.match(packagePage, /Settle into Vang Vieng/);
    const about = await readFile(join(outDir, 'en/about/index.html'), 'utf8');
    assert.match(about, /Are the displayed prices confirmed booking prices/);
    const faq = await readFile(join(outDir, 'en/faq/index.html'), 'utf8');
    assert.match(faq, /<h1>Frequently asked questions<\/h1>/);
    assert.match(faq, /Are the displayed prices confirmed booking prices/);
    const notFound = await readFile(join(outDir, '404.html'), 'utf8');
    assert.match(notFound, /name="robots" content="noindex,follow"/);
    const sitemap = await readFile(join(outDir, 'sitemap.xml'), 'utf8');
    assert.match(sitemap, /https:\/\/travel\.example\/en\/province\/luang-prabang\/kuang-si\//);
    assert.doesNotMatch(sitemap, /\/saved\/|\/inquiry\/|\?place=/);
    const inquiry = await readFile(join(outDir, 'th/inquiry/index.html'), 'utf8');
    assert.match(inquiry, /name="robots" content="noindex,follow"/);
    const robots = await readFile(join(outDir, 'robots.txt'), 'utf8');
    assert.match(robots, /Sitemap: https:\/\/travel\.example\/sitemap\.xml/);
    const root = await readFile(join(outDir, 'index.html'), 'utf8');
    assert.match(root, /href="\/th\/"/);
    assert.match(root, /rel="canonical" href="https:\/\/travel\.example\/th\/"/);
    await readFile(join(outDir, 'assets/favicon.svg'));
  } finally { await rm(outDir, { recursive: true, force: true }); }
});

test('static offers and programs show destination prices, daily activities and credited destination photos without JavaScript', async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'mvm-static-packages-'));
  try {
    await S.buildStatic({ outDir, siteUrl: 'https://travel.example/' });
    const offers = [
      ['vientiane-capital-discovery', 'นครหลวงเวียงจันทน์', 'Vientiane Capital', '2,900'],
      ['vang-vieng-nature', 'วังเวียง', 'Vang Vieng', '4,900'],
      ['luang-prabang-discovery', 'หลวงพระบาง', 'Luang Prabang', '5,900'],
      ['nong-khiaw-discovery', 'หนองเขียว', 'Nong Khiaw', '6,500'],
      ['muang-ngoi-discovery', 'เมืองงอย', 'Muang Ngoi', '6,900'],
      ['champasak-discovery', 'จำปาสัก', 'Champasak', '8,900'],
    ];
    const programs = [
      {
        id: 'nong-khiaw-discovery', th: 'หนองเขียว', en: 'Nong Khiaw', price: '6,500', photo: 'nong-khiaw', author: 'Ekrem Canli',
        activities: {
          th: ['เดินชมตัวเมืองและวิวภูเขาจากสะพานข้ามแม่น้ำอู', 'เลือกเดินขึ้นผาแดงตามสภาพอากาศและความพร้อมของร่างกาย', 'เลือกเดินเล่นในเมืองหรือชมแม่น้ำอูตามเวลาที่เหลือ'],
          en: ['Explore town and mountain views from the Nam Ou bridge', 'Choose the Pha Daeng climb according to conditions and fitness', 'Choose a town walk or Nam Ou views in your remaining time'],
        },
      },
      {
        id: 'muang-ngoi-discovery', th: 'เมืองงอย', en: 'Muang Ngoi', price: '6,900', photo: 'muang-ngoi', author: 'Christophe95',
        activities: {
          th: ['เดินทางผ่านหนองเขียวและชมทิวทัศน์แม่น้ำอูระหว่างทางเรือ', 'สอบถามสภาพทางก่อนเลือกเดินไปบริเวณถ้ำกาง', 'เดินชมหมู่บ้านหรือพักริมแม่น้ำตามเวลาที่มี'],
          en: ['Travel via Nong Khiaw and enjoy Nam Ou scenery on the boat journey', 'Ask about trail conditions before walking toward Kaang Cave', 'Walk through the village or relax by the river as time allows'],
        },
      },
    ];
    for (const lang of ['th', 'en']) {
      const priceText = amount => lang === 'th' ? `ราคาตัวอย่าง ${amount} บาท / ท่าน` : `Example price THB ${amount} / person`;
      const listing = await readFile(join(outDir, lang, 'packages/index.html'), 'utf8');
      const listMain = listing.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || '';
      const rows = [...listMain.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(match => match[1]);
      for (const [id, th, en, price] of offers) {
        const row = rows.find(value => value.includes(`href="/${lang}/package/${id}/"`));
        assert.ok(row, `${lang}: static offer for ${id}`);
        assert.ok(row.includes(lang === 'th' ? th : en), `${id}: visible destination`);
        assert.ok(row.includes(priceText(price)), `${id}: formatted example price per person`);
      }
      for (const program of programs) {
        const html = await readFile(join(outDir, lang, 'package', program.id, 'index.html'), 'utf8');
        const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || '';
        assert.ok(main.includes(`<h1>${program[lang]}</h1>`), `${program.id}: destination heading`);
        assert.ok(main.includes(priceText(program.price)), `${program.id}: sample price in page content`);
        assert.ok(main.includes(`src="assets/images/photos/${program.photo}-960.webp"`), `${program.id}: correct destination photo in page content`);
        assert.match(main, new RegExp(`<figcaption>[\\s\\S]*?${program.author}[\\s\\S]*?CC BY-SA 4\\.0[\\s\\S]*?<\\/figcaption>`));
        assert.ok(html.includes(`property="og:image" content="https://travel.example/assets/images/photos/${program.photo}-960.webp"`), `${program.id}: destination share image`);
        assert.match(main, lang === 'th' ? /<h3>วันที่ 3 ·/ : /<h3>Day 3 ·/);
        for (const activity of program.activities[lang]) assert.ok(main.includes(`<li>${activity}</li>`), `${program.id}: daily activity ${activity}`);
        assert.ok(main.includes(lang === 'th' ? 'ยืนยันเส้นทาง บริการ และราคากับทีมงานก่อนจอง' : 'Confirm the route, services and price with the team before booking.'), `${program.id}: inquiry disclaimer`);
        assert.ok(main.includes(`href="/${lang}/inquiry/?kind=package&amp;ref=${program.id}"`), `${program.id}: inquiry keeps program identity`);
      }
    }
  } finally { await rm(outDir, { recursive: true, force: true }); }
});

test('untrusted site origins cannot create malformed SEO URLs or protocol-relative metadata', () => {
  assert.equal(typeof S.normalizeSiteUrl, 'function', 'site URL validator is available');
  assert.throws(() => S.normalizeSiteUrl('javascript:alert(1)'), /https?:/i);
  assert.throws(() => S.normalizeSiteUrl('https://user:secret@example.org/'), /credentials/i);
  assert.equal(S.normalizeSiteUrl('https://example.org/?preview=1#x'), 'https://example.org/');
});
