import * as C from './content.js';
import { homeDestinations } from './home-discovery.js';
import { languages, localizeContent } from './i18n.js';

// Complete control labels; interpolated values remain plain text for the renderer.
export const cityDeckCopy = {
  close: { th: 'ปิด', lo: 'ປິດ', en: 'Close', zh: '关闭' },
  previous: { th: 'เมืองก่อนหน้า', lo: 'ເມືອງກ່ອນໜ້າ', en: 'Previous city', zh: '上一个目的地' },
  next: { th: 'เมืองถัดไป', lo: 'ເມືອງຖັດໄປ', en: 'Next city', zh: '下一个目的地' },
  showPhoto: { th: 'ดูภาพเมือง', lo: 'ເບິ່ງຮູບເມືອງ', en: 'Show photo', zh: '查看照片' },
  showDetails: { th: 'ดูรายละเอียด', lo: 'ເບິ່ງລາຍລະອຽດ', en: 'Show details', zh: '查看详情' },
  explore: { th: 'สำรวจต่อ', lo: 'ສຳຫຼວດຕໍ່', en: 'Explore', zh: '继续探索' },
  chooseCity: { th: 'เลือกเมือง', lo: 'ເລືອກເມືອງ', en: 'Choose a city', zh: '选择目的地' },
  exploreCity: { th: 'ดูรายละเอียด{name}', lo: 'ເບິ່ງລາຍລະອຽດ{name}', en: 'Explore {name}', zh: '探索{name}' },
  highlights: { th: 'ไฮไลต์', lo: 'ຈຸດເດັ່ນ', en: 'Highlights', zh: '游览亮点' },
  bestTime: { th: 'ช่วงเวลาที่แนะนำ', lo: 'ຊ່ວງເວລາທີ່ແນະນຳ', en: 'Best time to visit', zh: '推荐游览时间' },
  timeNeeded: { th: 'เวลาที่แนะนำ', lo: 'ເວລາທີ່ແນະນຳ', en: 'Suggested duration', zh: '建议停留时长' },
  position: { th: '{index} จาก {total}', lo: '{index} ຈາກ {total}', en: '{index} of {total}', zh: '第{index}个，共{total}个' },
  open: { th: 'ดูรายละเอียด{name}', lo: 'ເບິ່ງລາຍລະອຽດ{name}', en: 'Details for {name}', zh: '查看{name}详情' },
};

// Short introductions for the viewer; the complete guide keeps its original copy.
const cityOverviews = {
  'vientiane-capital': {
    th: 'เมืองหลวงริมแม่น้ำโขง ชมพระธาตุหลวง ประตูชัย และวัดเก่า ก่อนเดินเล่นริมน้ำในยามเย็น',
    lo: 'ນະຄອນຫຼວງລຽບແມ່ນ້ຳຂອງ ຊົມພະທາດຫຼວງ ປະຕູໄຊ ແລະ ວັດເກົ່າ ກ່ອນຍ່າງຫຼິ້ນລຽບນ້ຳໃນຍາມແລງ.',
    en: 'Discover golden Pha That Luang, Patuxai and old temples, then enjoy an evening stroll beside the Mekong.',
    zh: '漫步湄公河畔的首都，探访金色的塔銮、凯旋门与古寺，再欣赏傍晚的河岸风光。',
  },
  'vang-vieng': {
    th: 'เมืองเล็กริมแม่น้ำซองที่โอบล้อมด้วยภูเขาหินปูน ทุ่งนา และถ้ำ เลือกพายเรือหรือเดินขึ้นจุดชมวิว',
    lo: 'ເມືອງນ້ອຍລຽບແມ່ນ້ຳຊອງ ໂອບລ້ອມດ້ວຍພູຫີນປູນ ທົ່ງນາ ແລະ ຖ້ຳ ເລືອກພາຍເຮືອ ຫຼື ຍ່າງຂຶ້ນຈຸດຊົມວິວ.',
    en: 'A small Nam Song town among limestone peaks, rice fields and caves, with kayaking and trails to mountain viewpoints.',
    zh: '南松河畔的小镇，石灰岩群峰、稻田与洞穴相伴。可以划皮艇，也可以徒步登高赏景。',
  },
  'luang-prabang': {
    th: 'ชมวัดและบ้านเก่าในเมืองมรดกโลกระหว่างแม่น้ำโขงกับแม่น้ำคาน แล้วสัมผัสวิถีตักบาตรยามเช้าอย่างให้เกียรติ',
    lo: 'ຊົມວັດ ແລະ ເຮືອນເກົ່າໃນເມືອງມໍລະດົກໂລກລະຫວ່າງແມ່ນ້ຳຂອງກັບແມ່ນ້ຳຄານ ແລະ ເບິ່ງການຕັກບາດຍາມເຊົ້າຢ່າງເຄົາລົບ.',
    en: 'Explore temples and old houses between the Mekong and Nam Khan, in a town listed as a World Heritage Site in 1995.',
    zh: '漫步湄公河与南康河之间的古城，探访寺庙和老屋，静静感受清晨布施的传统。这里于1995年列入世界遗产名录。',
  },
  'nong-khiaw': {
    th: 'พักริมแม่น้ำอูท่ามกลางภูเขาหินปูนสูงชัน ชมวิวจากสะพาน หรือเดินขึ้นผาแดงมองแม่น้ำที่คดเคี้ยวผ่านหุบเขา',
    lo: 'ພັກລຽບແມ່ນ້ຳອູທ່າມກາງພູຫີນປູນສູງຊັນ ຊົມວິວຈາກຂົວ ຫຼື ຍ່າງຂຶ້ນຜາແດງເບິ່ງແມ່ນ້ຳທີ່ຄົດຄ້ຽວຜ່ານຮ່ອມພູ.',
    en: 'Stay beside the Nam Ou among steep limestone peaks. Take in bridge views or hike Pha Daeng to see the river wind through the valley.',
    zh: '在陡峭的石灰岩群峰间放慢脚步，从南欧江大桥赏景，或登上帕登观景点，俯瞰蜿蜒穿过山谷的河流。',
  },
  'muang-ngoi': {
    th: 'นั่งเรือจากหนองเขียวสู่หมู่บ้านริมแม่น้ำอู เดินชมทุ่งนา ถ้ำ และวิวจากผาน้อย หรือพักมองสายน้ำท่ามกลางขุนเขา',
    lo: 'ນັ່ງເຮືອຈາກໜອງຂຽວສູ່ບ້ານລຽບແມ່ນ້ຳອູ ຊົມທົ່ງນາ ຖ້ຳ ແລະ ວິວຈາກຜານ້ອຍ ຫຼື ພັກເບິ່ງສາຍນ້ຳທ່າມກາງພູເຂົາ.',
    en: 'Reach this Nam Ou village by boat from Nong Khiaw. Explore rice fields, caves and Phanoi views, or linger beside the river.',
    zh: '从农乔乘船来到南欧江畔的小村，漫步稻田、探访洞穴、登上帕诺伊观景点，也可以静静欣赏群山间的河流。',
  },
};
const cityDestinations = new Map();

export function cityText(lang, key, values = {}) {
  const value = cityDeckCopy[key]?.[lang] ?? cityDeckCopy[key]?.en;
  if (typeof value !== 'string') throw new Error(`Missing city deck copy: ${key}/${lang}`);
  return value.replace(/\{(\w+)\}/g, (token, name) => Object.hasOwn(values, name) ? String(values[name]) : token);
}

export function getCityDestination(id) {
  if (cityDestinations.has(id)) return cityDestinations.get(id);
  const item = homeDestinations.find(destination => destination.id === id);
  if (!item) return null;

  const [, , provinceId, placeId] = item.href.split('/');
  const province = C.findProvince(provinceId);
  const ref = placeId ? `${provinceId}/${placeId}` : null;
  const place = ref ? C.findPlace(ref)?.place ?? null : null;
  const detail = ref ? C.placeDetails[ref] ?? null : null;
  const highlights = detail
    ? detail.highlights.en.slice(0, 3).map((_, index) => Object.fromEntries(languages.map(lang => [lang, detail.highlights[lang]?.[index]])))
    : province.places.slice(0, 3).map(landmark => landmark.name);

  // Browser translations load on demand, so derived highlight objects join that lifecycle.
  localizeContent(highlights);

  const destination = {
    item,
    province,
    place,
    detail,
    intro: detail?.about ?? province.intro,
    overview: cityOverviews[id],
    highlights,
    facts: detail ? [
      { icon: 'sun', key: 'bestTime', value: detail.best },
      { icon: 'clock', key: 'timeNeeded', value: detail.time },
    ] : [],
  };
  cityDestinations.set(id, destination);
  return destination;
}
