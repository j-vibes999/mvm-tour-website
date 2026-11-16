import { localizeContent } from './i18n.js';
// Homepage selections use the licensed, locally cached real photographs in complete-media.js.
// Keep these routes aligned with the existing province, place and exploration pages.
// Use varied photographs where they match the linked destination; shared place previews may repeat intentionally.
export const homeDestinations = [
  {
    id: 'vientiane-capital',
    name: { th: 'เวียงจันทน์', en: 'Vientiane' },
    summary: { th: 'ชมพระธาตุสีทอง แล้วเดินเล่นริมโขง', en: 'Golden temples and easy Mekong-side strolls' },
    photo: 'that-luang', href: '#/province/vientiane-capital',
  },
  {
    id: 'vang-vieng',
    name: { th: 'วังเวียง', en: 'Vang Vieng' },
    summary: { th: 'ขุนเขาหินปูน สายน้ำ และทุ่งสีเขียว', en: 'Limestone peaks, open fields and the Nam Song' },
    photo: 'nam-song', href: '#/province/vientiane-province/vang-vieng',
  },
  {
    id: 'luang-prabang',
    name: { th: 'หลวงพระบาง', en: 'Luang Prabang' },
    summary: { th: 'เมืองเก่า วัดงาม และยามเย็นริมแม่น้ำ', en: 'Old-town temples and evenings by the river' },
    photo: 'royal-palace', href: '#/province/luang-prabang',
  },
  {
    id: 'nong-khiaw',
    name: { th: 'หนองเขียว', en: 'Nong Khiaw' },
    summary: { th: 'ชมแม่น้ำอูท่ามกลางภูเขาหินปูน', en: 'Follow the Nam Ou through limestone mountains' },
    photo: 'nong-khiaw', href: '#/province/luang-prabang/nong-khiaw',
  },
  {
    id: 'muang-ngoi',
    name: { th: 'เมืองงอย', en: 'Muang Ngoi' },
    summary: { th: 'พักในหมู่บ้านเล็ก ท่ามกลางภูเขาและสายน้ำ', en: 'Slow village days between mountains and water' },
    photo: 'muang-ngoi', href: '#/province/luang-prabang/muang-ngoi',
  },
];

export const homeStyles = [
  {
    id: 'nature',
    name: { th: 'ธรรมชาติ', en: 'Into nature' },
    summary: { th: 'ภูเขา ป่าเขียว และหมู่บ้านกลางหุบเขา', en: 'Green mountains and villages tucked into valleys' },
    photo: 'nam-ha-forest', href: '#/explore?interest=nature',
  },
  {
    id: 'culture',
    name: { th: 'เมืองและวัฒนธรรม', en: 'Local culture' },
    summary: { th: 'สัมผัสวิถีชีวิตและประเพณีอย่างให้เกียรติ', en: 'Discover local traditions with care and respect' },
    photo: 'vat-phou', href: '#/explore?interest=culture',
  },
  {
    id: 'riverside',
    name: { th: 'พักผ่อนริมน้ำ', en: 'By the river' },
    summary: { th: 'ตามหามุมสงบข้างแม่น้ำสายสวย', en: 'Find a quiet moment beside the water' },
    // There is no river place type. The existing bilingual search finds six riverside nature places.
    photo: 'sekong-river', href: '#/explore?interest=nature&q=%E0%B9%81%E0%B8%A1%E0%B9%88%E0%B8%99%E0%B9%89%E0%B8%B3',
  },
  {
    id: 'activity',
    name: { th: 'กิจกรรมกลางแจ้ง', en: 'Outdoor activities' },
    summary: { th: 'ชมวิวจากมุมใหม่ ทั้งบนฟ้าและสายน้ำ', en: 'See Laos from the air or along the river' },
    photo: 'balloon', href: '#/explore?interest=activity',
  },
];

export const homeMoments = [
  {
    id: 'old-town-evening',
    name: { th: 'เดินช้า ๆ ในค่ำคืนเมืองเก่า', en: 'An old-town evening' },
    summary: { th: 'แสงไฟจากวัดและแผงงานฝีมือ ชวนให้เดินชมหลวงพระบางอีกสักหน่อย', en: 'Temple lights and craft stalls invite one more stroll through Luang Prabang.' },
    photo: 'lp-night-market', href: '#/province/luang-prabang/night-market',
  },
  {
    id: 'mekong-evening',
    name: { th: 'ปล่อยเวลาไปกับสายน้ำ', en: 'Let the river set the pace' },
    summary: { th: 'เรือลำเล็ก เมฆยามเย็น และความสงบระหว่างเกาะที่สี่พันดอน', en: 'A small boat, evening clouds and quiet water between the islands of Si Phan Don.' },
    photo: 'si-phan-don', href: '#/province/champasak/si-phan-don',
  },
  {
    id: 'coffee-country',
    name: { th: 'รู้จักกาแฟตั้งแต่บนต้น', en: 'Where your coffee begins' },
    summary: { th: 'แวะดูผลกาแฟท่ามกลางใบเขียว แล้วทำความรู้จักแหล่งปลูกที่ปากซอง', en: 'Look closer at coffee cherries and discover Paksong, in the heart of Lao coffee country.' },
    photo: 'paksong-coffee', href: '#/province/champasak/paksong-coffee',
  },
];

// Keep this compact trip selection focused on the capital, Vang Vieng and the south.
// The separate Luang Prabang day-story module is integrated by the homepage renderer.
export const homeTripIds = [
  'vientiane-capital-discovery',
  'vang-vieng-nature',
  'champasak-discovery',
];

localizeContent({ homeDestinations, homeStyles, homeMoments });
