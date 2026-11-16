import { localizeContent } from './i18n.js';

// ─────────────────────────────────────────────────────────────
// เนื้อหาของเว็บไซต์ MVM Group (แก้ข้อความ/ข้อมูลติดต่อได้ที่ไฟล์นี้)
// ─────────────────────────────────────────────────────────────

const NB = ' '; // ช่องว่างไม่ตัดบรรทัด ใช้หน้า "ๆ"

// ข้อมูลติดต่อ: ใส่ค่าจริงก่อนเปิดใช้งาน ไม่ใช้เลข/บัญชีตัวอย่างเป็นช่องทางติดต่อ
export const site = {
  name: 'MVM Group',
  contact: {
    line: '', // เช่น '@mvmgroup'  → ลิงก์ https://line.me/R/ti/p/@mvmgroup
    whatsapp: '', // เช่น '8562012345678' (ตัวเลขล้วน มีรหัสประเทศ)
    phone: '', // เช่น '+856 20 1234 5678'
    email: '', // เช่น 'hello@mvmgroup.la'
    facebook: '', // เช่น 'https://www.facebook.com/mvmgroup'
    address: { th: '', en: '' },
  },
};

// ข้อมูลบริษัทที่ยืนยันแล้วมีเพียงชื่อ MVM Group ช่องข้อมูลจริงด้านล่างรอเจ้าของบริษัทเติม
// ห้ามสร้างประวัติบริษัท ใบอนุญาต บุคลากร รถ หรือรีวิวขึ้นเอง
export const companyProfile = {
  title: { th: 'รู้จัก MVM Group ผ่านการเดินทางที่คุณอยากไป', en: 'Discover Laos with MVM Group' },
  intro: {
    th: 'MVM Group นำเสนอจุดหมายท่องเที่ยวในประเทศลาวและตัวอย่างโปรแกรม เพื่อให้คุณเลือกเมือง สถานที่ และจังหวะการเดินทางที่สนใจ ก่อนเตรียมรายละเอียดสำหรับสอบถามการเดินทาง',
    en: 'MVM Group presents destinations across Laos and sample itineraries, helping you choose places and a travel pace before preparing a trip inquiry.',
  },
  approach: [
    { title: { th: 'เริ่มจากสถานที่ที่คุณชอบ', en: 'Start with places you love' }, text: { th: 'สำรวจภาพและข้อมูลของแต่ละแขวง แล้วเก็บสถานที่ที่อยากไปไว้ด้วยกัน', en: 'Explore each province through its images and information, and collect places you would like to visit.' } },
    { title: { th: 'ใช้โปรแกรมเป็นแนวทาง', en: 'Use itineraries as a starting point' }, text: { th: 'โปรแกรมและราคาบนเว็บเป็นตัวอย่างสำหรับวางแผน ยังไม่ใช่การยืนยันบริการหรือราคาเดินทางจริง', en: 'Itineraries and prices are planning examples; they do not confirm services or the final cost of a trip.' } },
    { title: { th: 'ตกลงรายละเอียดก่อนยืนยัน', en: 'Agree the details before confirming' }, text: { th: 'วันเดินทาง จำนวนผู้เดินทาง จุดรับ–ส่ง ที่พัก และรายการที่รวม ต้องระบุในใบเสนอราคาที่ตกลงกัน', en: 'Travel dates, group size, pick-up, accommodation and inclusions need to be specified in an agreed quote.' } },
  ],
  ownerData: {
    // Add only an owner-approved message, real name/role and an authorised portrait.
    // Keep all four language fields; an empty message hides the welcome section.
    welcome: {
      message: { th: '', lo: '', en: '', zh: '' },
      name: { th: '', lo: '', en: '', zh: '' },
      role: { th: '', lo: '', en: '', zh: '' },
      image: '',
    },
    legalName: '',
    registration: '',
    tourLicence: '',
    officeAddress: { th: '', en: '' },
    serviceAreas: { th: [], en: [] },
    team: [], // { name: { th, en }, role: { th, en }, image: 'ชื่อรูป' }
    fleet: [], // { title: { th, en }, description: { th, en }, image: 'ชื่อรูป' }
    reviews: [], // { name, text: { th, en }, sourceUrl } ใช้รีวิวจริงที่ได้รับอนุญาตเท่านั้น
  },
};

export const faq = [
  { id: 'choose-destinations', question: { th: 'เริ่มเลือกเที่ยวลาวอย่างไรดี?', en: 'How do I start choosing places in Laos?' }, answer: { th: 'เริ่มจากหน้าสำรวจลาว เลือกภาคหรือแขวง หรือค้นหาชื่อเมืองและสถานที่ เปิดดูรายละเอียด แล้วเก็บสถานที่ที่สนใจไว้เตรียมแผนการเดินทาง', en: 'Open Explore Laos, choose a region or province, or search for a city or place. View its details and save places that interest you for your trip plan.' } },
  { id: 'sample-prices', question: { th: 'ราคาบนเว็บเป็นราคาจองจริงหรือไม่?', en: 'Are the displayed prices confirmed booking prices?' }, answer: { th: 'ราคาโปรแกรมที่แสดงเป็นราคาตัวอย่างหน่วยบาทต่อท่าน ใช้ประกอบการวางแผนเท่านั้น ราคาจริงขึ้นกับวันเดินทาง จำนวนคน ที่พัก การเดินทาง และรายการบริการที่ตกลงในใบเสนอราคา', en: 'The displayed programs show example prices in Thai baht per person for planning only. The final quote depends on dates, group size, stays, transport and the agreed services.' } },
  { id: 'prepare-inquiry', question: { th: 'ควรเตรียมข้อมูลอะไรสำหรับการสอบถามการเดินทาง?', en: 'What information should I prepare for an inquiry?' }, answer: { th: 'เตรียมสถานที่หรือโปรแกรมที่สนใจ วันเดินทางหรือช่วงวันที่ยืดหยุ่น จำนวนผู้ใหญ่และเด็ก จุดเริ่มต้นและปลายทาง ระดับที่พัก งบประมาณ และข้อจำกัดในการเดินทางที่อยากให้พิจารณา', en: 'Prepare your preferred places or program, dates or a flexible date range, adults and children, start and end points, accommodation preference, budget and any travel needs to consider.' } },
  { id: 'included-services', question: { th: 'โปรแกรมรวมรถ ที่พัก ตั๋ว และค่าเข้าชมหรือยัง?', en: 'Are transport, stays, tickets and entrance fees included?' }, answer: { th: 'ราคาในเว็บยังไม่ได้ยืนยันว่ารวมบริการใดบ้าง ควรตรวจสอบรถ จุดรับ–ส่ง ที่พัก อาหาร ตั๋ว ค่าเข้าชม และค่าใช้จ่ายอื่นในใบเสนอราคาก่อนยืนยันทุกครั้ง', en: 'The website examples do not confirm inclusions. Check transport, pick-up, stays, meals, tickets, entrance fees and other costs in the quote before confirming.' } },
  { id: 'saved-places', question: { th: 'สถานที่ที่เก็บไว้ส่งถึงบริษัทอัตโนมัติหรือไม่?', en: 'Are saved places automatically sent to the company?' }, answer: { th: 'ไม่ส่งอัตโนมัติ รายการเก็บไว้ในเบราว์เซอร์ที่ใช้งาน คุณสามารถใช้รายการนี้เตรียมข้อความสอบถาม แล้วเลือกส่งผ่านช่องทางติดต่อที่บริษัทเปิดใช้งาน', en: 'No. Saved places stay in the browser you are using. Use the list to prepare an inquiry, then choose an available company contact channel to send it.' } },
  { id: 'payment', question: { th: 'จองหรือชำระเงินผ่านเว็บไซต์ได้หรือไม่?', en: 'Can I book or pay on this website?' }, answer: { th: 'เว็บไซต์นี้ใช้ดูจุดหมาย โปรแกรมตัวอย่าง และเตรียมคำถามสำหรับการเดินทาง ยังไม่มีระบบยืนยันการจองหรือรับชำระเงินออนไลน์', en: 'This website lets you explore destinations, view sample programs and prepare a trip inquiry. It does not confirm bookings or accept online payments.' } },
];

export const regions = [
  {
    id: 'north',
    name: { th: 'ลาวเหนือ', en: 'Northern Laos' },
    tagline: { th: 'ขุนเขา ชนเผ่า และเมืองมรดกโลก', en: 'Mountains, hill peoples and a World Heritage town' },
    intro: {
      th: 'ดินแดนแห่งภูเขาสูงและสายน้ำ ตั้งแต่หลวงพระบางเมืองมรดกโลก ทุ่งไหหินแห่งเชียงขวาง ไปจนถึงหมู่บ้านชนเผ่าบนดอยทางเหนือสุดของประเทศ',
      en: 'High mountains and rivers — from World Heritage Luang Prabang and the Plain of Jars to hill-tribe villages in the far north.',
    },
  },
  {
    id: 'central',
    name: { th: 'ลาวกลาง', en: 'Central Laos' },
    tagline: { th: 'เมืองหลวงริมโขง ภูเขาหินปูน และถ้ำมหัศจรรย์', en: 'A riverside capital, karst peaks and remarkable caves' },
    intro: {
      th: 'จากนครหลวงเวียงจันทน์ริมแม่น้ำโขง สู่ภูเขาหินปูนแห่งวังเวียง ถ้ำกองลอ และเมืองเก่าสมัยอาณานิคมที่สะหวันนะเขต เดินทางจากไทยได้สะดวกหลายด่าน',
      en: 'From the Mekong-side capital to the limestone peaks of Vang Vieng, Kong Lor cave and colonial Savannakhet — with several easy crossings from Thailand.',
    },
  },
  {
    id: 'south',
    name: { th: 'ลาวใต้', en: 'Southern Laos' },
    tagline: { th: 'ปราสาทโบราณ น้ำตก และสี่พันดอน', en: 'Ancient temples, waterfalls and the 4,000 Islands' },
    intro: {
      th: 'มรดกโลกวัดพู ที่ราบสูงโบลาเวนกับไร่กาแฟและน้ำตกนับไม่ถ้วน และแม่น้ำโขงที่แผ่กว้างจนกลายเป็นหมู่เกาะสี่พันดอน',
      en: 'World Heritage Vat Phou, the coffee-and-waterfall Bolaven Plateau, and the Mekong spreading into the 4,000 Islands.',
    },
  },
];

// ประเภทสถานที่ (ใช้กำหนดไอคอนและป้าย)
export const placeTypes = {
  nature: { th: 'ธรรมชาติ', en: 'Nature' },
  waterfall: { th: 'น้ำตก', en: 'Waterfall' },
  cave: { th: 'ถ้ำ', en: 'Cave' },
  temple: { th: 'วัดและพระธาตุ', en: 'Temple' },
  history: { th: 'ประวัติศาสตร์', en: 'History' },
  culture: { th: 'วัฒนธรรม', en: 'Culture' },
  activity: { th: 'กิจกรรม', en: 'Activity' },
  viewpoint: { th: 'จุดชมวิว', en: 'Viewpoint' },
  market: { th: 'ตลาด', en: 'Market' },
};

export const tagLabels = {
  nature: { th: 'ธรรมชาติ', en: 'Nature' },
  culture: { th: 'วัฒนธรรม', en: 'Culture' },
  history: { th: 'ประวัติศาสตร์', en: 'History' },
  adventure: { th: 'ผจญภัย', en: 'Adventure' },
  relax: { th: 'พักผ่อน', en: 'Slow travel' },
};

// รูปภาพที่มีอยู่ (ไฟล์ assets/images/<key>-800.webp และ -1600.webp)
export const images = {
  hero: { w: 1600, h: 900 },
  'luang-prabang': { w: 1586, h: 992 },
  'vang-vieng': { w: 1586, h: 992 },
  vientiane: { w: 1448, h: 1086 },
  champasak: { w: 1586, h: 992 },
  'kuang-si': { w: 1448, h: 1086 },
};

const p = (id, type, nameTh, nameEn, th, en, extra = {}) => ({ id, type, name: { th: nameTh, en: nameEn }, text: { th, en }, ...extra });

// ภาพถ่ายจริงจาก Wikimedia Commons (ใช้ได้ตามสัญญาอนุญาตที่ระบุ ต้องแสดงเครดิตผู้ถ่าย ซึ่งเว็บแสดงให้อัตโนมัติ)
// src คือภาพขนาดกว้าง 960 px เว็บจะเปลี่ยนเป็น 330 / 1920 px ให้เองตามขนาดจอ
// ถ้ามีรูปของบริษัทเอง: ใส่ไฟล์ใน assets/images แล้วเปลี่ยน photo: '...' ของสถานที่เป็น image: 'ชื่อรูป' แทน
export const photos = {
  'wat-xieng-thong': { file: 'Temple Wat Xieng Thong - Luang Prabang - Laos.jpg', w: 5529, h: 3291, author: 'Basile Morin', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e9/Temple_Wat_Xieng_Thong_-_Luang_Prabang_-_Laos.jpg/960px-Temple_Wat_Xieng_Thong_-_Luang_Prabang_-_Laos.jpg' },
  'kuang-si': { file: 'Kuang Si Falls and a turquoise water pool in Luang Prabang province Laos.jpg', w: 6039, h: 4026, author: 'Basile Morin', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Kuang_Si_Falls_and_a_turquoise_water_pool_in_Luang_Prabang_province_Laos.jpg/960px-Kuang_Si_Falls_and_a_turquoise_water_pool_in_Luang_Prabang_province_Laos.jpg' },
  'alms-giving': { file: 'Luang Prabang Monks Alm Dawn 02.jpg', w: 2500, h: 1667, author: 'Benh LIEU SONG', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ad/Luang_Prabang_Monks_Alm_Dawn_02.jpg/960px-Luang_Prabang_Monks_Alm_Dawn_02.jpg' },
  'phousi': { file: 'Mountains Mekong river and dwellings seen from Mount Phou Si at dusk in Luang Prabang Laos.jpg', w: 6264, h: 4176, author: 'Basile Morin', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Mountains_Mekong_river_and_dwellings_seen_from_Mount_Phou_Si_at_dusk_in_Luang_Prabang_Laos.jpg/960px-Mountains_Mekong_river_and_dwellings_seen_from_Mount_Phou_Si_at_dusk_in_Luang_Prabang_Laos.jpg' },
  'pak-ou': { file: 'Pak Ou Caves - statues.jpg', w: 3000, h: 1973, author: 'xiquinhosilva', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Pak_Ou_Caves_-_statues.jpg/960px-Pak_Ou_Caves_-_statues.jpg' },
  'royal-palace': { file: 'Luang-Prabang Laos Wat-Haw-Pha-Bang-01.jpg', w: 3317, h: 2488, author: 'CEphoto, Uwe Aranas', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/Luang-Prabang_Laos_Wat-Haw-Pha-Bang-01.jpg/960px-Luang-Prabang_Laos_Wat-Haw-Pha-Bang-01.jpg' },
  'lp-night-market': { file: 'Luang Prabang Night Market 2016(3).jpg', w: 3799, h: 2533, author: 'Ekrem Canli', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/Luang_Prabang_Night_Market_2016%283%29.jpg/960px-Luang_Prabang_Night_Market_2016%283%29.jpg' },
  'nong-khiaw': { file: 'Nong Khiaw pano(1).jpg', w: 3888, h: 2592, author: 'Ekrem Canli', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Nong_Khiaw_pano%281%29.jpg/960px-Nong_Khiaw_pano%281%29.jpg' },
  'muang-ngoi': { file: 'Muang Ngoi Neua from the Phanoi Viewpoint.jpg', w: 5184, h: 3888, author: 'Christophe95', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/Muang_Ngoi_Neua_from_the_Phanoi_Viewpoint.jpg/960px-Muang_Ngoi_Neua_from_the_Phanoi_Viewpoint.jpg' },
  'plain-of-jars': { file: '20171115 Plain of Jars Laos 2540 DxO.jpg', w: 4867, h: 3224, author: 'Jakub Hałun', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/38/20171115_Plain_of_Jars_Laos_2540_DxO.jpg/960px-20171115_Plain_of_Jars_Laos_2540_DxO.jpg' },
  'slow-boat': { file: '20171110 slow boat dock in Pak Beng Laos 0633 DxO.jpg', w: 4480, h: 2967, author: 'Jakub Hałun', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/20171110_slow_boat_dock_in_Pak_Beng_Laos_0633_DxO.jpg/960px-20171110_slow_boat_dock_in_Pak_Beng_Laos_0633_DxO.jpg' },
  'that-luang': { file: 'Pha That Luang - Vientiane (Laos) I.jpg', w: 5729, h: 3000, author: 'Phillip Maiwald (Nikopol)', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/Pha_That_Luang_-_Vientiane_%28Laos%29_I.jpg/960px-Pha_That_Luang_-_Vientiane_%28Laos%29_I.jpg' },
  'patuxai': { file: 'Patuxai1.jpg', w: 5643, h: 3743, author: 'Kenichiro Yamada.V', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Patuxai1.jpg/960px-Patuxai1.jpg' },
  'wat-si-saket': { file: 'Wat Si Saket in its paved courtyard Vientiane Laos.jpg', w: 5472, h: 3648, author: 'Basile Morin', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/36/Wat_Si_Saket_in_its_paved_courtyard_Vientiane_Laos.jpg/960px-Wat_Si_Saket_in_its_paved_courtyard_Vientiane_Laos.jpg' },
  'buddha-park': { file: '20171118 Park Buddy w Wientianie 3090 DxO.jpg', w: 4667, h: 3091, author: 'Jakub Hałun', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/20171118_Park_Buddy_w_Wientianie_3090_DxO.jpg/960px-20171118_Park_Buddy_w_Wientianie_3090_DxO.jpg' },
  'vang-vieng': { file: 'Water reflection of karst mountains at golden hour in Vang Vieng Laos (panoramic).jpg', w: 5990, h: 2662, author: 'Basile Morin', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/85/Water_reflection_of_karst_mountains_at_golden_hour_in_Vang_Vieng_Laos_%28panoramic%29.jpg/960px-Water_reflection_of_karst_mountains_at_golden_hour_in_Vang_Vieng_Laos_%28panoramic%29.jpg' },
  'nam-xay': { file: 'Karst peaks mist and colorful clouds at sunrise seen from Mount Nam Xay in Vang Vieng Laos.jpg', w: 6571, h: 4381, author: 'Basile Morin', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/Karst_peaks_mist_and_colorful_clouds_at_sunrise_seen_from_Mount_Nam_Xay_in_Vang_Vieng_Laos.jpg/960px-Karst_peaks_mist_and_colorful_clouds_at_sunrise_seen_from_Mount_Nam_Xay_in_Vang_Vieng_Laos.jpg' },
  'blue-lagoon': { file: 'Blue Lagoon at Vang Vieng - panoramio.jpg', w: 2048, h: 1536, author: 'Gonzo Gooner', license: 'CC BY 3.0', licenseUrl: 'https://creativecommons.org/licenses/by/3.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/Blue_Lagoon_at_Vang_Vieng_-_panoramio.jpg/960px-Blue_Lagoon_at_Vang_Vieng_-_panoramio.jpg' },
  'balloon': { file: 'Vang Vieng - Hot Air Balloon (23871064013).jpg', w: 2500, h: 1407, author: 'Visions of Domino', license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Vang_Vieng_-_Hot_Air_Balloon_%2823871064013%29.jpg/960px-Vang_Vieng_-_Hot_Air_Balloon_%2823871064013%29.jpg' },
  'nam-song': { file: 'Nam song river vang vieng.jpg', w: 3664, h: 2748, author: 'James Shannon', license: 'Public domain', licenseUrl: '',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/69/Nam_song_river_vang_vieng.jpg/960px-Nam_song_river_vang_vieng.jpg' },
  'kong-lor': { file: '20171120 Wlot jaskini Kong Lor w Laosie 3663 DxO.jpg', w: 4114, h: 2158, author: 'Jakub Hałun', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ce/20171120_Wlot_jaskini_Kong_Lor_w_Laosie_3663_DxO.jpg/960px-20171120_Wlot_jaskini_Kong_Lor_w_Laosie_3663_DxO.jpg' },
  'vat-phou': { file: 'Twisted Plumeria tree trunk overgrowing the steep stone stairs of Wat Phou temple, Champasak, Laos.jpg', w: 6720, h: 4480, author: 'Basile Morin', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Twisted_Plumeria_tree_trunk_overgrowing_the_steep_stone_stairs_of_Wat_Phou_temple%2C_Champasak%2C_Laos.jpg/960px-Twisted_Plumeria_tree_trunk_overgrowing_the_steep_stone_stairs_of_Wat_Phou_temple%2C_Champasak%2C_Laos.jpg' },
  'si-phan-don': { file: 'Pirogue running on the Mekong at sunset with pink clouds in Don Det Laos.jpg', w: 6720, h: 3780, author: 'Basile Morin', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Pirogue_running_on_the_Mekong_at_sunset_with_pink_clouds_in_Don_Det_Laos.jpg/960px-Pirogue_running_on_the_Mekong_at_sunset_with_pink_clouds_in_Don_Det_Laos.jpg' },
  'khone-phapheng': { file: 'Khone Phapheng Falls, Si Phan Don, Laos, widest waterfall in the world.jpg', w: 6688, h: 3762, author: 'Basile Morin', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Khone_Phapheng_Falls%2C_Si_Phan_Don%2C_Laos%2C_widest_waterfall_in_the_world.jpg/960px-Khone_Phapheng_Falls%2C_Si_Phan_Don%2C_Laos%2C_widest_waterfall_in_the_world.jpg' },
  'li-phi': { file: 'Li Phi falls at sunrise with colorful clouds in Don Khon Laos.jpg', w: 6106, h: 4071, author: 'Basile Morin', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Li_Phi_falls_at_sunrise_with_colorful_clouds_in_Don_Khon_Laos.jpg/960px-Li_Phi_falls_at_sunrise_with_colorful_clouds_in_Don_Khon_Laos.jpg' },
  'tad-fane': { file: 'Tad Fane Waterfall 20251228 (II).jpg', w: 6484, h: 4323, author: 'Supanut Arunoprayote', license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/Tad_Fane_Waterfall_20251228_%28II%29.jpg/960px-Tad_Fane_Waterfall_20251228_%28II%29.jpg' },
  'paksong-coffee': { file: 'Coffee plantations Bolaven Plateau 04.jpg', w: 4032, h: 3024, author: 'Christophe95', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Coffee_plantations_Bolaven_Plateau_04.jpg/960px-Coffee_plantations_Bolaven_Plateau_04.jpg' },
  'mekong-night-market': { file: 'Vientiane Night Market 1.jpg', w: 4028, h: 2697, author: 'Christophe95', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    src: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Vientiane_Night_Market_1.jpg/960px-Vientiane_Night_Market_1.jpg' },
};

// 18 แขวง (เรียงจากเหนือลงใต้)
export const provinces = [
  // ───────── ลาวเหนือ ─────────
  {
    id: 'phongsaly', region: 'north',
    name: { th: 'พงสาลี', en: 'Phongsaly', lo: 'ຜົ້ງສາລີ' },
    capital: { th: 'พงสาลี', en: 'Phongsaly' },
    tagline: { th: 'ดินแดนบนดอยเหนือสุดของลาว', en: "Laos' northernmost highlands" },
    intro: {
      th: 'แขวงเหนือสุดของประเทศ อากาศเย็นเกือบตลอดปี เต็มไปด้วยภูเขา สวนชาโบราณ และหมู่บ้านของชนเผ่าหลายกลุ่ม',
      en: "The country's northernmost province: cool mountain air, ancient tea gardens and villages of many ethnic groups.",
    },
    tags: ['nature', 'culture', 'adventure'],
    places: [
      p('phou-fa', 'viewpoint', 'ภูฟ้า', 'Phou Fa', 'เดินขึ้นบันไดสู่พระธาตุบนยอดเขาเหนือตัวเมือง ชมทะเลหมอกและเทือกเขารอบด้าน', 'Climb the stairway to a hilltop stupa above town for views over misty ridges.'),
      p('phongsaly-old-quarter', 'culture', 'ย่านเมืองเก่าพงสาลี', 'Phongsaly old quarter', 'บ้านไม้และตรอกหินแบบยูนนาน สะท้อนวิถีชีวิตของเมืองชายแดนบนภูเขา', 'Yunnanese-style wooden houses and stone lanes of a mountain border town.'),
      p('ethnic-museum', 'culture', 'พิพิธภัณฑ์ชนเผ่า', 'Museum of Ethnic Groups', 'รู้จักเครื่องแต่งกายและวิถีชีวิตของชนเผ่าต่าง' + NB + 'ๆ ในแขวงพงสาลี', "Costumes and traditions of Phongsaly's many ethnic groups."),
      p('ban-komen-tea', 'nature', 'ต้นชาโบราณบ้านโกแมน', 'Ancient tea trees of Ban Komen', 'สวนชาที่มีต้นชาอายุหลายร้อยปี ชิมชาท้องถิ่นท่ามกลางอากาศเย็นบนดอย', 'Tea gardens with centuries-old trees, and local tea in the cool hills.'),
    ],
  },
  {
    id: 'luang-namtha', region: 'north',
    name: { th: 'หลวงน้ำทา', en: 'Luang Namtha', lo: 'ຫຼວງນ້ຳທາ' },
    capital: { th: 'หลวงน้ำทา', en: 'Luang Namtha' },
    tagline: { th: 'ป่าน้ำฮาและหมู่บ้านชนเผ่า', en: 'Nam Ha forests and hill-tribe villages' },
    intro: {
      th: 'ประตูสู่การเดินป่าในลาวเหนือ มีทั้งป่าสงวนแห่งชาติน้ำฮา หมู่บ้านชนเผ่า และเมืองสิงใกล้ชายแดนจีน',
      en: "Northern Laos' trekking gateway, with the Nam Ha protected area, ethnic villages and Muang Sing near the Chinese border.",
    },
    tags: ['nature', 'adventure', 'culture'],
    places: [
      p('nam-ha', 'activity', 'ป่าสงวนแห่งชาติน้ำฮา', 'Nam Ha National Protected Area', 'เดินป่า พายเรือ และพักโฮมสเตย์กับชุมชนท้องถิ่นในผืนป่าอุดมสมบูรณ์', 'Trek, kayak and stay with local communities in rich forest.'),
      p('muang-sing', 'culture', 'เมืองสิง', 'Muang Sing', 'หุบเขาเขียวขจีและหมู่บ้านชาวอาข่า ไทลื้อ ใกล้ชายแดนจีน', 'A green valley of Akha and Tai Lue villages near the Chinese border.'),
      p('nam-dee', 'waterfall', 'น้ำตกน้ำดี', 'Nam Dee Waterfall', 'น้ำตกเล็ก' + NB + 'ๆ ข้างหมู่บ้านชาวแลนแตน เดินทางสะดวกจากตัวเมือง', 'A small waterfall by a Lanten village, easy to reach from town.'),
      p('namtha-night-market', 'market', 'ตลาดกลางคืนหลวงน้ำทา', 'Luang Namtha night market', 'ชิมอาหารพื้นเมืองลาวเหนือในบรรยากาศเป็นกันเองยามค่ำ', 'Northern Lao street food in a relaxed evening market.'),
    ],
  },
  {
    id: 'oudomxay', region: 'north',
    name: { th: 'อุดมไซ', en: 'Oudomxay', lo: 'ອຸດົມໄຊ' },
    capital: { th: 'เมืองไซ', en: 'Muang Xay' },
    tagline: { th: 'ชุมทางแห่งลาวเหนือ', en: 'The crossroads of the north' },
    intro: {
      th: 'แขวงกลางของภาคเหนือ มีสถานีรถไฟลาว–จีนที่เมืองไซ ถ้ำขนาดใหญ่ น้ำตกกลางป่า และปากแบ่งเมืองท่าริมแม่น้ำโขง',
      en: 'The hub of the north, with a Laos–China Railway station at Muang Xay, big caves, forest waterfalls and the Mekong river town of Pakbeng.',
    },
    tags: ['nature', 'culture'],
    places: [
      p('phou-that', 'temple', 'พระธาตุภูธาตุ', 'Phou That Stupa', 'พระธาตุสีทองบนเนินเขากลางเมืองไซ มองเห็นตัวเมืองและหุบเขารอบด้าน', 'A golden stupa on a hill above Muang Xay with valley views.'),
      p('chom-ong', 'cave', 'ถ้ำจอมออง', 'Chom Ong Cave', 'ถ้ำหินปูนขนาดใหญ่กลางป่า มีหินงอกหินย้อยงดงาม', 'A vast limestone cave in the forest with striking formations.'),
      p('nam-kat', 'waterfall', 'น้ำตกน้ำกาด', 'Nam Kat Waterfall', 'น้ำตกกลางป่าเขียวชอุ่ม เหมาะกับการเดินป่าระยะสั้นและพักผ่อน', 'A forest waterfall for easy hikes and quiet time.'),
      p('pakbeng', 'activity', 'ปากแบ่ง', 'Pakbeng', 'เมืองท่าริมโขงที่เรือช้าระหว่างห้วยทรายกับหลวงพระบางแวะค้างคืน', 'A Mekong river town where slow boats between Houay Xai and Luang Prabang stop overnight.'),
    ],
  },
  {
    id: 'bokeo', region: 'north', photo: 'slow-boat',
    name: { th: 'บ่อแก้ว', en: 'Bokeo', lo: 'ບໍ່ແກ້ວ' },
    capital: { th: 'ห้วยทราย', en: 'Houay Xai' },
    tagline: { th: 'ประตูริมโขงสู่ลาวเหนือ', en: 'The Mekong gateway to the north' },
    intro: {
      th: 'ข้ามแดนจากเชียงของมาที่ห้วยทราย แล้วเริ่มการเดินทางด้วยเรือช้าล่องแม่น้ำโขง หรือนอนบ้านต้นไม้กลางป่า',
      en: 'Cross from Chiang Khong to Houay Xai, then drift down the Mekong by slow boat or sleep in treehouses in the forest.',
    },
    tags: ['adventure', 'nature', 'relax'],
    places: [
      p('gibbon-experience', 'activity', 'เดอะ กิบบอน เอ็กซ์พีเรียนซ์', 'The Gibbon Experience', 'โหนสลิงเหนือยอดไม้และค้างคืนบนบ้านต้นไม้ในอุทยานแห่งชาติน้ำกาน', 'Zip-line over the canopy and sleep in treehouses in Nam Kan National Park.'),
      p('slow-boat', 'activity', 'เรือช้าล่องแม่น้ำโขง', 'Mekong slow boat', 'ล่องเรือ 2 วันจากห้วยทรายสู่หลวงพระบาง แวะพักที่ปากแบ่ง ชมหมู่บ้านริมน้ำตลอดทาง', 'A two-day cruise from Houay Xai to Luang Prabang with an overnight in Pakbeng.', { photo: 'slow-boat' }),
      p('wat-jom-khao', 'temple', 'วัดจอมเขามณีรัตน์', 'Wat Jom Khao Manilat', 'วัดไม้สักแบบไทใหญ่ สร้างเมื่อปี 1880 บนเนินเขาเหนือเมืองห้วยทราย', 'An 1880 Shan-style teak temple on a hill above Houay Xai.'),
      p('fort-carnot', 'history', 'ป้อมการ์โนต์', 'Fort Carnot', 'ป้อมเก่าสมัยอาณานิคมฝรั่งเศส ร่องรอยประวัติศาสตร์ของเมืองชายแดน (ชมจากภายนอก)', "A French colonial fort, a reminder of the border town's past (viewed from outside)."),
    ],
  },
  {
    id: 'luang-prabang', region: 'north', image: 'luang-prabang',
    name: { th: 'หลวงพระบาง', en: 'Luang Prabang', lo: 'ຫຼວງພະບາງ' },
    capital: { th: 'หลวงพระบาง', en: 'Luang Prabang' },
    tagline: { th: 'เมืองมรดกโลกที่เวลาเดินช้าลง', en: 'A heritage town where time slows down' },
    intro: {
      th: 'เมืองเก่าระหว่างแม่น้ำโขงกับแม่น้ำคาน ได้รับการขึ้นทะเบียนเป็นมรดกโลกเมื่อปี 1995 เต็มไปด้วยวัดงาม บ้านเรือนเก่า และวิถีชีวิตที่เรียบง่าย',
      en: 'An old town between the Mekong and Nam Khan rivers, a UNESCO World Heritage Site since 1995, full of temples, old houses and an unhurried way of life.',
    },
    tags: ['culture', 'nature', 'relax'],
    places: [
      p('wat-xieng-thong', 'temple', 'วัดเชียงทอง', 'Wat Xieng Thong', 'หนึ่งในวัดที่งดงามที่สุดของลาว โดดเด่นด้วยหลังคาซ้อนลาดต่ำและลายประดับกระจก', "One of Laos' most beautiful temples, with sweeping low roofs and glass mosaics.", { photo: 'wat-xieng-thong' }),
      p('royal-palace', 'history', 'พระราชวังหลวงพระบาง', 'Royal Palace Museum', 'พระราชวังเดิมที่เป็นพิพิธภัณฑ์แห่งชาติ พร้อมหอพระบางสีทองในบริเวณเดียวกัน', 'The former royal palace, now the national museum, with the gilded Haw Pha Bang in its grounds.', { photo: 'royal-palace' }),
      p('alms-giving', 'culture', 'ตักบาตรข้าวเหนียว', 'Morning alms giving', 'ชมขบวนพระสงฆ์ออกบิณฑบาตยามเช้า ร่วมอย่างสงบและให้เกียรติ', 'Watch monks collect alms at dawn — join quietly and respectfully.', { photo: 'alms-giving' }),
      p('phousi', 'viewpoint', 'พูสี', 'Mount Phousi', 'เนินเขากลางเมือง จุดชมพระอาทิตย์ตกเหนือแม่น้ำโขงที่นิยมที่สุด', 'The hill in the middle of town and the classic Mekong sunset spot.', { photo: 'phousi' }),
      p('night-market', 'market', 'ตลาดกลางคืนหลวงพระบาง', 'Luang Prabang Night Market', 'ตลาดหัตถกรรมยามค่ำบนถนนศรีสว่างวงศ์ ผ้าทอ ของที่ระลึก และอาหารพื้นเมือง', 'An evening handicraft market on Sisavangvong Road: textiles, souvenirs and local food.', { photo: 'lp-night-market' }),
      p('kuang-si', 'waterfall', 'น้ำตกตาดกวางสี', 'Kuang Si Falls', 'น้ำตกหินปูนหลายชั้นกับแอ่งน้ำสีฟ้าเทอร์ควอยซ์ ห่างจากตัวเมืองราว 30 กม.', 'Tiered limestone falls and turquoise pools about 30 km from town.', { photo: 'kuang-si' }),
      p('pak-ou', 'cave', 'ถ้ำติ่ง', 'Pak Ou Caves', 'ถ้ำริมแม่น้ำโขงที่มีพระพุทธรูปนับพันองค์ เดินทางด้วยเรือจากตัวเมือง', 'Riverside caves filled with thousands of Buddha images, reached by boat.', { photo: 'pak-ou' }),
      p('nong-khiaw', 'nature', 'หนองเขียว', 'Nong Khiaw', 'หมู่บ้านริมแม่น้ำอูท่ามกลางภูเขาหินปูน จุดชมทะเลหมอกยามเช้า', 'A Nam Ou river village among limestone peaks, with misty morning viewpoints.', { photo: 'nong-khiaw' }),
      p('muang-ngoi', 'nature', 'เมืองงอย', 'Muang Ngoi', 'หมู่บ้านริมแม่น้ำอูที่ไปได้ด้วยเรือ ชีวิตเรียบง่ายท่ามกลางขุนเขา', 'A Nam Ou village reached by boat — a slow life among the mountains.', { photo: 'muang-ngoi' }),
    ],
  },
  {
    id: 'houaphanh', region: 'north',
    name: { th: 'หัวพัน', en: 'Houaphanh', lo: 'ຫົວພັນ' },
    capital: { th: 'ซำเหนือ', en: 'Xam Neua' },
    tagline: { th: 'ถ้ำประวัติศาสตร์และผ้าทอไทแดง', en: 'History caves and Tai Daeng weaving' },
    intro: {
      th: 'แขวงบนภูเขาทางตะวันออกเฉียงเหนือ ที่ตั้งของถ้ำเวียงไซ ฐานที่มั่นในยามสงคราม ผืนป่าน้ำแอด–ภูเลย และผ้าทอฝีมือชาวไทแดง',
      en: "A mountain province in the northeast: Vieng Xai's wartime caves, the Nam Et–Phou Louey forest and Tai Daeng textiles.",
    },
    tags: ['history', 'nature', 'culture'],
    places: [
      p('vieng-xai', 'history', 'ถ้ำเวียงไซ', 'Vieng Xai Caves', 'เมืองในถ้ำที่ผู้นำลาวใช้เป็นที่มั่นช่วงสงคราม ได้ชื่อว่าเป็นบ้านเกิดของ สปป.ลาว', 'The cave city that sheltered Lao leaders in wartime, called the birthplace of the Lao PDR.'),
      p('nam-nern-safari', 'activity', 'ซาฟารีกลางคืนน้ำเนิน', 'Nam Nern Night Safari', 'ล่องเรือยามค่ำในอุทยานแห่งชาติน้ำแอด–ภูเลย ผืนป่าอนุรักษ์ที่ใหญ่ที่สุดของลาว', "A night boat safari in Nam Et–Phou Louey, Laos' largest protected area."),
      p('hintang', 'history', 'อุทยานหินตั้ง', 'Hintang Archaeological Park', 'แนวหินตั้งโบราณอายุราว 2,000 ปี เรียงรายบนสันเขา', 'Standing stones about 2,000 years old lining a ridge.'),
      p('tad-saleuy', 'waterfall', 'น้ำตกตาดสะเลย', 'Tad Saleuy Waterfall', 'น้ำตกร่มรื่นทางใต้ของซำเหนือ มีทางเดินและแอ่งน้ำให้เล่น', 'A shaded waterfall south of Xam Neua with a trail and a pool.'),
      p('tai-daeng-weaving', 'culture', 'ผ้าทอไทแดง', 'Tai Daeng textiles', 'ชมการทอผ้าลวดลายละเอียดที่ขึ้นชื่อของแขวงหัวพัน', 'See the finely patterned weaving Houaphanh is famous for.'),
    ],
  },
  {
    id: 'xayaboury', region: 'north',
    name: { th: 'ไซยะบูลี', en: 'Xayaboury', lo: 'ໄຊຍະບູລີ' },
    capital: { th: 'ไซยะบูลี', en: 'Xayaboury' },
    tagline: { th: 'ดินแดนแห่งช้าง', en: 'Land of elephants' },
    intro: {
      th: 'แขวงทางตะวันตกติดชายแดนไทย ขึ้นชื่อเรื่องช้าง เป็นที่ตั้งของศูนย์อนุรักษ์ช้าง และมีเทศกาลช้างทุกเดือนกุมภาพันธ์',
      en: 'A western province on the Thai border, famed for elephants — home to the Elephant Conservation Center and a February Elephant Festival.',
    },
    tags: ['nature', 'culture'],
    places: [
      p('ecc', 'nature', 'ศูนย์อนุรักษ์ช้าง', 'Elephant Conservation Center', 'เรียนรู้การดูแลช้างอย่างรับผิดชอบ ริมอ่างเก็บน้ำน้ำเทียน', 'Learn about responsible elephant care beside the Nam Tien reservoir.'),
      p('elephant-festival', 'culture', 'เทศกาลช้าง', 'Elephant Festival', 'งานประจำปีช่วงเดือนกุมภาพันธ์ มีขบวนช้าง การแสดง และวัฒนธรรมชนเผ่า', 'An annual February festival with elephant parades, shows and ethnic culture.'),
      p('wat-simungkhun', 'temple', 'วัดศรีมุงคุน', 'Wat Simungkhun', 'วัดที่เมืองหงสา ตามตำนานท้องถิ่นมีแผ่นหินปิดทางลงสู่ “สุดขอบโลก”', 'A temple in Hongsa where, legend says, a stone slab covers a hole to “the end of the world”.'),
    ],
  },
  {
    id: 'xiengkhouang', region: 'north', photo: 'plain-of-jars',
    name: { th: 'เชียงขวาง', en: 'Xiengkhouang', lo: 'ຊຽງຂວາງ' },
    capital: { th: 'โพนสะหวัน', en: 'Phonsavan' },
    tagline: { th: 'ปริศนาแห่งทุ่งไหหิน', en: 'The mystery of the Plain of Jars' },
    intro: {
      th: 'ที่ราบสูงอากาศเย็นซึ่งมีไหหินยักษ์โบราณกระจายอยู่ทั่ว ได้รับการขึ้นทะเบียนเป็นมรดกโลกเมื่อปี 2019 พร้อมเรื่องราวประวัติศาสตร์ที่ควรค่าแก่การเรียนรู้',
      en: 'A cool upland scattered with giant ancient stone jars — a UNESCO World Heritage Site since 2019 — with history well worth learning.',
    },
    tags: ['history', 'nature', 'culture'],
    places: [
      p('plain-of-jars', 'history', 'ทุ่งไหหิน', 'Plain of Jars', 'ไหหินยักษ์ยุคเหล็กนับพันใบบนทุ่งหญ้าและเนินเขา จุดที่ 1 ใกล้เมืองโพนสะหวันเดินชมง่ายที่สุด', 'Thousands of Iron Age stone jars across grassy hills — Site 1 near Phonsavan is easiest to visit.', { photo: 'plain-of-jars' }),
      p('muang-khoun', 'history', 'เมืองคูน', 'Muang Khoun', 'เมืองหลวงเก่าของอาณาจักรพวน มีพระธาตุฝุ่นและพระพุทธรูปวัดเพียวัดที่ผ่านพ้นสงคราม', 'The old capital of the Phuan kingdom, with That Foun stupa and the war-scarred Buddha of Wat Phia Wat.'),
      p('tham-piu', 'history', 'ถ้ำปิว', 'Tham Piu Cave', 'อนุสรณ์สถานในถ้ำที่ชาวบ้านเคยหลบภัยสงคราม เรื่องราวที่ควรจดจำ', 'A cave memorial to villagers who sheltered here during the war.'),
      p('uxo-centre', 'history', 'ศูนย์ข้อมูลระเบิดตกค้าง (MAG)', 'UXO Information Centre (MAG)', 'เรียนรู้เรื่องระเบิดที่ยังตกค้างและงานเก็บกู้ในลาว ที่เมืองโพนสะหวัน', 'Learn about unexploded ordnance and clearance work, in Phonsavan.'),
    ],
  },
  {
    id: 'xaisomboun', region: 'north',
    name: { th: 'ไซสมบูน', en: 'Xaisomboun', lo: 'ໄຊສົມບູນ' },
    capital: { th: 'อนุวง', en: 'Anouvong' },
    tagline: { th: 'ทะเลหมอกและยอดเขาสูงที่สุดของลาว', en: "Seas of mist and Laos' highest mountain" },
    intro: {
      th: 'แขวงที่ตั้งใหม่ล่าสุดของลาวท่ามกลางเทือกเขา มีจุดชมทะเลหมอก ถ้ำเจ้าอนุวงศ์ และภูเบี้ย ยอดเขาสูงที่สุดของประเทศ',
      en: "Laos' newest province, deep in the mountains — fog-filled viewpoints, Chao Anouvong Cave and Phou Bia, the country's highest peak.",
    },
    tags: ['nature', 'adventure', 'history'],
    places: [
      p('phou-hualone', 'viewpoint', 'ภูหัวโล้น', 'Phou Hualone', 'เนินเขาสีเขียวใกล้เมืองอนุวง จุดชมพระอาทิตย์ขึ้นและตกท่ามกลางสายหมอก', 'Rolling green hills near Anouvong for misty sunrises and sunsets.'),
      p('chao-anouvong-cave', 'cave', 'ถ้ำเจ้าอนุวงศ์', 'Chao Anouvong Cave', 'ถ้ำคู่ห่างจากตัวเมืองราว 4 กม. มองเห็นทิวเขาสูงจากในถ้ำ', 'A double cave about 4 km from town with mountain views from inside.'),
      p('san-phou-mok', 'viewpoint', 'สันภูหมอก', 'San Phou Mok', 'แนวเขาที่ปกคลุมด้วยทะเลหมอกในเมืองล่องแจ้ง', 'Fog-wrapped ridges in Longchaeng district.'),
      p('phou-bia', 'nature', 'ภูเบี้ย', 'Phou Bia', 'ยอดเขาสูงที่สุดของลาว สูงราว 2,819 เมตร', "Laos' highest mountain, about 2,819 m high."),
    ],
  },

  // ───────── ลาวกลาง ─────────
  {
    id: 'vientiane-capital', region: 'central', image: 'vientiane',
    name: { th: 'นครหลวงเวียงจันทน์', en: 'Vientiane Capital', lo: 'ນະຄອນຫຼວງວຽງຈັນ' },
    short: { th: 'เวียงจันทน์', en: 'Vientiane' },
    capital: { th: 'เวียงจันทน์', en: 'Vientiane' },
    tagline: { th: 'เสน่ห์เมืองหลวงริมโขง', en: 'The charm of a capital by the Mekong' },
    intro: {
      th: 'เมืองหลวงที่เดินทางมาง่ายที่สุดจากไทย ข้ามสะพานมิตรภาพจากหนองคายหรือนั่งรถไฟจากกรุงเทพฯ มีวัดสำคัญ อนุสาวรีย์ และบรรยากาศริมโขงยามเย็น',
      en: 'The easiest capital to reach from Thailand — over the Friendship Bridge from Nong Khai or by train from Bangkok — with major temples, monuments and Mekong evenings.',
    },
    tags: ['culture', 'history', 'relax'],
    places: [
      p('that-luang', 'temple', 'พระธาตุหลวง', 'Pha That Luang', 'พระธาตุสีทองสัญลักษณ์ของชาติลาว มีงานบุญใหญ่ประจำปีช่วงเดือนพฤศจิกายน', 'The golden stupa that symbolises Laos, with a major festival around November.', { photo: 'that-luang' }),
      p('patuxai', 'history', 'ประตูชัย', 'Patuxai', 'อนุสาวรีย์กลางเมือง ขึ้นไปชมวิวถนนล้านช้างได้จากชั้นบน', "The city's victory monument — climb up for views down Lane Xang Avenue.", { photo: 'patuxai' }),
      p('wat-si-saket', 'temple', 'วัดสีสะเกด', 'Wat Si Saket', 'วัดเก่าแก่ที่สุดที่ยังคงสภาพเดิมในเวียงจันทน์ ระเบียงคดมีพระพุทธรูปนับพันองค์', "Vientiane's oldest surviving temple, its cloister lined with thousands of Buddha images.", { photo: 'wat-si-saket' }),
      p('buddha-park', 'culture', 'สวนพระ เซียงควน', 'Buddha Park (Xieng Khuan)', 'สวนประติมากรรมพระพุทธรูปและเทพเจ้าขนาดใหญ่ริมแม่น้ำโขง ใกล้สะพานมิตรภาพ', 'A riverside garden of giant Buddhist and Hindu sculptures near the Friendship Bridge.', { photo: 'buddha-park' }),
      p('mekong-night-market', 'market', 'ตลาดกลางคืนริมโขง', 'Mekong riverside night market', 'เดินเล่น ช้อปปิ้ง และชมพระอาทิตย์ตกริมแม่น้ำโขง', 'Stroll, shop and watch the sunset on the Mekong.', { photo: 'mekong-night-market' }),
    ],
  },
  {
    id: 'vientiane-province', region: 'central', image: 'vang-vieng',
    name: { th: 'แขวงเวียงจันทน์', en: 'Vientiane Province', lo: 'ແຂວງວຽງຈັນ' },
    capital: { th: 'โพนโฮง', en: 'Phonhong' },
    tagline: { th: 'วังเวียงและอ่างเก็บน้ำน้ำงึม', en: 'Vang Vieng and Nam Ngum Reservoir' },
    intro: {
      th: 'แขวงที่โอบล้อมนครหลวง มีวังเวียงเมืองแห่งภูเขาหินปูนริมแม่น้ำซอง และอ่างเก็บน้ำน้ำงึมที่เต็มไปด้วยเกาะเล็กเกาะน้อย',
      en: "Wrapping around the capital: Vang Vieng's limestone peaks on the Nam Song and the island-dotted Nam Ngum reservoir.",
    },
    tags: ['nature', 'adventure', 'relax'],
    places: [
      p('vang-vieng', 'nature', 'วังเวียง', 'Vang Vieng', 'เมืองเล็กริมแม่น้ำซองท่ามกลางภูเขาหินปูน นั่งรถไฟลาว–จีนจากเวียงจันทน์ราว 1 ชั่วโมง', 'A small town on the Nam Song amid karst peaks, about an hour from Vientiane by train.', { photo: 'vang-vieng' }),
      p('nam-xay', 'viewpoint', 'จุดชมวิวน้ำไซ', 'Nam Xay Viewpoint', 'จุดชมวิวยอดนิยมของวังเวียง เดินขึ้นราว 30 นาทีสู่วิวภูเขาหินปูนรอบทิศ', "Vang Vieng's favourite viewpoint: a 30-minute climb to panoramic karst views.", { photo: 'nam-xay' }),
      p('blue-lagoon', 'nature', 'บลูลากูน', 'Blue Lagoon', 'แอ่งน้ำสีฟ้าใสใกล้ถ้ำ เล่นน้ำและพักผ่อนท่ามกลางทุ่งนา', 'Clear blue pools by caves, for swimming among the rice fields.', { photo: 'blue-lagoon' }),
      p('tham-chang', 'cave', 'ถ้ำจัง', 'Tham Chang', 'ถ้ำประวัติศาสตร์ข้างตัวเมืองวังเวียง ชมวิวทุ่งนาและแม่น้ำจากปากถ้ำ', 'A historic cave beside town with views over fields and river.'),
      p('nam-song', 'activity', 'ล่องแม่น้ำซอง', 'Nam Song river trip', 'พายเรือคายัคหรือนั่งห่วงยางล่องแม่น้ำ ชมภูเขาหินปูนสองฝั่ง', 'Kayak or float down the river between limestone cliffs.', { photo: 'nam-song' }),
      p('balloon', 'activity', 'บอลลูนวังเวียง', 'Hot-air ballooning', 'ชมทุ่งนาและภูเขาหินปูนจากมุมสูงในยามเช้าหรือเย็น', 'See fields and karst peaks from above at dawn or dusk.', { photo: 'balloon' }),
      p('nam-ngum', 'nature', 'อ่างเก็บน้ำน้ำงึม', 'Nam Ngum Reservoir', 'ทะเลสาบกว้างที่มีเกาะเล็กเกาะน้อย ล่องเรือและชิมปลาสด', 'A wide lake dotted with islands — boat trips and fresh fish.'),
    ],
  },
  {
    id: 'bolikhamxay', region: 'central',
    name: { th: 'บอลิคำไซ', en: 'Bolikhamxay', lo: 'ບໍລິຄຳໄຊ' },
    capital: { th: 'ปากซัน', en: 'Pakxan' },
    tagline: { th: 'ป่าภูเขาควายและแม่น้ำกะดิ่ง', en: 'Phou Khao Khouay forests and the Nam Kading' },
    intro: {
      th: 'แขวงริมโขงระหว่างเวียงจันทน์กับท่าแขก มีป่าอนุรักษ์ภูเขาควาย น้ำตกหลายแห่ง และหอดูช้างป่าที่บ้านนา',
      en: 'A Mekong-side province between Vientiane and Thakhek, with the Phou Khao Khouay forests, waterfalls and a wild-elephant watchtower at Ban Na.',
    },
    tags: ['nature', 'adventure'],
    places: [
      p('phou-khao-khouay', 'nature', 'ป่าสงวนภูเขาควาย', 'Phou Khao Khouay NPA', 'ผืนป่าใกล้เวียงจันทน์ มีน้ำตกตาดไซและตาดเลิก เหมาะกับการเดินป่าระยะสั้น', 'Forest close to Vientiane with Tad Xai and Tad Leuk waterfalls — good for short hikes.'),
      p('ban-na-tower', 'nature', 'หอดูช้างบ้านนา', 'Ban Na elephant tower', 'ค้างคืนบนหอสังเกตการณ์เพื่อรอชมช้างป่าที่ลงมากินโป่ง', 'Overnight in an observation tower to watch for wild elephants at a salt lick.'),
      p('nam-kading', 'nature', 'แม่น้ำกะดิ่ง', 'Nam Kading', 'แม่น้ำใสไหลผ่านป่าอนุรักษ์ ล่องเรือชมหน้าผาและป่าดิบ', 'A clear river through protected forest — boat trips past cliffs and jungle.'),
      p('wat-phabath', 'temple', 'วัดพระบาทโพนสัน', 'Wat Phabath Phonsanh', 'วัดริมโขงที่ประดิษฐานรอยพระพุทธบาท เป็นที่เคารพของคนลาว', 'A Mekong-side temple enshrining a Buddha footprint, revered across Laos.'),
    ],
  },
  {
    id: 'khammouane', region: 'central', photo: 'kong-lor',
    name: { th: 'คำม่วน', en: 'Khammouane', lo: 'ຄຳມ່ວນ' },
    capital: { th: 'ท่าแขก', en: 'Thakhek' },
    tagline: { th: 'ถ้ำมหัศจรรย์และเส้นทางวนลูป', en: 'Wondrous caves and the Thakhek Loop' },
    intro: {
      th: 'ข้ามสะพานมิตรภาพแห่งที่ 3 จากนครพนมมาท่าแขก เมืองริมโขงสไตล์อาณานิคม สู่ภูเขาหินปูน ถ้ำกองลอ และเส้นทางวนลูปที่นักเดินทางหลงรัก',
      en: 'Cross the Third Friendship Bridge from Nakhon Phanom to colonial Thakhek, gateway to karst country, Kong Lor cave and the famous Thakhek Loop.',
    },
    tags: ['adventure', 'nature', 'history'],
    places: [
      p('kong-lor', 'cave', 'ถ้ำกองลอ', 'Kong Lor Cave', 'นั่งเรือลอดถ้ำกองลอ ผ่านภูเขาหินปูนเป็นระยะทางราว 7.5 กิโลเมตร', 'Boat through a river cave about 7.5 km long beneath a mountain.', { photo: 'kong-lor' }),
      p('thakhek-loop', 'activity', 'เส้นทางวนลูปท่าแขก', 'The Thakhek Loop', 'ทริปขี่รถ 3–4 วันผ่านภูเขาหินปูน ทะเลสาบ และหมู่บ้านชนบท', 'A 3–4 day ride through karst, reservoirs and villages.'),
      p('that-sikhottabong', 'temple', 'พระธาตุศรีโคตรบอง', 'That Sikhottabong', 'พระธาตุเก่าแก่ริมแม่น้ำโขงใกล้เมืองท่าแขก', 'An ancient stupa on the Mekong near Thakhek.'),
      p('tham-pha-fa', 'cave', 'ถ้ำพระ (ถ้ำผาฟ้า)', 'Buddha Cave (Tham Pha Fa)', 'ถ้ำที่ชาวบ้านพบพระพุทธรูปโบราณ 229 องค์เมื่อปี 2004', 'Where a farmer found 229 ancient Buddha statues in 2004.'),
      p('kong-leng', 'nature', 'ขุนกองแลง', 'Khoun Kong Leng', 'ทะเลสาบน้ำใสสีเขียวมรกตกลางป่า ชาวบ้านถือว่าเป็นที่ศักดิ์สิทธิ์', 'An emerald lake in the forest that locals hold sacred.'),
    ],
  },
  {
    id: 'savannakhet', region: 'central',
    name: { th: 'สะหวันนะเขต', en: 'Savannakhet', lo: 'ສະຫວັນນະເຂດ' },
    capital: { th: 'ไกสอน พมวิหาน', en: 'Kaysone Phomvihane' },
    tagline: { th: 'เมืองเก่าสมัยอาณานิคมและพระธาตุอิงฮัง', en: 'Colonial streets and That Ing Hang' },
    intro: {
      th: 'ข้ามสะพานมิตรภาพแห่งที่ 2 จากมุกดาหาร พบเมืองเก่าที่มีอาคารสมัยอาณานิคม พระธาตุศักดิ์สิทธิ์ และพิพิธภัณฑ์ไดโนเสาร์',
      en: 'Over the Second Friendship Bridge from Mukdahan: colonial-era streets, a sacred stupa and a dinosaur museum.',
    },
    tags: ['history', 'culture'],
    places: [
      p('savannakhet-old-town', 'history', 'ย่านเมืองเก่าสะหวันนะเขต', 'Savannakhet Old Town', 'อาคารสมัยอาณานิคมฝรั่งเศสและโบสถ์เซนต์เทเรซา เดินเล่นถ่ายรูปได้ทั้งวัน', "French colonial buildings and St Teresa's Church — great for a slow walk."),
      p('that-ing-hang', 'temple', 'พระธาตุอิงฮัง', 'That Ing Hang', 'พระธาตุศักดิ์สิทธิ์ที่ผู้คนทั้งสองฝั่งโขงเคารพ มีงานบุญประจำปี', 'A sacred stupa revered on both sides of the Mekong, with an annual festival.'),
      p('dinosaur-museum', 'history', 'พิพิธภัณฑ์ไดโนเสาร์', 'Dinosaur Museum', 'จัดแสดงซากฟอสซิลไดโนเสาร์ที่ค้นพบในแขวงสะหวันนะเขต', 'Dinosaur fossils discovered in the province.'),
      p('dong-natad', 'nature', 'ดงนาทาด', 'Dong Natad', 'ป่าศักดิ์สิทธิ์ใกล้ตัวเมือง เดินป่าและเยี่ยมชุมชนท้องถิ่น', 'A sacred forest near town for walks and community visits.'),
      p('heuan-hin', 'history', 'เฮือนหิน', 'Heuan Hin', 'ซากโบราณสถานหินสมัยขอมริมแม่น้ำโขง', 'Ruins of a Khmer-era stone temple on the Mekong.'),
    ],
  },

  // ───────── ลาวใต้ ─────────
  {
    id: 'salavan', region: 'south',
    name: { th: 'สาละวัน', en: 'Salavan', lo: 'ສາລະວັນ' },
    capital: { th: 'สาละวัน', en: 'Salavan' },
    tagline: { th: 'น้ำตกตาดเลาะและผืนป่าริมโขง', en: 'Tad Lo falls and Mekong-side forests' },
    intro: {
      th: 'แขวงตอนบนของภาคใต้ ครอบคลุมส่วนหนึ่งของที่ราบสูงโบลาเวน มีน้ำตก หมู่บ้านชนเผ่า และป่าอนุรักษ์ริมแม่น้ำโขง',
      en: 'The upper part of the south, taking in part of the Bolaven Plateau, with waterfalls, ethnic villages and Mekong-side forests.',
    },
    tags: ['nature', 'culture', 'relax'],
    places: [
      p('tad-lo', 'waterfall', 'น้ำตกตาดเลาะ', 'Tad Lo Waterfall', 'น้ำตกหลายชั้นข้างหมู่บ้านเล็ก' + NB + 'ๆ บรรยากาศสงบ เหมาะแวะพักค้างคืน', 'Tiered falls beside a small village — a peaceful overnight stop.'),
      p('phou-xieng-thong', 'nature', 'ป่าสงวนภูเชียงทอง', 'Phou Xieng Thong NPA', 'ผืนป่าเกือบ 1,000 ตารางกิโลเมตรริมแม่น้ำโขง แหล่งอาศัยของสัตว์ป่าหายาก', 'Nearly 1,000 km² of Mekong-side forest, home to rare wildlife.'),
      p('bolaven-villages', 'culture', 'หมู่บ้านชนเผ่าบนที่ราบสูง', 'Plateau villages', 'แวะเยี่ยมหมู่บ้านและไร่กาแฟของชนเผ่าบนที่ราบสูงโบลาเวน', 'Visit ethnic villages and coffee farms on the Bolaven Plateau.'),
    ],
  },
  {
    id: 'sekong', region: 'south',
    name: { th: 'เซกอง', en: 'Sekong', lo: 'ເຊກອງ' },
    capital: { th: 'ละมาม', en: 'Lamam' },
    tagline: { th: 'น้ำตกกลางป่าและวิถีชนเผ่า', en: 'Forest waterfalls and ethnic traditions' },
    intro: {
      th: 'แขวงเล็กที่ยังคงความเป็นธรรมชาติ มีแม่น้ำเซกองไหลผ่าน น้ำตกริมทางหลายแห่ง และหมู่บ้านของชาวกะตูและตะเลียง',
      en: 'A small, unspoilt province crossed by the Sekong River, with roadside waterfalls and Katu and Talieng villages.',
    },
    tags: ['nature', 'culture', 'adventure'],
    places: [
      p('tad-faek', 'waterfall', 'น้ำตกตาดแฟก', 'Tad Faek', 'น้ำตกสูงราว 5 เมตรพร้อมแอ่งน้ำสองชั้น เล่นน้ำได้ ห่างจากตัวเมืองไม่ไกล', 'A 5 m waterfall with two swimming pools, close to town.'),
      p('tad-hua-khon', 'waterfall', 'น้ำตกตาดหัวคน', 'Tad Hua Khon', 'น้ำตกกว้างราว 100 เมตร ชื่อเล่าขานจากเหตุการณ์ในสงครามโลกครั้งที่ 2', 'A waterfall about 100 m wide whose name recalls a WWII episode.'),
      p('sekong-river', 'activity', 'ล่องแม่น้ำเซกอง', 'Sekong River trip', 'นั่งเรือหางยาวเลียบขอบที่ราบสูงโบลาเวนลงสู่อัตตะปือ', 'Long-tail boat trips along the edge of the Bolaven down to Attapeu.'),
      p('xe-xap', 'nature', 'ป่าสงวนเซซับ', 'Xe Xap NPA', 'ที่ราบสูงกลางป่าใหญ่บนความสูงราว 1,400 เมตร แหล่งอาศัยของสัตว์ใหญ่', 'Forested plateaus at about 1,400 m, home to large mammals.'),
      p('kandone', 'culture', 'บ้านกันดอน', 'Kandone Village', 'หมู่บ้านที่ขึ้นชื่อเรื่องงานแกะสลักไม้และบ้านยาวแบบดั้งเดิม', 'Known for woodcarving and traditional longhouses.'),
    ],
  },
  {
    id: 'champasak', region: 'south', image: 'champasak',
    name: { th: 'จำปาสัก', en: 'Champasak', lo: 'ຈຳປາສັກ' },
    capital: { th: 'ปากเซ', en: 'Pakse' },
    tagline: { th: 'มนต์เสน่ห์แห่งลาวใต้', en: 'The captivating spirit of the south' },
    intro: {
      th: 'แขวงที่รวมเสน่ห์ของลาวใต้ไว้ครบ ทั้งมรดกโลกวัดพู หมู่เกาะสี่พันดอน น้ำตกคอนพะเพ็ง และที่ราบสูงโบลาเวน เดินทางจากอุบลราชธานีผ่านด่านช่องเม็กได้สะดวก',
      en: 'Southern Laos at its best — World Heritage Vat Phou, the 4,000 Islands, Khone Phapheng falls and the Bolaven Plateau; easy to reach from Ubon Ratchathani via Chong Mek.',
    },
    tags: ['history', 'nature', 'relax'],
    places: [
      p('vat-phou', 'temple', 'ปราสาทวัดพู', 'Vat Phou', 'ปราสาทหินขอมโบราณเชิงภูเขา มรดกโลกยูเนสโกตั้งแต่ปี 2001', 'An ancient Khmer temple at the foot of a mountain, UNESCO-listed since 2001.', { photo: 'vat-phou' }),
      p('si-phan-don', 'nature', 'สี่พันดอน', 'Si Phan Don (4,000 Islands)', 'แม่น้ำโขงแผ่กว้างเป็นหมู่เกาะนับพัน พักผ่อนบนดอนเดช ดอนคอน หรือดอนโขง', 'The Mekong spreads into countless islands — stay on Don Det, Don Khon or Don Khong.', { photo: 'si-phan-don' }),
      p('khone-phapheng', 'waterfall', 'น้ำตกคอนพะเพ็ง', 'Khone Phapheng Falls', 'แก่งน้ำตกกลางแม่น้ำโขง ได้ชื่อว่ามีปริมาณน้ำมากที่สุดในเอเชียตะวันออกเฉียงใต้', 'Mekong cascades often called the largest waterfall in Southeast Asia by volume.', { photo: 'khone-phapheng' }),
      p('li-phi', 'waterfall', 'น้ำตกหลี่ผี', 'Li Phi Falls', 'สายน้ำโขงไหลแรงผ่านแก่งหินบนดอนคอน', 'The Mekong thundering through rocky channels on Don Khon.', { photo: 'li-phi' }),
      p('tad-fane', 'waterfall', 'น้ำตกตาดฟาน', 'Tad Fane', 'น้ำตกคู่สูงราว 120 เมตรบนที่ราบสูงโบลาเวน', 'Twin falls plunging about 120 m on the Bolaven Plateau.', { photo: 'tad-fane' }),
      p('paksong-coffee', 'culture', 'ไร่กาแฟปากซอง', 'Paksong coffee farms', 'ชิมกาแฟสดจากแหล่งปลูกกาแฟชื่อดังของลาวบนที่ราบสูงโบลาเวน', "Taste fresh coffee where Laos' best-known beans are grown.", { photo: 'paksong-coffee' }),
    ],
  },
  {
    id: 'attapeu', region: 'south',
    name: { th: 'อัตตะปือ', en: 'Attapeu', lo: 'ອັດຕະປື' },
    capital: { th: 'สามัคคีไซ', en: 'Samakkhixay' },
    tagline: { th: 'ทะเลสาบหนองฟ้าและน้ำตกในป่าเซเปียน', en: 'Nong Fa lake and the falls of Xe Pian' },
    intro: {
      th: 'แขวงทางตะวันออกเฉียงใต้สุด ตัวเมืองตั้งอยู่ในหุบเขาสวย มีทะเลสาบศักดิ์สิทธิ์ น้ำตกในป่าอนุรักษ์ และพระธาตุเก่าแก่สมัยล้านช้าง',
      en: 'The far southeast: a capital in a scenic valley, a sacred lake, waterfalls in protected forest and a Lane Xang–era stupa.',
    },
    tags: ['nature', 'history', 'adventure'],
    places: [
      p('nong-fa', 'nature', 'ทะเลสาบหนองฟ้า', 'Nong Fa Lake', 'ทะเลสาบบนภูเขาที่เชื่อกันว่าเกิดจากปล่องภูเขาไฟเก่า ชาวบ้านถือเป็นที่ศักดิ์สิทธิ์', 'A mountain lake believed to fill an old volcanic crater, sacred to villagers.'),
      p('tad-saepha', 'waterfall', 'น้ำตกตาดแสผา', 'Tad Saepha', 'น้ำตกบนแม่น้ำเซเปียนในป่าอนุรักษ์ เดินเท้าหรือนั่งเรือกับไกด์ท้องถิ่นจากบ้านใหม่', 'A waterfall on the Xe Pian river, reached on foot or by boat with a guide from Ban Mai.'),
      p('saysettha-stupa', 'temple', 'พระธาตุไซเชษฐา', 'Saysettha Stupa', 'พระธาตุที่สร้างเมื่อปี 1577 เชื่อมโยงกับพระเจ้าไชยเชษฐาธิราชแห่งล้านช้าง', 'A stupa built in 1577, linked to King Setthathirath of Lane Xang.'),
      p('samakkhixay-market', 'market', 'ตลาดเช้าสามัคคีไซ', 'Samakkhixay morning market', 'ตลาดยามเช้าที่ชนเผ่าต่าง' + NB + 'ๆ นำสินค้าพื้นเมืองมาขาย', 'An early market where many ethnic groups trade local produce.'),
      p('dong-amphan', 'nature', 'ป่าสงวนดงอำพาน', 'Dong Amphan NPA', 'ป่าอนุรักษ์ขนาดใหญ่ แหล่งอาศัยของเสือ ช้าง และสัตว์ป่าหายาก', 'A vast protected forest that shelters tigers, elephants and rare wildlife.'),
    ],
  },
];

// การ์ดเมืองแนะนำบนหน้าแรก
export const featured = [
  { provinceId: 'luang-prabang', image: 'luang-prabang', name: { th: 'หลวงพระบาง', en: 'Luang Prabang' }, label: { th: 'แขวงหลวงพระบาง', en: 'Luang Prabang Province' }, tagline: { th: 'เมืองมรดกโลกที่เวลาเดินช้าลง', en: 'A heritage town where time slows down' }, chips: [{ th: 'แนะนำ 3–4 วัน', en: '3–4 days' }, { th: 'รถไฟจากเวียงจันทน์ ~2 ชม.', en: '~2 hrs by train from Vientiane' }] },
  { provinceId: 'vientiane-province', image: 'vang-vieng', name: { th: 'วังเวียง', en: 'Vang Vieng' }, label: { th: 'แขวงเวียงจันทน์', en: 'Vientiane Province' }, tagline: { th: 'ธรรมชาติที่ชวนให้หยุดมอง', en: 'Nature that invites you to pause' }, chips: [{ th: 'แนะนำ 2–3 วัน', en: '2–3 days' }, { th: 'รถไฟจากเวียงจันทน์ ~1 ชม.', en: '~1 hr by train from Vientiane' }] },
  { provinceId: 'vientiane-capital', image: 'vientiane', name: { th: 'เวียงจันทน์', en: 'Vientiane' }, label: { th: 'นครหลวงเวียงจันทน์', en: 'Vientiane Capital' }, tagline: { th: 'เสน่ห์เมืองหลวงริมโขง', en: 'The charm of a capital by the Mekong' }, chips: [{ th: 'แนะนำ 1–2 วัน', en: '1–2 days' }, { th: 'ใกล้ด่านสะพานมิตรภาพ', en: 'Near the Friendship Bridge' }] },
  { provinceId: 'champasak', image: 'champasak', name: { th: 'จำปาสัก', en: 'Champasak' }, label: { th: 'แขวงจำปาสัก', en: 'Champasak Province' }, tagline: { th: 'มนต์เสน่ห์แห่งลาวใต้', en: 'The captivating spirit of the south' }, chips: [{ th: 'แนะนำ 3–4 วัน', en: '3–4 days' }, { th: 'บินตรงจากเวียงจันทน์', en: 'Direct flights from Vientiane' }] },
];

// สไลด์ภาพหลักบนหน้าแรก
export const slides = [
  { provinceId: 'vientiane-province', image: 'hero', photo: 'vang-vieng', name: { th: 'วังเวียง', en: 'Vang Vieng' }, line: { th: 'ขุนเขา สายน้ำ และความสงบ', en: 'Mountains, rivers and a little stillness' }, alt: { th: 'ภูเขาหินปูนและทุ่งสีเขียวสะท้อนบนผิวน้ำที่วังเวียง', en: 'Limestone mountains and green fields reflected in the water at Vang Vieng' } },
  { provinceId: 'luang-prabang', image: 'luang-prabang', photo: 'phousi', name: { th: 'หลวงพระบาง', en: 'Luang Prabang' }, line: { th: 'เมืองมรดกโลกที่เวลาเดินช้าลง', en: 'A heritage town where time slows down' }, alt: { th: 'หลังคาเมืองหลวงพระบางและแม่น้ำโขงยามเย็นมองจากพระธาตุพูสี', en: 'Luang Prabang rooftops and the Mekong at dusk, seen from Mount Phousi' } },
  { provinceId: 'champasak', image: 'champasak', photo: 'tad-fane', name: { th: 'จำปาสัก', en: 'Champasak' }, line: { th: 'มนต์เสน่ห์แห่งลาวใต้', en: 'The captivating spirit of the south' }, alt: { th: 'น้ำตกตาดฟานคู่กลางป่าบนที่ราบสูงโบลาเวน', en: 'The twin Tad Fane waterfalls in the forest of the Bolaven Plateau' } },
  { provinceId: 'vientiane-capital', image: 'vientiane', photo: 'that-luang', name: { th: 'เวียงจันทน์', en: 'Vientiane' }, line: { th: 'เสน่ห์เมืองหลวงริมโขง', en: 'The charm of a capital by the Mekong' }, alt: { th: 'พระธาตุหลวงสีทองและลานวัดใต้ท้องฟ้าที่นครหลวงเวียงจันทน์', en: 'Golden Pha That Luang and its temple grounds under the sky in Vientiane' } },
  { provinceId: 'luang-prabang', placeRef: 'luang-prabang/kuang-si', photo: 'kuang-si', name: { th: 'น้ำตกตาดกวางสี', en: 'Kuang Si Falls' }, line: { th: 'สายน้ำสีฟ้าท่ามกลางป่าเขียว', en: 'Turquoise pools in a green forest' }, alt: { th: 'น้ำตกตาดกวางสีไหลเป็นชั้นลงสู่แอ่งน้ำสีฟ้าท่ามกลางป่า', en: 'Kuang Si Falls cascading into a turquoise forest pool' } },
  { provinceId: 'luang-prabang', placeRef: 'luang-prabang/nong-khiaw', photo: 'nong-khiaw', name: { th: 'หนองเขียว', en: 'Nong Khiaw' }, line: { th: 'แม่น้ำอูคดเคี้ยวระหว่างขุนเขา', en: 'The Nam Ou winding between green peaks' }, alt: { th: 'ทิวเขาเขียวล้อมหมู่บ้านและสะพานข้ามแม่น้ำอูที่หนองเขียว', en: 'Green mountains around Nong Khiaw village and the Nam Ou bridge' } },
  { provinceId: 'champasak', placeRef: 'champasak/si-phan-don', photo: 'si-phan-don', name: { th: 'สี่พันดอน', en: 'Si Phan Don' }, line: { th: 'ยามเย็นที่แม่น้ำโขงค่อย ๆ เปลี่ยนสี', en: 'Soft evening colours over the Mekong' }, alt: { th: 'เรือลำเล็กบนแม่น้ำโขงใกล้ดอนเด็ตใต้เมฆสีชมพูยามเย็น', en: 'A small boat on the Mekong near Don Det beneath pink evening clouds' } },
  { provinceId: 'khammouane', placeRef: 'khammouane/kong-lor', photo: 'kong-lor', name: { th: 'ถ้ำกองลอ', en: 'Kong Lor Cave' }, line: { th: 'สายน้ำสีเขียวหน้าประตูภูผา', en: 'Emerald water at the limestone cave entrance' }, alt: { th: 'ปากถ้ำกองลอในหน้าผาหินปูนเหนือสายน้ำสีเขียว', en: 'Kong Lor Cave opening in a limestone cliff above green water' } },
  { provinceId: 'luang-prabang', placeRef: 'luang-prabang/muang-ngoi', photo: 'muang-ngoi', name: { th: 'เมืองงอย', en: 'Muang Ngoi' }, line: { th: 'หมู่บ้านเล็กในอ้อมกอดแม่น้ำอู', en: 'A quiet village beside the Nam Ou' }, alt: { th: 'หมู่บ้านเมืองงอยและแม่น้ำอูมองจากจุดชมวิวผาน้อย', en: 'Muang Ngoi village and the Nam Ou seen from Phanoi Viewpoint' } },
  { provinceId: 'luang-prabang', placeRef: 'luang-prabang/wat-xieng-thong', photo: 'wat-xieng-thong', name: { th: 'วัดเชียงทอง', en: 'Wat Xieng Thong' }, line: { th: 'หลังคาซ้อนอ่อนช้อยแห่งหลวงพระบาง', en: 'The sweeping temple roofs of Luang Prabang' }, alt: { th: 'สิมวัดเชียงทองพร้อมหลังคาซ้อนและลวดลายสีทองในลานวัด', en: 'Wat Xieng Thong temple with sweeping tiered roofs and gold decoration' } },
  { provinceId: 'vientiane-province', placeRef: 'vientiane-province/nam-xay', photo: 'nam-xay', name: { th: 'จุดชมวิวน้ำไซ', en: 'Nam Xay Viewpoint' }, line: { th: 'สายหมอกลอยผ่านยอดเขาหินปูน', en: 'Morning mist among limestone peaks' }, alt: { th: 'ยอดเขาหินปูน ทุ่งนา และสายหมอกยามเช้ามองจากน้ำไซที่วังเวียง', en: 'Limestone peaks, fields and morning mist seen from Nam Xay in Vang Vieng' } },
  { provinceId: 'champasak', placeRef: 'champasak/vat-phou', photo: 'vat-phou', name: { th: 'วัดพู', en: 'Vat Phou' }, line: { th: 'ขั้นบันไดโบราณใต้ร่มลีลาวดี', en: 'Ancient stone steps beneath plumeria trees' }, alt: { th: 'ต้นลีลาวดีแผ่กิ่งเหนือบันไดหินเก่าแก่ที่วัดพู', en: 'Plumeria trees growing over the ancient stone stairway at Vat Phou' } },
  { provinceId: 'xiengkhouang', placeRef: 'xiengkhouang/plain-of-jars', photo: 'plain-of-jars', name: { th: 'ทุ่งไหหิน', en: 'Plain of Jars' }, line: { th: 'ร่องรอยอดีตบนเนินทุ่งหญ้า', en: 'Traces of the past across grassy hills' }, alt: { th: 'กลุ่มไหหินโบราณบนทุ่งหญ้าที่แขวงเชียงขวาง', en: 'Ancient stone jars standing across a grassy field in Xiengkhouang' } },
  { provinceId: 'champasak', placeRef: 'champasak/khone-phapheng', photo: 'khone-phapheng', name: { th: 'น้ำตกคอนพะเพ็ง', en: 'Khone Phapheng Falls' }, line: { th: 'พลังสายน้ำโขงแห่งลาวใต้', en: 'The power of the Mekong in southern Laos' }, alt: { th: 'สายน้ำเชี่ยวของน้ำตกคอนพะเพ็งไหลผ่านแนวโขดหิน', en: 'Khone Phapheng Falls rushing through broad rocky channels' } },
];

// จุดเด่นที่อธิบายความสามารถของเว็บไซต์ ไม่อ้างบริการบริษัทที่ยังไม่ได้ยืนยัน
export const valueProps = [
  { icon: 'pin', title: { th: 'สำรวจครบ 18 แขวง', en: 'Explore all 18 provinces' }, text: { th: 'เลือกเมืองและสถานที่ผ่านแผนที่ลาว', en: 'Find destinations on an interactive Laos map' } },
  { icon: 'people', title: { th: 'เลือกตามสไตล์การเดินทาง', en: 'Find your travel style' }, text: { th: 'ธรรมชาติ วัฒนธรรม และวันพักผ่อน', en: 'Nature, culture and time to unwind' } },
  { icon: 'train', title: { th: 'ดูตัวอย่างแผนการเดินทาง', en: 'Find itinerary ideas' }, text: { th: 'ดูแผนรายวันและจุดหมายตัวอย่าง', en: 'Browse suggested days and route stops' } },
  { icon: 'sliders', title: { th: 'เตรียมความต้องการให้พร้อม', en: 'Prepare your trip details' }, text: { th: 'รวบรวมที่เที่ยว วันเดินทาง และจำนวนคน', en: 'Collect places, dates and group size' } },
];

export const steps = [
  { title: { th: 'เลือกสถานที่ที่อยากไป', en: 'Choose places you would love to visit' }, text: { th: 'ดูภาพและรายละเอียดแต่ละแขวง แล้วเก็บสถานที่ที่สนใจไว้', en: 'Explore images and province details, then save the places you like.' } },
  { title: { th: 'เตรียมรายละเอียดการเดินทาง', en: 'Prepare your trip details' }, text: { th: 'ระบุวันเดินทาง จำนวนคน จุดรับ–ส่ง และความต้องการเพิ่มเติม', en: 'Note your dates, group size, start and end points, and preferences.' } },
  { title: { th: 'สอบถามและตรวจใบเสนอราคา', en: 'Inquire and review the quote' }, text: { th: 'ส่งข้อมูลผ่านช่องทางที่เปิดใช้งาน และตรวจราคา รายการรวม และเงื่อนไขก่อนยืนยัน', en: 'Send your brief through an available contact channel, then check the price, inclusions and terms before confirming.' } },
];

// ที่เที่ยวยอดนิยม: รายละเอียดสำหรับหน้าของแต่ละสถานที่ (อ้างอิงแบบ 'id แขวง/id สถานที่')
// ลำดับในรายการนี้ = ลำดับที่แสดงในหน้า "ที่เที่ยวยอดนิยม"
// best = ช่วงเวลาที่ดี, time = ควรใช้เวลา, access = การเดินทาง, note = น่ารู้ (ไม่ใส่ก็ได้)
// tip = เคล็ดลับจากทีมงานที่ไปมาจริง ใส่ครบ { th, en, lo, zh } (ไม่ใส่ก็ได้; แสดงเป็นกล่อง “เคล็ดลับจากทีมงาน” เมื่อมีข้อความเท่านั้น)
export const placeDetails = {
  'luang-prabang/wat-xieng-thong': {
    about: {
      th: 'วัดสำคัญที่สุดแห่งหนึ่งของหลวงพระบาง สร้างราวปี 1560 ในสมัยพระเจ้าไชยเชษฐาธิราช หลังคาซ้อนที่ลาดต่ำเกือบจรดพื้นคือต้นแบบของสถาปัตยกรรมแบบหลวงพระบาง ส่วนผนังด้านหลังสิมประดับลายต้นทองด้วยกระจกสีที่งดงามจนต้องหยุดมอง',
      en: "One of Luang Prabang's most important temples, built around 1560 under King Setthathirath. Its sweeping roofs, reaching almost to the ground, define the classic Luang Prabang style, and the back wall of the ordination hall glitters with a glass-mosaic Tree of Life.",
    },
    highlights: {
      th: ['หลังคาซ้อนแบบหลวงพระบางแท้', 'ลายกระจกสีรูปต้นทองด้านหลังสิม', 'โรงเก็บราชรถที่แกะสลักวิจิตร'],
      en: ['Classic tiered Luang Prabang roofs', 'The glass-mosaic Tree of Life', 'The carved royal carriage hall'],
    },
    best: { th: 'เช้าหรือบ่ายแก่' + NB + 'ๆ แสงสวยและคนไม่มาก', en: 'Early morning or late afternoon' },
    time: { th: 'ราว 1 ชั่วโมง', en: 'About 1 hour' },
    access: { th: 'ปลายแหลมเมืองเก่า เดินเที่ยวได้', en: 'At the tip of the old-town peninsula, on foot' },
    note: { th: 'แต่งกายสุภาพ คลุมไหล่และเข่า', en: 'Dress modestly, covering shoulders and knees' },
  },
  'luang-prabang/kuang-si': {
    about: {
      th: 'น้ำตกหินปูนหลายชั้นกลางป่า สายน้ำไหลลดหลั่นลงสู่แอ่งสีฟ้าเทอร์ควอยซ์ต่อกันหลายแอ่ง มีจุดที่อนุญาตให้ลงเล่นน้ำ และทางเดินขึ้นไปชมน้ำตกชั้นบนสุด ใกล้ทางเข้ายังมีศูนย์ช่วยเหลือหมีให้แวะชมด้วย',
      en: 'Tiered limestone falls in the forest, spilling into a chain of turquoise pools. Some pools are open for swimming, a trail climbs to the top tier, and a bear rescue centre sits near the entrance.',
    },
    highlights: {
      th: ['แอ่งน้ำสีฟ้าใสหลายชั้น', 'ลงเล่นน้ำในจุดที่กำหนด', 'ศูนย์ช่วยเหลือหมีใกล้ทางเข้า'],
      en: ['Tier after tier of turquoise pools', 'Swimming in designated pools', 'A bear rescue centre near the entrance'],
    },
    best: { th: 'ช่วงเช้าก่อนคนเยอะ ฤดูแล้งน้ำสีฟ้าสวยที่สุด', en: 'Mornings before the crowds; the water is bluest in the dry season' },
    time: { th: 'ครึ่งวัน', en: 'Half a day' },
    access: { th: 'ห่างตัวเมืองราว 30 กม. นั่งรถราว 45 นาที', en: 'About 30 km from town, roughly 45 minutes by road' },
    note: { th: 'เตรียมชุดว่ายน้ำและรองเท้ากันลื่น', en: 'Bring swimwear and non-slip sandals' },
  },
  'luang-prabang/phousi': {
    about: {
      th: 'เนินเขากลางเมืองหลวงพระบาง เดินขึ้นบันได 328 ขั้นสู่พระธาตุจอมสีบนยอด มองเห็นแม่น้ำโขง แม่น้ำคาน หลังคาวัด และทิวเขารอบเมืองได้รอบทิศ ยามเย็นเป็นจุดชมพระอาทิตย์ตกที่นิยมที่สุดของเมือง',
      en: "A hill in the middle of town: 328 steps lead to That Chomsi stupa at the top, with views over the Mekong, the Nam Khan, temple roofs and the mountains beyond. It is the town's favourite sunset spot.",
    },
    highlights: {
      th: ['วิวเมืองเก่าและแม่น้ำสองสาย', 'พระธาตุจอมสีบนยอดเขา', 'พระอาทิตย์ตกเหนือแม่น้ำโขง'],
      en: ['Views over the old town and two rivers', 'That Chomsi stupa at the summit', 'Sunset over the Mekong'],
    },
    best: { th: 'ก่อนพระอาทิตย์ตก หรือเช้าตรู่ที่คนน้อยกว่า', en: 'Before sunset, or early morning for fewer people' },
    time: { th: 'ราว 1 ชั่วโมง', en: 'About 1 hour' },
    access: { th: 'ทางขึ้นหลักอยู่ตรงข้ามพระราชวัง บนถนนศรีสว่างวงศ์', en: 'Main stairway opposite the Royal Palace on Sisavangvong Road' },
    note: { th: 'ช่วงเย็นคนเยอะ ควรขึ้นก่อนพระอาทิตย์ตกราว 30–45 นาที', en: 'It gets busy at sunset, so arrive 30–45 minutes early' },
  },
  'luang-prabang/alms-giving': {
    about: {
      th: 'ทุกเช้าก่อนฟ้าสาง พระสงฆ์และสามเณรเดินเรียงแถวออกบิณฑบาตไปตามถนนในเมืองเก่า ชาวบ้านนั่งรอใส่บาตรด้วยข้าวเหนียวอย่างเงียบสงบ เป็นประเพณีที่สืบทอดมายาวนานและเป็นหัวใจของหลวงพระบาง',
      en: 'Every morning before sunrise, long lines of monks and novices walk through the old town to receive sticky rice from kneeling residents. It is a quiet, living tradition at the heart of Luang Prabang.',
    },
    highlights: {
      th: ['ขบวนจีวรสีส้มท่ามกลางแสงเช้า', 'ใส่บาตรข้าวเหนียวตามแบบชาวลาว', 'เมืองเก่าในยามที่เงียบสงบที่สุด'],
      en: ['Saffron robes in the early light', 'Offering sticky rice the Lao way', 'The old town at its most peaceful'],
    },
    best: { th: 'ราว 05:30–06:30 น. ขึ้นกับฤดู', en: 'Around 5:30–6:30 am, depending on the season' },
    time: { th: 'ราว 30–45 นาที', en: '30–45 minutes' },
    access: { th: 'ถนนสักกะลินและถนนศรีสว่างวงศ์ในเมืองเก่า', en: 'Sakkaline and Sisavangvong roads in the old town' },
    note: { th: 'อยู่ห่างพอสมควร ไม่ใช้แฟลช ไม่ขวางทางพระ และแต่งกายสุภาพ', en: 'Keep your distance, no flash, never block the monks, dress modestly' },
  },
  'luang-prabang/royal-palace': {
    about: {
      th: 'พระราชวังที่เริ่มสร้างในปี 1904 สมัยอาณานิคมฝรั่งเศส สำหรับเจ้ามหาชีวิตศรีสว่างวงศ์ ปัจจุบันเป็นพิพิธภัณฑ์แห่งชาติ จัดแสดงท้องพระโรง ห้องประทับ และของขวัญจากต่างแดน ในบริเวณเดียวกันมีหอพระบาง วิหารประดับทองที่สร้างขึ้นเพื่อประดิษฐานพระบาง พระพุทธรูปคู่บ้านคู่เมืองที่มาของชื่อหลวงพระบาง',
      en: 'Begun in 1904, during the French colonial era, for King Sisavang Vong, the palace is now the National Museum, with its throne hall, royal rooms and gifts from abroad. In its grounds stands Haw Pha Bang, a gilded temple built to house the Phra Bang, the revered Buddha image that gave the city its name.',
    },
    highlights: {
      th: ['ท้องพระโรงและห้องประทับในอดีต', 'หอพระบาง วิหารสีทองโดดเด่น', 'อยู่ตรงข้ามทางขึ้นพูสี เที่ยวต่อกันได้'],
      en: ['The former throne hall and royal rooms', 'The gilded Haw Pha Bang', 'Right across from the Phou Si stairway'],
    },
    best: { th: 'ช่วงเช้า', en: 'Morning' },
    time: { th: '1–1.5 ชั่วโมง', en: '1–1.5 hours' },
    access: { th: 'ถนนศรีสว่างวงศ์ ใจกลางเมืองเก่า', en: 'Sisavangvong Road, in the heart of the old town' },
    note: { th: 'แต่งกายสุภาพ คลุมไหล่และเข่า', en: 'Dress modestly, covering shoulders and knees' },
  },
  'luang-prabang/night-market': {
    about: {
      th: 'ทุกเย็นถนนศรีสว่างวงศ์จะปิดให้แม่ค้ากางเต็นท์เรียงยาว ขายผ้าทอมือ งานปักของชาวม้ง โคมกระดาษสา และของที่ระลึกงานฝีมือ ซอยข้างตลาดมีอาหารพื้นเมืองให้ชิมหลากหลาย เดินเล่นเพลิน' + NB + 'ๆ หลังชมพระอาทิตย์ตกที่พูสี',
      en: 'Every evening Sisavangvong Road closes to traffic as rows of stalls fill with handwoven textiles, Hmong embroidery, paper lanterns and handmade souvenirs. A side lane serves local food — an easy stroll after sunset on Phou Si.',
    },
    highlights: {
      th: ['ผ้าทอและงานปักฝีมือชาวบ้าน', 'ซอยอาหารพื้นเมืองราคาเป็นกันเอง', 'บรรยากาศไฟสลัวใต้เต็นท์สีสด'],
      en: ['Handwoven textiles and embroidery', 'A lane of affordable local food', 'Lantern-lit rows of colourful stalls'],
    },
    best: { th: 'ราว 17:00–22:00 น.', en: 'Around 5–10 pm' },
    time: { th: '1–2 ชั่วโมง', en: '1–2 hours' },
    access: { th: 'ถนนศรีสว่างวงศ์ หน้าพระราชวัง', en: 'Sisavangvong Road, in front of the Royal Palace' },
    note: { th: 'ต่อราคาได้อย่างสุภาพ และพกเงินกีบติดตัวไว้บ้าง', en: 'Bargain politely and carry some kip' },
  },
  'luang-prabang/pak-ou': {
    about: {
      th: 'ถ้ำสองแห่งในหน้าผาริมแม่น้ำโขง ตรงจุดที่แม่น้ำอูไหลมาบรรจบ ภายในมีพระพุทธรูปนับพันองค์ที่ผู้คนนำมาถวายสืบต่อกันหลายร้อยปี การนั่งเรือทวนน้ำโขงไปชมเป็นอีกครึ่งหนึ่งของความประทับใจ',
      en: 'Two caves in a cliff where the Nam Ou meets the Mekong, filled with thousands of Buddha images left by worshippers over centuries. The boat ride up the Mekong is half the experience.',
    },
    highlights: {
      th: ['พระพุทธรูปนับพันองค์ในถ้ำ', 'ล่องเรือชมวิวสองฝั่งโขง', 'ถ้ำบนที่มืดและเงียบสงบ'],
      en: ['Thousands of Buddha images', 'A scenic Mekong boat ride', 'The dark, quiet upper cave'],
    },
    best: { th: 'ช่วงเช้า อากาศบนเรือเย็นสบาย', en: 'Morning, when the river is cool' },
    time: { th: 'ครึ่งวัน รวมเวลาเดินทาง', en: 'Half a day including the boat ride' },
    access: { th: 'นั่งเรือทวนน้ำโขงจากตัวเมืองราว 1.5–2 ชั่วโมง', en: 'About 1.5–2 hours upstream by boat from town' },
    note: { th: 'ถ้ำบนค่อนข้างมืด ควรพกไฟฉาย', en: 'Bring a torch for the upper cave' },
  },
  'luang-prabang/nong-khiaw': {
    about: {
      th: 'เมืองเล็กริมแม่น้ำอูที่โอบล้อมด้วยภูเขาหินปูนสูงชัน เดินขึ้นจุดชมวิวผาแดงราว 1 ชั่วโมง จะเห็นแม่น้ำอูคดเคี้ยวผ่านหุบเขา และทะเลหมอกในยามเช้า เหมาะกับคนที่อยากพักช้า' + NB + 'ๆ ใกล้ธรรมชาติ',
      en: 'A small town on the Nam Ou, ringed by steep limestone peaks. An hour-long hike to the Pha Daeng viewpoint reveals the river winding through the valley, often under a sea of morning mist.',
    },
    highlights: {
      th: ['จุดชมวิวผาแดงเหนือทะเลหมอก', 'วิวภูเขาจากสะพานข้ามแม่น้ำอู', 'จุดลงเรือไปเมืองงอย'],
      en: ['Pha Daeng viewpoint above the mist', 'Mountain views from the Nam Ou bridge', 'Where the boat to Muang Ngoi leaves'],
    },
    best: { th: 'พ.ย.–ก.พ. ลุ้นทะเลหมอกยามเช้า', en: 'November–February, for morning mist' },
    time: { th: '1–2 คืน', en: '1–2 nights' },
    access: { th: 'ห่างหลวงพระบางราว 140 กม. นั่งรถตู้ราว 3 ชั่วโมง', en: 'About 140 km from Luang Prabang, roughly 3 hours by van' },
    note: { th: 'ทางขึ้นผาแดงลื่นในฤดูฝน ควรใส่รองเท้าเดินป่า', en: 'The trail is slippery in the rainy season, so wear proper shoes' },
  },
  'luang-prabang/muang-ngoi': {
    about: {
      th: 'หมู่บ้านเล็ก' + NB + 'ๆ ริมแม่น้ำอู นั่งเรือจากหนองเขียวราว 1 ชั่วโมง บรรยากาศเงียบสงบ มีเกสต์เฮาส์ริมน้ำ ทุ่งนา และภูเขาโอบล้อม เดินขึ้นจุดชมวิวผาน้อย เดินเที่ยวถ้ำและหมู่บ้านใกล้เคียง หรือนอนเปลมองแม่น้ำ ก็คุ้มค่าการเดินทางแล้ว',
      en: 'A small village on the Nam Ou, about an hour by boat from Nong Khiaw. Life is slow here, with riverside guesthouses, rice fields and mountains all around. Climb the Phanoi viewpoint, walk to caves and nearby villages, or simply watch the river from a hammock.',
    },
    highlights: {
      th: ['จุดชมวิวผาน้อย เห็นหมู่บ้านและแม่น้ำอู', 'ถ้ำกางและหมู่บ้านบ้านนา บ้านห้วยบ่อ', 'นั่งเรือเลาะแม่น้ำอูท่ามกลางขุนเขา'],
      en: ['Phanoi viewpoint over the village and river', 'Tham Kang cave and the villages of Ban Na and Huay Bo', 'A boat ride on the Nam Ou through the mountains'],
    },
    best: { th: 'ฤดูแล้ง ต.ค.–เม.ย.', en: 'Dry season, October–April' },
    time: { th: '1–2 คืน', en: '1–2 nights' },
    access: { th: 'นั่งเรือโดยสารจากท่าเรือหนองเขียวราว 1 ชั่วโมง', en: 'About 1 hour by passenger boat from Nong Khiaw pier' },
    note: { th: 'พกเงินสดไปให้พอ เพราะบริการในหมู่บ้านมีจำกัด', en: 'Bring enough cash, as services in the village are limited' },
  },
  'xiengkhouang/plain-of-jars': {
    about: {
      th: 'ไหหินขนาดใหญ่นับพันใบกระจายอยู่บนทุ่งหญ้าและเนินเขารอบเมืองโพนสะหวัน เชื่อกันว่าเกี่ยวข้องกับพิธีกรรมศพในยุคเหล็ก อายุราว 1,500–2,500 ปี และได้รับการขึ้นทะเบียนเป็นมรดกโลกเมื่อปี 2019',
      en: 'Thousands of huge stone jars lie scattered across grassy hills around Phonsavan. Linked to Iron Age funeral practices some 1,500–2,500 years ago, they were inscribed as a UNESCO World Heritage Site in 2019.',
    },
    highlights: {
      th: ['ไหหินยักษ์อายุนับพันปี', 'จุดที่ 1 ใกล้เมืองโพนสะหวัน เดินชมง่าย', 'เรื่องราวประวัติศาสตร์ของเชียงขวาง'],
      en: ['Giant stone jars thousands of years old', 'Easy-to-visit Site 1 near Phonsavan', 'The wider story of Xieng Khouang'],
    },
    best: { th: 'ฤดูแล้ง พ.ย.–เม.ย.', en: 'Dry season, November–April' },
    time: { th: 'ครึ่งวันถึง 1 วัน', en: 'Half a day to a full day' },
    access: { th: 'ใกล้เมืองโพนสะหวัน มีเที่ยวบินจากเวียงจันทน์', en: 'Near Phonsavan, which has flights from Vientiane' },
    note: { th: 'เดินตามทางที่มีหลักหมายเท่านั้น เพราะในพื้นที่ยังมีระเบิดตกค้าง', en: 'Stay on marked paths, as unexploded ordnance remains in the area' },
  },
  'bokeo/slow-boat': {
    about: {
      th: 'ล่องเรือไม้ลำยาวตามแม่น้ำโขงจากห้วยทรายสู่หลวงพระบาง ใช้เวลา 2 วัน และค้างคืนที่ปากแบ่ง ระหว่างทางผ่านหาดทราย ภูเขา และหมู่บ้านริมน้ำที่ยังใช้ชีวิตตามจังหวะของแม่น้ำ เป็นการเดินทางที่ช้าแต่ได้เห็นลาวในแบบที่ถนนพาไปไม่ถึง',
      en: 'A two-day journey down the Mekong from Houay Xai to Luang Prabang in a long wooden boat, with a night in Pakbeng. Sandbanks, forested hills and riverside villages slide by — slow travel at its best.',
    },
    highlights: {
      th: ['วิวแม่น้ำโขงตลอด 2 วัน', 'ค้างคืนที่เมืองท่าปากแบ่ง', 'หมู่บ้านริมน้ำระหว่างทาง'],
      en: ['Two days of Mekong scenery', 'An overnight stop in Pakbeng', 'Riverside villages along the way'],
    },
    best: { th: 'ฤดูแล้ง พ.ย.–เม.ย.', en: 'Dry season, November–April' },
    time: { th: '2 วัน 1 คืน', en: '2 days, 1 night' },
    access: { th: 'ข้ามแดนเชียงของ–ห้วยทราย แล้วลงเรือที่ท่าเรือห้วยทราย', en: 'Cross from Chiang Khong to Houay Xai and board at the pier' },
    note: { th: 'เตรียมเบาะรองนั่ง เสื้อกันลม และของกินระหว่างทาง', en: 'Bring a cushion, a windbreaker and snacks' },
  },
  'vientiane-province/vang-vieng': {
    about: {
      th: 'เมืองเล็กริมแม่น้ำซองที่รายล้อมด้วยภูเขาหินปูนรูปทรงแปลกตา ทุ่งนา และถ้ำ เป็นศูนย์รวมกิจกรรมกลางแจ้ง ทั้งพายเรือคายัค ล่องห่วงยาง ขึ้นบอลลูน และเดินขึ้นจุดชมวิว นั่งรถไฟลาว–จีนจากเวียงจันทน์เพียงราว 1 ชั่วโมง',
      en: 'A small town on the Nam Song surrounded by dramatic karst peaks, rice fields and caves. It is the hub for outdoor fun — kayaking, tubing, ballooning and viewpoint hikes — about an hour from Vientiane on the Laos–China Railway.',
    },
    highlights: {
      th: ['ภูเขาหินปูนสะท้อนผืนน้ำ', 'กิจกรรมกลางแจ้งครบในที่เดียว', 'ทุ่งนาและหมู่บ้านรอบเมือง'],
      en: ['Karst peaks reflected in the water', 'Outdoor adventures in one place', 'Rice fields and villages around town'],
    },
    best: { th: 'พ.ย.–ก.พ. อากาศเย็นสบาย ท้องฟ้าใส', en: 'November–February, cool and clear' },
    time: { th: '2–3 วัน', en: '2–3 days' },
    access: { th: 'รถไฟลาว–จีนจากเวียงจันทน์ราว 1 ชั่วโมง', en: 'About 1 hour from Vientiane by train' },
  },
  'vientiane-province/nam-xay': {
    about: {
      th: 'เขาลูกเล็กห่างจากตัวเมืองวังเวียงราว 8 กม. เดินขึ้นทางชันราว 30 นาทีก็ถึงยอด มองเห็นภูเขาหินปูนและทุ่งนาไกลสุดตา บนยอดมีรถมอเตอร์ไซค์เก่ากับธงชาติลาวให้ถ่ายรูป ซึ่งกลายเป็นภาพจำของวังเวียงไปแล้ว',
      en: "A small peak about 8 km from Vang Vieng. A steep 30-minute climb leads to the top, with karst mountains and rice fields as far as the eye can see — and an old motorbike with a Lao flag that has become Vang Vieng's signature photo.",
    },
    highlights: {
      th: ['วิวภูเขาหินปูนรอบทิศ', 'มุมถ่ายรูปกับมอเตอร์ไซค์บนยอดเขา', 'ทะเลหมอกยามเช้าในฤดูหนาว'],
      en: ['All-round karst views', 'The famous motorbike photo spot', 'Morning mist in the cool season'],
    },
    best: { th: 'เช้าตรู่หรือก่อนพระอาทิตย์ตก (เปิด 06:00–18:00 น.)', en: 'Early morning or before sunset (open 6 am–6 pm)' },
    time: { th: 'ราว 1.5 ชั่วโมง ไป–กลับ', en: 'About 1.5 hours return' },
    access: { th: 'ห่างตัวเมืองราว 8 กม. ไปด้วยรถตุ๊กตุ๊กหรือมอเตอร์ไซค์', en: 'About 8 km from town by tuk-tuk or motorbike' },
    note: { th: 'ทางชันและขรุขระ ควรใส่รองเท้าผ้าใบ', en: 'The trail is steep and rough, so wear trainers' },
  },
  'vientiane-province/blue-lagoon': {
    about: {
      th: 'แอ่งน้ำสีฟ้าอมเขียวใต้ร่มไม้ใหญ่ ห่างตัวเมืองราว 7 กม. ปีนต้นไม้กระโดดน้ำ โหนเชือก หรือนั่งพักริมน้ำ ใกล้กันคือถ้ำภูคำ ปีนขึ้นไปจะพบพระนอนประดิษฐานอยู่ในถ้ำ',
      en: 'A blue-green swimming hole shaded by a big tree, about 7 km from town. Jump from the branches, swing on a rope or relax by the water. Above it, Tham Phu Kham cave shelters a reclining Buddha.',
    },
    highlights: {
      th: ['กระโดดน้ำจากกิ่งไม้ใหญ่', 'ถ้ำภูคำกับพระนอนในถ้ำ', 'ปั่นจักรยานผ่านทุ่งนาไปถึง'],
      en: ['Jumping from the big tree', 'Tham Phu Kham cave and its reclining Buddha', 'A bike ride through rice fields to get there'],
    },
    best: { th: 'ช่วงเช้าหรือวันธรรมดา คนไม่มาก', en: 'Mornings or weekdays' },
    time: { th: 'ครึ่งวัน', en: 'Half a day' },
    access: { th: 'ห่างตัวเมืองราว 7 กม. ข้ามแม่น้ำซองไปทางตะวันตก', en: 'About 7 km west of town across the Nam Song' },
    note: { th: 'ทางขึ้นถ้ำชันและมืด ควรพกไฟฉาย', en: 'The cave path is steep and dark, so bring a torch' },
  },
  'vientiane-province/balloon': {
    about: {
      th: 'ขึ้นบอลลูนลอยเหนือภูเขาหินปูน ทุ่งนา และแม่น้ำซองในยามเช้าหรือเย็น บินราว 30–40 นาที ได้เห็นวังเวียงอีกมุมหนึ่งที่มองได้จากบนฟ้าเท่านั้น',
      en: 'Float over karst peaks, rice fields and the Nam Song at sunrise or sunset. Flights last about 30–40 minutes and show Vang Vieng from a view you only get from the sky.',
    },
    highlights: {
      th: ['พระอาทิตย์ขึ้นหรือตกจากบนฟ้า', 'มุมสูงของภูเขาหินปูน', 'วิวทุ่งนาและแม่น้ำซองจากด้านบน'],
      en: ['Sunrise or sunset from the air', "A bird's-eye view of the karsts", 'Rice fields and the Nam Song from above'],
    },
    best: { th: 'พ.ย.–มี.ค. อากาศดี ลมนิ่ง', en: 'November–March, for calm, clear weather' },
    time: { th: 'ราว 1–1.5 ชั่วโมง รวมรับส่ง', en: 'About 1–1.5 hours including transfers' },
    access: { th: 'จองล่วงหน้า ผู้ให้บริการมีรถรับจากที่พักในเมือง', en: 'Book ahead; operators pick up from town' },
    note: { th: 'เที่ยวบินขึ้นกับสภาพอากาศ อาจเลื่อนหรือยกเลิกได้', en: 'Flights depend on the weather and may be rescheduled' },
  },
  'vientiane-province/nam-song': {
    about: {
      th: 'พายเรือคายัคหรือนั่งห่วงยางล่องตามแม่น้ำซองที่ไหลเอื่อย ผ่านหน้าผาหินปูน สวนผัก และหมู่บ้านริมน้ำ เป็นกิจกรรมที่ทำให้หลายคนหลงรักวังเวียง ทัวร์ส่วนใหญ่มักรวมการเที่ยวถ้ำไว้ในวันเดียวกัน',
      en: 'Kayak or float in a tube down the gentle Nam Song, past limestone cliffs, gardens and riverside villages — the activity that made many people fall for Vang Vieng. Most trips combine it with a cave visit.',
    },
    highlights: {
      th: ['พายคายัคผ่านหน้าผาหินปูน', 'ล่องห่วงยางแบบสบาย' + NB + 'ๆ', 'แวะถ้ำน้ำระหว่างทาง'],
      en: ['Kayaking beneath limestone cliffs', 'A lazy float by tube', 'A water-cave stop on the way'],
    },
    best: { th: 'ฤดูแล้ง พ.ย.–เม.ย. น้ำไม่แรง', en: 'Dry season, November–April, when the water is calm' },
    time: { th: 'ครึ่งวันถึง 1 วัน', en: 'Half a day to a full day' },
    access: { th: 'จองทัวร์ในตัวเมือง มีรถรับส่งถึงจุดลงน้ำ', en: 'Book in town; transfers to the start point are included' },
    note: { th: 'สวมเสื้อชูชีพทุกครั้ง และหลีกเลี่ยงช่วงน้ำหลากในฤดูฝน', en: 'Always wear a life jacket and avoid high water in the rainy season' },
  },
  'vientiane-capital/that-luang': {
    about: {
      th: 'พระธาตุสีทองสูงราว 45 เมตร สัญลักษณ์ของชาติลาวที่ปรากฏบนตราแผ่นดิน สร้างในสมัยพระเจ้าไชยเชษฐาธิราชเมื่อปี 1566 ทุกปีช่วงเดือนพฤศจิกายนมีงานบุญธาตุหลวง หนึ่งในงานบุญที่ยิ่งใหญ่ที่สุดของลาว',
      en: "The 45-metre golden stupa is the national symbol of Laos and appears on the country's emblem. Built under King Setthathirath in 1566, it hosts the Boun That Luang festival each November, one of the biggest in Laos.",
    },
    highlights: {
      th: ['พระธาตุสีทองอร่ามกลางลาน', 'งานบุญธาตุหลวงเดือนพฤศจิกายน', 'วัดและพระบรมรูปพระเจ้าไชยเชษฐาธิราช'],
      en: ['The gleaming golden stupa', 'The That Luang festival in November', 'Temples and the King Setthathirath statue'],
    },
    best: { th: 'เช้าหรือเย็น แดดไม่แรง แสงสวย', en: 'Morning or late-afternoon light' },
    time: { th: 'ราว 1 ชั่วโมง', en: 'About 1 hour' },
    access: { th: 'ห่างใจกลางเมืองราว 4 กม.', en: 'About 4 km from the city centre' },
    note: { th: 'แต่งกายสุภาพ คลุมไหล่และเข่า', en: 'Dress modestly, covering shoulders and knees' },
  },
  'vientiane-capital/patuxai': {
    about: {
      th: 'อนุสาวรีย์ที่ระลึกถึงผู้ต่อสู้เพื่อเอกราชของลาว สร้างระหว่างปี 1957–1968 รูปทรงชวนให้นึกถึงประตูชัยในปารีส แต่ประดับลวดลายและเทพในคติลาว ขึ้นไปชั้นบนสุดชมวิวถนนล้านช้างและเมืองเวียงจันทน์ได้รอบทิศ',
      en: 'A monument to those who fought for Lao independence, built between 1957 and 1968. It echoes the Arc de Triomphe but is decorated with Lao motifs and mythical figures. Climb to the top for views along Lane Xang Avenue and across Vientiane.',
    },
    highlights: {
      th: ['วิวเมืองจากชั้นบนสุด', 'ลวดลายและประติมากรรมแบบลาว', 'สวนและน้ำพุดนตรีรอบอนุสาวรีย์'],
      en: ['City views from the top', 'Lao motifs and sculptures', 'The park and musical fountain'],
    },
    best: { th: 'ช่วงบ่ายถึงเย็น', en: 'Afternoon to early evening' },
    time: { th: '45 นาที–1 ชั่วโมง', en: '45 minutes to 1 hour' },
    access: { th: 'ปลายถนนล้านช้าง ใจกลางเมือง', en: 'At the end of Lane Xang Avenue, in the centre' },
    note: { th: 'เล่ากันว่าสร้างด้วยปูนซีเมนต์ที่ได้มาเพื่อทำรันเวย์สนามบิน จึงมีชื่อเล่นว่า "รันเวย์แนวตั้ง"', en: 'It is said to have been built with cement meant for an airport runway, hence its nickname, "the vertical runway"' },
  },
  'vientiane-capital/wat-si-saket': {
    about: {
      th: 'วัดที่พระเจ้าอนุวงศ์สร้างเสร็จในปี 1818 และเป็นวัดสำคัญแห่งเดียวในเวียงจันทน์ที่รอดจากการถูกทำลายในปี 1828 ระเบียงคดรอบวิหารมีช่องเล็กบรรจุพระพุทธรูปราว 6,840 องค์ ทั้งไม้ หิน สำริด เงิน และดินเผา',
      en: 'Completed in 1818 under King Anouvong, it was the only major temple in Vientiane to survive the destruction of 1828. Its cloister walls hold some 6,840 Buddha images in wood, stone, bronze, silver and ceramic.',
    },
    highlights: {
      th: ['พระพุทธรูปนับพันองค์ในช่องผนัง', 'วัดเก่าแก่ที่สุดที่ยังคงสภาพเดิมในเมือง', 'ภาพจิตรกรรมเก่าในวิหาร'],
      en: ['Thousands of Buddha images in wall niches', "Vientiane's oldest surviving temple", 'Old murals inside the ordination hall'],
    },
    best: { th: 'ช่วงเช้า', en: 'Morning' },
    time: { th: 'ราว 45 นาที', en: 'About 45 minutes' },
    access: { th: 'ถนนล้านช้าง ใกล้ทำเนียบประธานประเทศ เดินจากริมโขงได้', en: 'On Lane Xang Avenue near the Presidential Palace, walkable from the riverside' },
    note: { th: 'แต่งกายสุภาพ และถอดรองเท้าก่อนเข้าวิหาร', en: 'Dress modestly and remove your shoes in the hall' },
  },
  'vientiane-capital/buddha-park': {
    about: {
      th: 'สวนประติมากรรมริมแม่น้ำโขงที่หลวงปู่บุญเหลือ สุรีรัตน์ เริ่มสร้างในปี 1958 มีรูปปั้นทั้งพุทธและฮินดูกว่า 200 องค์ ไฮไลต์คือพระนอนยาว 40 เมตร และอาคารรูปฟักทองยักษ์ 3 ชั้นที่แทนนรก โลก และสวรรค์ ซึ่งปีนขึ้นไปชมวิวด้านบนได้',
      en: 'A riverside sculpture garden begun in 1958 by Luang Pu Bunleua Sulilat, with more than 200 Buddhist and Hindu statues. Highlights include a 40-metre reclining Buddha and a giant three-level "pumpkin" representing hell, earth and heaven, with a lookout on top.',
    },
    highlights: {
      th: ['พระนอนยาว 40 เมตร', 'อาคารฟักทองยักษ์ ปีนชมวิวได้', 'รูปปั้นแปลกตากว่า 200 องค์'],
      en: ['A 40-metre reclining Buddha', 'The giant "pumpkin" with a lookout', 'More than 200 unusual statues'],
    },
    best: { th: 'เช้าหรือบ่ายแก่' + NB + 'ๆ แดดไม่แรง', en: 'Morning or late afternoon' },
    time: { th: '1–1.5 ชั่วโมง', en: '1–1.5 hours' },
    access: { th: 'ห่างตัวเมืองราว 25 กม. ใกล้สะพานมิตรภาพ', en: 'About 25 km from the centre, near the Friendship Bridge' },
    note: { th: 'แวะได้สะดวกในวันที่ข้ามแดนจากหนองคาย', en: 'An easy stop on the day you cross from Nong Khai' },
  },
  'vientiane-capital/mekong-night-market': {
    about: {
      th: 'ทุกเย็นริมแม่น้ำโขงข้างสวนเจ้าอนุวงศ์จะคึกคักด้วยเต็นท์ขายเสื้อผ้า ของที่ระลึก และของกินเล่น บนลานริมน้ำมีผู้คนออกมาเต้นแอโรบิก ปั่นจักรยาน และเดินรับลม มองข้ามแม่น้ำไปเห็นพระอาทิตย์ตกเหนือฝั่งไทย',
      en: 'Each evening the riverfront by Chao Anouvong Park fills with stalls selling clothes, souvenirs and snacks, while locals jog, cycle and dance aerobics on the promenade. Across the Mekong, the sun sets over Thailand.',
    },
    highlights: {
      th: ['พระอาทิตย์ตกริมแม่น้ำโขง', 'ตลาดนัดกลางคืนริมน้ำ', 'ร้านอาหารและเบียร์ลาวริมโขง'],
      en: ['Sunset over the Mekong', 'A riverside night market', 'Food and Beerlao by the river'],
    },
    best: { th: 'ราว 17:30–22:00 น.', en: 'Around 5:30–10 pm' },
    time: { th: '1–2 ชั่วโมง', en: '1–2 hours' },
    access: { th: 'ถนนฟ้างุ่ม ริมโขง ใจกลางเมือง', en: 'Fa Ngum Road on the riverfront, in the centre' },
  },
  'khammouane/kong-lor': {
    about: {
      th: 'ถ้ำแม่น้ำที่ทะลุผ่านภูเขาหินปูนยาวราว 7.5 กม. ในเขตอนุรักษ์ภูหินปูน นั่งเรือหางยาวลอดความมืดไปตามน้ำหินบูน ผ่านโถงถ้ำกว้างใหญ่และหินงอกหินย้อยที่ส่องไฟให้ชม ก่อนออกสู่แสงสว่างอีกฟากของภูเขา',
      en: 'A river cave running about 7.5 km through a limestone mountain in the Phou Hin Poun protected area. A longtail boat carries you through the darkness along the Nam Hin Bun, past vast chambers and lit-up formations, out into daylight on the far side.',
    },
    highlights: {
      th: ['นั่งเรือลอดถ้ำมืดสนิท', 'หินงอกหินย้อยที่ส่องไฟให้ชม', 'หมู่บ้านและทุ่งนารอบปากถ้ำ'],
      en: ['A boat ride through total darkness', 'Illuminated rock formations', 'Villages and rice fields around the entrance'],
    },
    best: { th: 'ฤดูแล้ง พ.ย.–เม.ย.', en: 'Dry season, November–April' },
    time: { th: 'อย่างน้อยครึ่งวัน', en: 'At least half a day' },
    access: { th: 'อยู่ที่บ้านกองลอ เดินทางด้วยรถจากท่าแขกหรือเวียงจันทน์', en: 'At Ban Kong Lor, reached by road from Thakhek or Vientiane' },
    note: { th: 'สวมรองเท้าแตะรัดส้น เพราะบางช่วงอาจต้องลงเดินในน้ำตื้น', en: 'Wear strap sandals, as you may wade through shallow water' },
  },
  'champasak/vat-phou': {
    about: {
      th: 'ปราสาทหินขอมโบราณบนไหล่เขาภูเก้า ได้รับการขึ้นทะเบียนเป็นมรดกโลกเมื่อปี 2001 เดินผ่านทางเดินหินและบันไดชันที่มีต้นลั่นทมเก่าแก่ขึ้นไปยังปราสาทประธาน มองลงมาเห็นที่ราบลุ่มแม่น้ำโขงกว้างไกล',
      en: 'An ancient Khmer temple on the slopes of Phou Kao, inscribed as a UNESCO World Heritage Site in 2001. A stone causeway and steep, frangipani-shaded stairs lead up to the main sanctuary, with views over the Mekong plain.',
    },
    highlights: {
      th: ['บันไดหินกับต้นลั่นทมเก่าแก่', 'ภาพสลักหินแบบขอม', 'วิวที่ราบลุ่มแม่น้ำโขงจากด้านบน'],
      en: ['Stone stairs shaded by old frangipani', 'Khmer stone carvings', 'Views over the Mekong plain'],
    },
    best: { th: 'ช่วงเช้าแดดยังไม่แรง งานบุญวัดพูราวเดือนกุมภาพันธ์', en: 'Early morning; the Vat Phou festival is around February' },
    time: { th: '2–3 ชั่วโมง', en: '2–3 hours' },
    access: { th: 'ขับรถจากเมืองปากเซราว 1 ชั่วโมง', en: 'About an hour by road from Pakse' },
    note: { th: 'สวมรองเท้าที่เดินสะดวก บันไดชันและไม่เรียบ', en: 'Wear good shoes, as the stairs are steep and uneven' },
  },
  'champasak/si-phan-don': {
    about: {
      th: 'ก่อนถึงชายแดนกัมพูชา แม่น้ำโขงแผ่กว้างหลายกิโลเมตรจนเกิดเป็นเกาะแก่งนับพัน เกาะที่นักท่องเที่ยวนิยมคือดอนโขง ดอนเดช และดอนคอน ปั่นจักรยานเลาะทุ่งนา นอนเปลริมน้ำ และชมพระอาทิตย์ตกเหนือแม่น้ำโขงแบบไม่ต้องรีบ',
      en: 'Before the Cambodian border the Mekong spreads several kilometres wide into thousands of islands. Don Khong, Don Det and Don Khon are the favourites: cycle past rice fields, swing in a riverside hammock and watch the sun set over the Mekong, unhurried.',
    },
    highlights: {
      th: ['พระอาทิตย์ตกเหนือแม่น้ำโขง', 'ปั่นจักรยานรอบเกาะ', 'ใกล้น้ำตกหลี่ผีและคอนพะเพ็ง'],
      en: ['Sunsets over the Mekong', 'Cycling around the islands', 'Close to Li Phi and Khone Phapheng falls'],
    },
    best: { th: 'พ.ย.–ก.พ. อากาศเย็นสบาย', en: 'November–February, cool and dry' },
    time: { th: '2–3 วัน', en: '2–3 days' },
    access: { th: 'จากปากเซนั่งรถลงใต้ราว 2.5–3 ชั่วโมง แล้วต่อเรือที่บ้านนากะสัง', en: 'About 2.5–3 hours south of Pakse by road, then a boat from Ban Nakasang' },
  },
  'champasak/khone-phapheng': {
    about: {
      th: 'แม่น้ำโขงทั้งสายไหลกระแทกแนวหินเป็นแก่งน้ำตกกว้างใหญ่ จุดที่สูงที่สุดราว 21 เมตร ได้ชื่อว่าเป็นน้ำตกที่มีปริมาณน้ำมากที่สุดในเอเชียตะวันออกเฉียงใต้ เสียงน้ำและละอองที่ฟุ้งขึ้นมาทำให้รู้สึกถึงพลังของแม่น้ำโขงอย่างแท้จริง',
      en: 'The whole Mekong crashes over a wide band of rock in a series of thundering cascades, up to about 21 metres high. Often called the largest waterfall in Southeast Asia by volume, it lets you feel the true power of the river.',
    },
    highlights: {
      th: ['พลังของแม่น้ำโขงแบบเต็มตา', 'ศาลาและจุดชมวิวริมแก่ง', 'เที่ยวต่อจากสี่พันดอนได้ในวันเดียว'],
      en: ['The full force of the Mekong', 'Pavilions and viewpoints along the falls', 'An easy add-on from Si Phan Don'],
    },
    best: { th: 'ปลายฤดูฝน ราว ส.ค.–ต.ค. น้ำมากที่สุด', en: 'Late rainy season, around August–October, for peak flow' },
    time: { th: '1–2 ชั่วโมง', en: '1–2 hours' },
    access: { th: 'ห่างปากเซราว 150 กม. ใกล้ชายแดนกัมพูชา', en: 'About 150 km south of Pakse, near the Cambodian border' },
  },
  'champasak/li-phi': {
    about: {
      th: 'แก่งน้ำตกบนเกาะดอนคอน สายน้ำโขงไหลเชี่ยวผ่านร่องหินเป็นแนวยาว ชื่อ "หลี่ผี" มาจากความเชื่อของชาวบ้านว่าเป็นที่ดักวิญญาณ ยามพระอาทิตย์ขึ้นและตก ท้องฟ้าเหนือแก่งหินสวยเป็นพิเศษ',
      en: 'Wild rapids on Don Khon, where the Mekong surges through long channels of rock. The name means "spirit trap", from a local belief that the falls catch wandering spirits. Sunrise and sunset light them beautifully.',
    },
    highlights: {
      th: ['แก่งหินและสายน้ำโขงที่เชี่ยวกราก', 'แสงสวยยามเช้าและเย็น', 'ปั่นจักรยานจากดอนเดชได้สบาย'],
      en: ['Rocky channels and rushing water', 'Beautiful light at sunrise and sunset', 'An easy bike ride from Don Det'],
    },
    best: { th: 'เช้าตรู่หรือช่วงเย็น', en: 'Early morning or late afternoon' },
    time: { th: '1–2 ชั่วโมง', en: '1–2 hours' },
    access: { th: 'บนดอนคอน ปั่นจักรยานจากดอนเดชข้ามสะพานเก่าราว 20 นาที', en: 'On Don Khon, about 20 minutes by bike from Don Det over the old bridge' },
  },
  'champasak/tad-fane': {
    about: {
      th: 'น้ำตกคู่ที่ทิ้งตัวจากหน้าผาสูงราว 120 เมตร ลงสู่หุบเหวกลางป่าทึบบนที่ราบสูงโบลาเวน ชมได้จากจุดชมวิวริมหน้าผา และสำหรับสายผจญภัยยังมีซิปไลน์ข้ามหุบเขาด้วย',
      en: 'Twin waterfalls plunge about 120 metres from a cliff into a forested gorge on the Bolaven Plateau. Watch from the clifftop viewpoint or, for adventure, ride the zipline across the canyon.',
    },
    highlights: {
      th: ['น้ำตกคู่สูงราว 120 เมตร', 'จุดชมวิวริมหน้าผา', 'ซิปไลน์ข้ามหุบเขา'],
      en: ['Twin falls about 120 m high', 'The clifftop viewpoint', 'A zipline across the gorge'],
    },
    best: { th: 'ปลายฤดูฝนถึงต้นฤดูหนาว ราว ก.ย.–ธ.ค.', en: 'End of the rainy season into the cool season, about September–December' },
    time: { th: '1–2 ชั่วโมง', en: '1–2 hours' },
    access: { th: 'กม. 38 ถนนหมายเลข 16 ขับรถจากปากเซราว 40 นาที', en: 'Km 38 on Route 16, about 40 minutes from Pakse' },
  },
  'champasak/paksong-coffee': {
    about: {
      th: 'ปากซองบนที่ราบสูงโบลาเวนเป็นแหล่งปลูกกาแฟสำคัญของลาว อากาศเย็นสบายเกือบตลอดปี แวะชมไร่กาแฟ เรียนรู้ขั้นตอนตั้งแต่เก็บผลจนถึงคั่ว แล้วจิบกาแฟสดกลางไร่ เที่ยวต่อกับน้ำตกบนที่ราบสูงได้ในวันเดียว',
      en: "Paksong, on the Bolaven Plateau, is the heart of Lao coffee country and cool for much of the year. Visit a plantation, learn how beans go from cherry to cup and sip fresh coffee among the trees, easily paired with the plateau's waterfalls.",
    },
    highlights: {
      th: ['ชมไร่และขั้นตอนการทำกาแฟ', 'จิบกาแฟสดจากแหล่งปลูก', 'อากาศเย็นสบายบนที่ราบสูง'],
      en: ['Plantations and the coffee process', 'Fresh coffee at the source', 'Cool plateau air'],
    },
    best: { th: 'ฤดูเก็บผลกาแฟ ราว พ.ย.–ก.พ.', en: 'Harvest season, roughly November–February' },
    time: { th: '2–3 ชั่วโมง', en: '2–3 hours' },
    access: { th: 'ห่างปากเซราว 50 กม. บนถนนหมายเลข 16', en: 'About 50 km from Pakse on Route 16' },
  },
};

// ที่เที่ยวห้ามพลาดบนหน้าแรก (8 แห่ง)
export const mustSee = [
  'luang-prabang/wat-xieng-thong', 'luang-prabang/kuang-si', 'luang-prabang/nong-khiaw', 'luang-prabang/muang-ngoi',
  'vientiane-province/nam-xay', 'vientiane-capital/that-luang', 'khammouane/kong-lor', 'champasak/si-phan-don',
];

const samplePriceBasis = {
  th: 'ราคาตัวอย่างหน่วยบาทไทยต่อท่าน สำหรับวางแผนเบื้องต้น จำนวนผู้เดินทางและบริการที่รวมในราคาต้องยืนยันในใบเสนอราคา',
  en: 'Sample price in Thai baht per person for planning. Group size and included services must be confirmed in a quote.',
};
const suggestedItineraryNote = {
  th: 'แผนนี้เป็นแนวทางการจัดวันและลำดับสถานที่ ไม่ใช่ตารางออกเดินทางที่ยืนยัน เวลาเดินทาง สภาพอากาศ เวลาเปิด และกิจกรรมต้องตรวจสอบก่อนวางแผนการเดินทาง',
  en: 'This is a suggested sequence of places, not a confirmed departure schedule. Travel times, weather, opening hours and activities must be checked when planning the trip.',
};
const quoteToConfirm = {
  th: [
    'วันเดินทาง จำนวนผู้ใหญ่/เด็ก และจำนวนคนที่ใช้คำนวณราคา',
    'จุดรับ–ส่ง ประเภทรถ เส้นทาง และตั๋วเดินทางระหว่างเมือง',
    'ชื่อและระดับที่พัก ประเภทห้อง จำนวนห้อง และการพักร่วม',
    'อาหาร เครื่องดื่ม ค่าเข้าชม เรือ และกิจกรรมที่รวม/ไม่รวม',
    'ผู้ดูแลหรือไกด์ ภาษา และบริการอื่นที่ต้องการ',
    'ราคาสุทธิ สกุลเงิน ค่าใช้จ่ายเพิ่มเติม การชำระเงิน และเงื่อนไขเปลี่ยนแปลง/ยกเลิก',
  ],
  en: [
    'Travel dates, adult/child numbers and group size used to calculate the price',
    'Pick-up and drop-off, vehicle, route and intercity travel tickets',
    'Accommodation names and standard, room types, room count and sharing arrangements',
    'Meals, drinks, entrance fees, boats and activities included or excluded',
    'Host or guide, language and any other requested services',
    'Final amount, currency, extra costs, payment and change/cancellation terms',
  ],
};

export const packages = [
  {
    id: 'vientiane-capital-discovery', destinationId: 'vientiane-capital', destination: { th: 'นครหลวงเวียงจันทน์', en: 'Vientiane Capital' }, provinceId: 'vientiane-capital', image: 'vientiane', photo: 'patuxai',
    title: { th: 'เวียงจันทน์ วัดงามและยามเย็นริมโขง', en: 'Vientiane Temples and Mekong Evenings' },
    days: 2, nights: 1, price: 2900,
    highlights: { th: ['พระธาตุหลวงและประตูชัย', 'วัดสีสะเกด', 'สวนพระและบรรยากาศริมโขง'], en: ['Pha That Luang and Patuxai', 'Wat Si Saket', 'Buddha Park and the Mekong riverside'] },
    priceStatus: 'example', currency: 'THB', priceBasis: samplePriceBasis,
    itineraryStatus: 'suggestion', itineraryNote: suggestedItineraryNote,
    suitability: { th: ['ผู้มาเที่ยวเวียงจันทน์ครั้งแรก', 'คนชอบวัด ศิลปะ และประวัติศาสตร์', 'ผู้ที่อยากเที่ยวเมืองหลวงในเวลาสั้น'], en: ['First-time visitors to Vientiane', 'Temple, art and history lovers', 'Travellers planning a short capital stay'] },
    activityLevel: { th: 'เดินชมวัดและสวนเป็นหลัก เลือกขึ้นประตูชัยได้ตามความพร้อม และเผื่อเวลาเดินทางจากตัวเมืองไปสวนพระ', en: 'Mostly temple and garden walks, with an optional Patuxai climb. Allow travel time between the city centre and Buddha Park.' },
    routeStops: ['vientiane-capital/wat-si-saket', 'vientiane-capital/patuxai', 'vientiane-capital/that-luang', 'vientiane-capital/mekong-night-market', 'vientiane-capital/buddha-park'],
    itinerary: [
      { day: 1, title: { th: 'วัดสำคัญและเมืองหลวงริมโขง', en: 'Temples and the riverside capital' }, summary: { th: 'ชมวัดสีสะเกด ประตูชัย และพระธาตุหลวง แล้วเดินเล่นริมโขงและตลาดกลางคืนในช่วงเย็น ปรับจุดแวะตามเวลาเดินทางถึงและเวลาเปิดของสถานที่', en: 'Visit Wat Si Saket, Patuxai and Pha That Luang, with a Mekong riverside and night market stroll in the evening. Adjust the stops to your arrival time and site opening hours.' }, activities: { th: ['ชมวัดสีสะเกดและพระพุทธรูปในระเบียงคด','ชมสถาปัตยกรรมอันงดงามของประตูชัยและพระธาตุหลวง','เดินเล่นรับลมริมแม่น้ำโขงและเพลิดเพลินกับตลาดกลางคืนยามเย็น'], en: ['Explore Wat Si Saket and its cloister Buddha images','View Patuxai and Pha That Luang as time allows','Consider a Mekong promenade and night market stroll'] }, stops: ['vientiane-capital/wat-si-saket', 'vientiane-capital/patuxai', 'vientiane-capital/that-luang', 'vientiane-capital/mekong-night-market'] },
      { day: 2, title: { th: 'สวนพระก่อนเดินทางต่อ', en: 'Buddha Park before moving on' }, summary: { th: 'เดินชมประติมากรรมพุทธและฮินดูที่สวนพระ เซียงควน ก่อนเดินทางต่อ เผื่อเวลาเดินชมและเดินทางไปจุดส่งตามแผนที่ตกลงกัน ทั้งเส้นทางกลับเข้าเมืองหรือไปชายแดน', en: 'Explore the Buddhist and Hindu sculptures at Buddha Park before moving on. Allow time for your visit and the agreed transfer back to town or onward to the border.' }, activities: { th: ['เดินชมประติมากรรมพุทธและฮินดูอันวิจิตรในสวนพระ','เผื่อเวลาเดินทางอย่างสบายๆ ไปยังจุดหมายถัดไปตามกำหนดการ'], en: ['Explore the Buddhist and Hindu sculptures at Buddha Park','Allow travel time to the agreed trip end point'] }, stops: ['vientiane-capital/buddha-park'] },
    ],
    quoteDetails: {
      confirmed: { th: ['เป็นตัวอย่างแนวทาง 2 วัน 1 คืนในนครหลวงเวียงจันทน์', 'ราคาแสดง 2,900 บาทต่อท่านเป็นข้อมูลตัวอย่างเท่านั้น'], en: ['A suggested 2-day, 1-night Vientiane Capital plan', 'The displayed THB 2,900 per person is an example only'] },
      toConfirm: quoteToConfirm,
    },
    sourceUrls: ['https://www.tourismlaos.org/central-provinces/vientiane-capital/'],
  },
  {
    id: 'vang-vieng-nature', destinationId: 'vang-vieng', destination: { th: 'วังเวียง', en: 'Vang Vieng' }, provinceId: 'vientiane-province', image: 'vang-vieng', photo: 'blue-lagoon',
    title: { th: 'วังเวียง ท่ามกลางขุนเขา', en: 'Among the Mountains of Vang Vieng' },
    days: 3, nights: 2, price: 4900,
    highlights: { th: ['วิวแม่น้ำซอง', 'บลูลากูน', 'ทุ่งนาและภูเขาหินปูน'], en: ['Nam Song river views', 'Blue Lagoon', 'Rice fields and limestone peaks'] },
    priceStatus: 'example', currency: 'THB', priceBasis: samplePriceBasis,
    itineraryStatus: 'suggestion', itineraryNote: suggestedItineraryNote,
    suitability: { th: ['คนชอบภูเขาและวิวริมแม่น้ำ', 'ผู้ที่อยากเลือกกิจกรรมให้เหมาะกับตนเอง', 'ผู้ที่มีเวลาเที่ยววังเวียงประมาณ 3 วัน'], en: ['Mountain and riverside scenery lovers', 'Travellers who want to choose activities to suit them', 'Visitors with around three days for Vang Vieng'] },
    activityLevel: { th: 'เลือกเดินเล่นสบายหรือเพิ่มกิจกรรมได้ น้ำไซมีทางขึ้นชัน ส่วนกิจกรรมทางน้ำต้องพิจารณาสภาพน้ำและความพร้อมของผู้เดินทาง', en: 'Choose a gentle pace or add activities. Nam Xay has a steep climb; river activities depend on conditions and each traveller’s ability.' },
    routeStops: ['vientiane-province/vang-vieng', 'vientiane-province/nam-song', 'vientiane-province/blue-lagoon', 'vientiane-province/nam-xay', 'vientiane-province/tham-chang'],
    itinerary: [
      { day: 1, title: { th: 'เริ่มต้นกับวิววังเวียง', en: 'Settle into Vang Vieng' }, summary: { th: 'ทำความรู้จักตัวเมืองและบรรยากาศริมแม่น้ำซอง วันแรกเน้นชมวิวและพักผ่อน โดยปรับตามเวลาเดินทางถึง', en: 'Get to know the town and Nam Song riverside. Keep the first day for scenery and rest, adapting to your arrival time.' }, activities: { th: ["เดินทำความรู้จักตัวเมืองวังเวียงตามเวลาเดินทางถึง","ชมวิวแม่น้ำซองและภูเขาหินปูนจากริมฝั่ง"], en: ["After arriving, explore Vang Vieng as time allows","Enjoy Nam Song and limestone mountain views from the riverside"] }, stops: ['vientiane-province/vang-vieng', 'vientiane-province/nam-song'] },
      { day: 2, title: { th: 'ลากูนและภูเขาตามจังหวะที่ชอบ', en: 'Lagoons and mountains at your pace' }, summary: { th: 'เที่ยวบลูลากูน แล้วเลือกขึ้นจุดชมวิวน้ำไซเมื่อสภาพอากาศและร่างกายเหมาะสม หรือใช้เวลาพักผ่อนเพิ่มหากไม่ขึ้นเขา', en: 'Visit Blue Lagoon, then choose Nam Xay Viewpoint if weather and fitness allow, or enjoy more time to relax.' }, activities: { th: ["เลือกแวะบลูลากูนเพื่อชมธรรมชาติและพักผ่อน","พิจารณาขึ้นน้ำไซเมื่ออากาศและร่างกายพร้อม หรือเพิ่มเวลาพักแทน"], en: ["Visit Blue Lagoon for scenery and time to relax","Choose Nam Xay if conditions and fitness allow, or spend more time relaxing"] }, stops: ['vientiane-province/blue-lagoon', 'vientiane-province/nam-xay'] },
      { day: 3, title: { th: 'อีกมุมของวังเวียงก่อนออกเดินทาง', en: 'One more view before departure' }, summary: { th: 'แวะถ้ำจังเป็นจุดสุดท้ายได้หากมีเวลาเพียงพอ โดยเผื่อเวลาเดินทางไปจุดส่งหรือสถานีตามที่ตกลงกัน', en: 'Tham Chang is an optional final stop if there is time before your agreed transfer to the drop-off point or station.' }, activities: { th: ["พิจารณาแวะถ้ำจังหากเส้นทางเปิดและมีเวลาเพียงพอ","เผื่อเวลาไปจุดส่งหรือสถานีตามการเดินทางที่ตกลงกัน"], en: ["Consider Tham Chang if access and available time allow","Leave time to reach the agreed drop-off point or station"] }, stops: ['vientiane-province/tham-chang'] },
    ],
    quoteDetails: {
      confirmed: { th: ['เป็นตัวอย่างแนวทาง 3 วัน 2 คืนในวังเวียง', 'ราคาแสดง 4,900 บาทต่อท่านเป็นข้อมูลตัวอย่างเท่านั้น'], en: ['A suggested 3-day, 2-night Vang Vieng plan', 'The displayed THB 4,900 per person is an example only'] },
      toConfirm: quoteToConfirm,
    },
  },
  {
    id: 'luang-prabang-discovery', destinationId: 'luang-prabang', destination: { th: 'หลวงพระบาง', en: 'Luang Prabang' }, provinceId: 'luang-prabang', image: 'luang-prabang', photo: 'wat-xieng-thong',
    title: { th: 'หลวงพระบาง เมืองแห่งความสงบ', en: 'The Quiet Charm of Luang Prabang' },
    days: 3, nights: 2, price: 5900,
    highlights: { th: ['เดินชมเมืองเก่า', 'น้ำตกตาดกวางสี', 'วัดเชียงทอง'], en: ['Old town exploration', 'Kuang Si Falls', 'Wat Xieng Thong'] },
    priceStatus: 'example', currency: 'THB', priceBasis: samplePriceBasis,
    itineraryStatus: 'suggestion', itineraryNote: suggestedItineraryNote,
    suitability: { th: ['ผู้มาเที่ยวหลวงพระบางครั้งแรก', 'คนชอบวัฒนธรรมและธรรมชาติ', 'ผู้ที่อยากสลับวันเดินเมืองกับวันเที่ยวน้ำตก'], en: ['First-time visitors to Luang Prabang', 'Culture and nature lovers', 'Travellers who want both town walks and a waterfall day'] },
    activityLevel: { th: 'เดินชมเมืองและวัด มีบันไดที่พูสี ส่วนการขึ้นยอดเขาและเล่นน้ำเลือกปรับได้ตามความพร้อม', en: 'Town and temple walks, with stairs at Mount Phousi. The hill climb and swimming can be adjusted to your ability.' },
    routeStops: ['luang-prabang/wat-xieng-thong', 'luang-prabang/royal-palace', 'luang-prabang/phousi', 'luang-prabang/kuang-si', 'luang-prabang/night-market', 'luang-prabang/alms-giving'],
    itinerary: [
      { day: 1, title: { th: 'รู้จักเมืองเก่าริมแม่น้ำ', en: 'Get to know the old town' }, summary: { th: 'เริ่มด้วยวัดเชียงทองและบริเวณพระราชวัง แล้วเลือกเดินขึ้นพูสีหากมีเวลาและเหมาะกับสภาพร่างกาย ปรับลำดับตามเวลาเดินทางถึง', en: 'Start at Wat Xieng Thong and the Royal Palace area, with an optional Mount Phousi climb if time and fitness allow. Adjust the order to your arrival time.' }, activities: { th: ["ชมวัดเชียงทองและเดินสำรวจบริเวณเมืองเก่า","พิจารณาแวะบริเวณพระราชวังและขึ้นพูสีตามเวลาที่มี"], en: ["Visit Wat Xieng Thong and explore the old town","Consider the Royal Palace area and Mount Phousi as time allows"] }, stops: ['luang-prabang/wat-xieng-thong', 'luang-prabang/royal-palace', 'luang-prabang/phousi'] },
      { day: 2, title: { th: 'วันธรรมชาติที่ตาดกวางสี', en: 'A nature day at Kuang Si' }, summary: { th: 'เที่ยวน้ำตกตาดกวางสี เดินชมแอ่งน้ำหรือพักผ่อนตามจังหวะที่ชอบ กลับเมืองแล้วแวะตลาดกลางคืนได้หากมีเวลา', en: 'Spend the day at Kuang Si Falls, walking beside the pools or taking time to rest. Visit the night market back in town if time allows.' }, activities: { th: ["เดินชมชั้นน้ำตกและแอ่งน้ำที่ตาดกวางสีตามเส้นทางที่เปิด","กลับเข้าเมืองแล้วเลือกเดินตลาดกลางคืนตามเวลาที่มี"], en: ["Explore the open paths around the Kuang Si cascades and pools","Consider a night market stroll after returning to town"] }, stops: ['luang-prabang/kuang-si', 'luang-prabang/night-market'] },
      { day: 3, title: { th: 'เช้าเงียบสงบก่อนเดินทางต่อ', en: 'A quiet morning before moving on' }, summary: { th: 'เลือกชมตักบาตรข้าวเหนียวอย่างให้เกียรติ แล้วเผื่อเวลาสำหรับการเดินทางต่อ จุดส่งและเวลาออกเดินทางต้องตกลงแยกต่างหาก', en: 'Optionally observe morning alms giving respectfully, then leave time for onward travel. The drop-off point and departure arrangements need separate agreement.' }, activities: { th: ["เลือกสังเกตพิธีตักบาตรอย่างสงบและให้เกียรติผู้ร่วมพิธี","เผื่อเวลาสำหรับเดินทางต่อหลังจบกิจกรรมยามเช้า"], en: ["Optionally observe alms giving quietly and respect participants","Allow time for onward travel after the morning activity"] }, stops: ['luang-prabang/alms-giving'] },
    ],
    quoteDetails: {
      confirmed: { th: ['เป็นตัวอย่างแนวทาง 3 วัน 2 คืนในหลวงพระบาง', 'ราคาแสดง 5,900 บาทต่อท่านเป็นข้อมูลตัวอย่างเท่านั้น'], en: ['A suggested 3-day, 2-night Luang Prabang plan', 'The displayed THB 5,900 per person is an example only'] },
      toConfirm: quoteToConfirm,
    },
  },
  {
    id: 'nong-khiaw-discovery', destinationId: 'nong-khiaw', destination: { th: 'หนองเขียว', en: 'Nong Khiaw' }, provinceId: 'luang-prabang', photo: 'nong-khiaw',
    title: { th: 'หนองเขียว ขุนเขาและสายน้ำอู', en: 'Nong Khiaw Mountains and the Nam Ou' },
    days: 3, nights: 2, price: 6500,
    highlights: { th: ['วิวแม่น้ำอูจากสะพาน', 'จุดชมวิวผาแดง', 'ถ้ำผาตอกและเวลาพักริมแม่น้ำ'], en: ['Nam Ou bridge views', 'Pha Daeng viewpoint', 'Pha Tok Cave and riverside downtime'] },
    priceStatus: 'example', currency: 'THB', priceBasis: samplePriceBasis,
    itineraryStatus: 'suggestion', itineraryNote: suggestedItineraryNote,
    suitability: { th: ['คนชอบภูเขาและหมู่บ้านริมน้ำ', 'ผู้ที่อยากมีเวลาเดินเขาและพักผ่อน', 'ผู้ที่ต้องการเที่ยวหนองเขียวเป็นจุดหมายหลัก'], en: ['Mountain and riverside scenery lovers', 'Travellers balancing a hike with downtime', 'Visitors making Nong Khiaw their main destination'] },
    activityLevel: { th: 'เดินเล่นในเมืองได้ตามจังหวะ ส่วนทางขึ้นผาแดงค่อนข้างชันและต้องใช้แรง เลือกงดขึ้นเขาได้ตามสภาพอากาศและความพร้อม', en: 'Town walks can follow a gentle pace. Pha Daeng has a steep climb requiring reasonable fitness; skip it when conditions or ability make it unsuitable.' },
    routeStops: ['luang-prabang/nong-khiaw'],
    itinerary: [
      { day: 1, title: { th: 'รู้จักหนองเขียวและแม่น้ำอู', en: 'Settle into Nong Khiaw' }, summary: { th: 'เมื่อถึงหนองเขียว เดินชมตัวเมืองและวิวจากสะพานข้ามแม่น้ำอู ถ้ำผาตอกเป็นจุดแวะเพิ่มเติมหากมีเวลาและทางเข้าพร้อม ก่อนกลับมาพักริมแม่น้ำ', en: 'After arriving in Nong Khiaw, explore town and the views from the Nam Ou bridge. Pha Tok Cave is an optional stop if time and access allow, before returning to the riverside.' }, activities: { th: ['เดินชมตัวเมืองและวิวภูเขาจากสะพานข้ามแม่น้ำอู','พิจารณาแวะถ้ำผาตอกเมื่อมีเวลาและทางเข้าพร้อม','พักชมบรรยากาศริมแม่น้ำตามจังหวะของกลุ่ม'], en: ['Explore town and mountain views from the Nam Ou bridge','Consider Pha Tok Cave when time and access allow','Enjoy riverside downtime at your own pace'] }, stops: ['luang-prabang/nong-khiaw'] },
      { day: 2, title: { th: 'เลือกขึ้นผาแดงและพักท่ามกลางขุนเขา', en: 'An optional Pha Daeng hike' }, summary: { th: 'เลือกเดินขึ้นจุดชมวิวผาแดงเมื่ออากาศและร่างกายพร้อม เตรียมน้ำและรองเท้าสำหรับทางชัน แล้วพักชมแม่น้ำอูหลังลงมา หรือเลือกพักริมแม่น้ำแทนการขึ้นเขาได้', en: 'Choose a Pha Daeng hike when weather and fitness allow, bringing water and shoes for the steep trail. Rest by the Nam Ou afterwards, or enjoy a riverside day instead of climbing.' }, activities: { th: ['เลือกเดินขึ้นผาแดงตามสภาพอากาศและความพร้อมของร่างกาย','ชมวิวแม่น้ำอูและภูเขาเมื่อทัศนวิสัยเอื้ออำนวย','พักริมแม่น้ำแทนการขึ้นเขาหรือหลังกลับลงมา'], en: ['Choose the Pha Daeng climb according to conditions and fitness','View the Nam Ou and surrounding peaks when visibility allows','Relax by the river instead of the climb or after descending'] }, stops: ['luang-prabang/nong-khiaw'] },
      { day: 3, title: { th: 'เช้าสบายก่อนออกจากหนองเขียว', en: 'A quiet morning before departure' }, summary: { th: 'ใช้ช่วงเช้าเดินเล่นหรือชมวิวริมแม่น้ำตามเวลาที่มี แล้วเผื่อเวลาเดินทางต่อ จุดรับ–ส่งและการเดินทางกลับหลวงพระบางหรือไปจุดหมายอื่นต้องตกลงให้ชัดเจนก่อนวางแผนการเดินทาง', en: 'Spend any free morning time walking or enjoying the river views, then allow time for onward travel. Agree pick-up, drop-off and the route toward Luang Prabang or another destination when planning.' }, activities: { th: ['เลือกเดินเล่นในเมืองหรือชมแม่น้ำอูตามเวลาที่เหลือ','เผื่อเวลาเดินทางไปจุดหมายถัดไปตามเส้นทางที่ตกลงกัน'], en: ['Choose a town walk or Nam Ou views in your remaining time','Allow time for the agreed onward journey'] }, stops: ['luang-prabang/nong-khiaw'] },
    ],
    quoteDetails: {
      confirmed: { th: ['เป็นตัวอย่างแนวทาง 3 วัน 2 คืนในหนองเขียว', 'ราคาแสดง 6,500 บาทต่อท่านเป็นข้อมูลตัวอย่างเท่านั้น'], en: ['A suggested 3-day, 2-night Nong Khiaw plan', 'The displayed THB 6,500 per person is an example only'] },
      toConfirm: quoteToConfirm,
    },
    sourceUrls: ['https://tourismluangprabang.org/recommended-trips/day-trips/misty-mountains-nong-khiaw-to-muang-ngoi/', 'https://www.tourismlaos.org/luang-prabang-hiking-camping-at-the-best-viewpoint-in-laos-pha-daeng-peak/'],
  },
  {
    id: 'muang-ngoi-discovery', destinationId: 'muang-ngoi', destination: { th: 'เมืองงอย', en: 'Muang Ngoi' }, provinceId: 'luang-prabang', photo: 'muang-ngoi',
    title: { th: 'เมืองงอย พักผ่อนสบาย ๆ กลางหุบเขา', en: 'Slow Days in Muang Ngoi' },
    days: 3, nights: 2, price: 6900,
    highlights: { th: ['เส้นทางแม่น้ำอูผ่านหนองเขียว', 'ถ้ำกางและทุ่งนา', 'บรรยากาศหมู่บ้านริมแม่น้ำ'], en: ['Nam Ou journey via Nong Khiaw', 'Kaang Cave and rice fields', 'A riverside village atmosphere'] },
    priceStatus: 'example', currency: 'THB', priceBasis: samplePriceBasis,
    itineraryStatus: 'suggestion', itineraryNote: suggestedItineraryNote,
    suitability: { th: ['ผู้ที่ชอบพักนานในจุดหมายเดียว', 'ผู้ที่ชอบเดินชมธรรมชาติและหมู่บ้าน', 'ผู้ที่ยืดหยุ่นกับการเดินทางทางเรือได้'], en: ['Travellers who enjoy an unhurried stay', 'Travellers who enjoy scenic walks and village visits', 'Travellers who can adapt their boat travel plans'] },
    activityLevel: { th: 'มีการขึ้นลงเรือและเดินบนทางชนบท ระยะเดินเลือกปรับได้ตามความพร้อม สภาพทางและระดับน้ำต้องตรวจสอบก่อนเดินทาง', en: 'Includes boat boarding and rural paths. Adapt walking distances to your ability and check trail and river conditions before travel.' },
    routeStops: ['luang-prabang/nong-khiaw', 'luang-prabang/muang-ngoi'],
    itinerary: [
      { day: 1, title: { th: 'ผ่านหนองเขียวสู่เมืองงอย', en: 'Reach Muang Ngoi via Nong Khiaw' }, summary: { th: 'วางแผนเริ่มต้นที่หนองเขียวและเดินทางทางเรือไปเมืองงอยตามรอบหรือเรือที่ตกลงกัน เมื่อถึงแล้วใช้เวลารู้จักหมู่บ้านและชมแม่น้ำ วันแรกควรเผื่อการต่อรถและเรือ โดยยังไม่กำหนดเวลาออกเดินทางจนกว่าจะตรวจสอบบริการจริง', en: 'Plan the approach through Nong Khiaw and continue by an agreed boat service to Muang Ngoi. Spend the remaining day getting to know the village and river. Allow room for connecting road and boat travel; confirm departure arrangements with the actual providers.' }, activities: { th: ['เดินทางผ่านหนองเขียวและชมทิวทัศน์แม่น้ำอูระหว่างทางเรือ','เดินทำความรู้จักหมู่บ้านเมืองงอยหลังเดินทางถึง','พักชมบรรยากาศริมแม่น้ำตามเวลาที่มี'], en: ['Travel via Nong Khiaw and enjoy Nam Ou scenery on the boat journey','Explore Muang Ngoi village after arrival','Spend available time enjoying the riverside'] }, stops: ['luang-prabang/nong-khiaw', 'luang-prabang/muang-ngoi'] },
      { day: 2, title: { th: 'ถ้ำกาง ทุ่งนา และทางเดินสู่บ้านนา', en: 'Kaang Cave, rice fields and Ban Na' }, summary: { th: 'เดินจากหมู่บ้านไปบริเวณถ้ำกางและทุ่งนา แล้วเลือกเดินต่อไปบ้านนาเมื่อสภาพทางและกำลังเหมาะสม สอบถามคนในพื้นที่เรื่องเส้นทางและการเข้าชมก่อนออกเดิน และเลือกระยะทางให้เหมาะกับกลุ่ม', en: 'Walk towards Kaang Cave and the rice fields, continuing to Ban Na only if trail conditions and energy allow. Ask locally about access before setting out, and choose a distance that suits your group.' }, activities: { th: ['สอบถามสภาพทางก่อนเลือกเดินไปบริเวณถ้ำกาง','ชมทุ่งนาและภูเขาตามเส้นทางที่เปิดให้เดิน','พิจารณาเดินต่อไปบ้านนาเมื่อระยะทางเหมาะกับกลุ่ม'], en: ['Ask about trail conditions before walking toward Kaang Cave','Enjoy rice fields and mountain scenery along accessible paths','Consider continuing toward Ban Na if the distance suits your group'] }, stops: ['luang-prabang/muang-ngoi'] },
      { day: 3, title: { th: 'ยามเช้าริมน้ำและเส้นทางกลับ', en: 'A riverside morning and return journey' }, summary: { th: 'ใช้เวลาที่เหลือชมหมู่บ้านและแม่น้ำก่อนเดินทางกลับทางหนองเขียว ต้องตรวจรอบเรือ จุดขึ้นลง และเวลาต่อรถก่อนจัดวันสิ้นสุดการเดินทาง พร้อมเผื่อเวลาให้เหมาะกับจุดหมายถัดไป', en: 'Enjoy any remaining time in the village before returning through Nong Khiaw. Check boat departures, boarding points and road connections when arranging the final day, allowing enough time for your next destination.' }, activities: { th: ['เดินชมหมู่บ้านหรือพักริมแม่น้ำตามเวลาที่มี','เดินทางกลับผ่านหนองเขียวตามรอบเรือและการต่อรถที่ตรวจสอบแล้ว'], en: ['Walk through the village or relax by the river as time allows','Return via Nong Khiaw using checked boat and road connections'] }, stops: ['luang-prabang/muang-ngoi', 'luang-prabang/nong-khiaw'] },
    ],
    quoteDetails: {
      confirmed: { th: ['เป็นตัวอย่างแนวทาง 3 วัน 2 คืนในเมืองงอย โดยเดินทางผ่านหนองเขียว', 'ราคาแสดง 6,900 บาทต่อท่านเป็นข้อมูลตัวอย่างเท่านั้น'], en: ['A suggested 3-day, 2-night Muang Ngoi plan via Nong Khiaw', 'The displayed THB 6,900 per person is an example only'] },
      toConfirm: quoteToConfirm,
    },
    sourceUrls: ['https://tourismluangprabang.org/recommended-trips/day-trips/misty-mountains-nong-khiaw-to-muang-ngoi/'],
  },
  {
    id: 'champasak-discovery', destinationId: 'champasak', destination: { th: 'จำปาสัก', en: 'Champasak' }, provinceId: 'champasak', image: 'champasak',
    title: { th: 'จำปาสัก เสน่ห์แห่งลาวใต้', en: 'The Southern Spirit of Champasak' },
    days: 4, nights: 3, price: 8900,
    highlights: { th: ['ปราสาทวัดพู', 'หมู่เกาะสี่พันดอน', 'ที่ราบสูงโบลาเวน'], en: ['Vat Phou temple complex', 'Si Phan Don islands', 'Bolaven Plateau'] },
    priceStatus: 'example', currency: 'THB', priceBasis: samplePriceBasis,
    itineraryStatus: 'suggestion', itineraryNote: suggestedItineraryNote,
    suitability: { th: ['คนชอบโบราณสถานและธรรมชาติ', 'ผู้ที่อยากเห็นหลายบรรยากาศของลาวใต้', 'ผู้ที่รับได้กับวันเดินทางระหว่างจุดหมาย'], en: ['Heritage and nature lovers', 'Visitors who want varied Southern Laos scenery', 'Travellers comfortable with transfers between destinations'] },
    activityLevel: { th: 'มีการเดินชมโบราณสถาน ทางขั้นบันได และการเดินทางระหว่างพื้นที่ ควรตกลงเส้นทางและจังหวะที่เหมาะกับผู้ร่วมเดินทาง', en: 'Includes heritage walks, stairs and transfers between areas. Agree a route and pace suited to everyone in the group.' },
    routeStops: ['champasak/vat-phou', 'champasak/tad-fane', 'champasak/paksong-coffee', 'champasak/si-phan-don', 'champasak/khone-phapheng'],
    itinerary: [
      { day: 1, title: { th: 'เริ่มต้นด้วยมรดกวัดพู', en: 'Begin with the heritage of Vat Phou' }, summary: { th: 'เริ่มจากพื้นที่ปากเซ–จำปาสัก แล้วเที่ยววัดพูตามเวลาเดินทางถึง เผื่อเวลาสำหรับทางเดินและขั้นบันไดในโบราณสถาน', en: 'Begin in the Pakse–Champasak area and visit Vat Phou as arrival time allows. Leave time for the paths and stairs through the temple complex.' }, stops: ['champasak/vat-phou'] },
      { day: 2, title: { th: 'น้ำตกและกาแฟบนที่ราบสูง', en: 'Waterfalls and plateau coffee' }, summary: { th: 'วางวันเที่ยวตาดฟานและพื้นที่ปลูกกาแฟปากซอง เลือกจุดแวะให้เหมาะกับเวลาและสภาพอากาศ กิจกรรมพิเศษต้องสอบถามราคาและความพร้อมแยกต่างหาก', en: 'Plan a day around Tad Fane and the Paksong coffee area, adapting stops to time and weather. Any optional activities require separate availability and pricing checks.' }, stops: ['champasak/tad-fane', 'champasak/paksong-coffee'] },
      { day: 3, title: { th: 'เปลี่ยนบรรยากาศสู่สี่พันดอน', en: 'Head toward the 4,000 Islands' }, summary: { th: 'เผื่อวันสำหรับเดินทางสู่สี่พันดอนและเที่ยวริมโขง เกาะที่เลือก เรือ จุดข้าม และที่พักต้องจัดลำดับให้สัมพันธ์กับการเดินทางจริง', en: 'Allow a day to reach Si Phan Don and explore the Mekong. The chosen island, boats, crossings and overnight stop need to fit the agreed route.' }, stops: ['champasak/si-phan-don'] },
      { day: 4, title: { th: 'คอนพะเพ็งและเส้นทางกลับ', en: 'Khone Phapheng and the onward journey' }, summary: { th: 'แวะน้ำตกคอนพะเพ็งก่อนเดินทางต่อ โดยตกลงจุดสิ้นสุดการเดินทางและเผื่อเวลาเดินทางให้ทันเที่ยวรถหรือเที่ยวบิน', en: 'Visit Khone Phapheng Falls before moving on, with the trip end point agreed and enough transfer time for your onward bus or flight.' }, stops: ['champasak/khone-phapheng'] },
    ],
    quoteDetails: {
      confirmed: { th: ['เป็นตัวอย่างแนวทาง 4 วัน 3 คืนในจำปาสัก', 'ราคาแสดง 8,900 บาทต่อท่านเป็นข้อมูลตัวอย่างเท่านั้น'], en: ['A suggested 4-day, 3-night Champasak plan', 'The displayed THB 8,900 per person is an example only'] },
      toConfirm: quoteToConfirm,
    },
  },
];

// ─────────────────────────────────────────────────────────────
// ฟังก์ชันช่วย
// ─────────────────────────────────────────────────────────────
export const findProvince = id => provinces.find(item => item.id === id);
export const findRegion = id => regions.find(item => item.id === id);

export function provincesByRegion(region) {
  return region && region !== 'all' ? provinces.filter(item => item.region === region) : [...provinces];
}

export function packagesFor({ provinceId, region } = {}) {
  return packages.filter(item => {
    if (provinceId) return item.provinceId === provinceId;
    if (region && region !== 'all') return findProvince(item.provinceId)?.region === region;
    return true;
  });
}

export function findPlace(ref) {
  const [provinceId, placeId] = ref.split('/');
  const province = findProvince(provinceId);
  const place = province?.places.find(item => item.id === placeId);
  return place ? { province, place } : null;
}

// ที่เที่ยวยอดนิยมทั้งหมด (สถานที่ที่มีรายละเอียดใน placeDetails) ตามลำดับใน placeDetails
export function famousPlaces(region = 'all') {
  return Object.keys(placeDetails)
    .map(ref => ({ ref, ...findPlace(ref), details: placeDetails[ref] }))
    .filter(item => item.place && (region === 'all' || item.province.region === region));
}

export function wrapSlide(index, count) {
  return count <= 0 ? 0 : ((index % count) + count) % count;
}

// เส้นทางเดิม #/destination/<id> → แขวงใหม่
export const legacyDestinations = {
  'luang-prabang': 'luang-prabang',
  'vang-vieng': 'vientiane-province',
  vientiane: 'vientiane-capital',
  champasak: 'champasak',
};

localizeContent({ site, companyProfile, faq, regions, placeTypes, tagLabels, provinces,
  featured, slides, valueProps, steps, placeDetails, packages });
