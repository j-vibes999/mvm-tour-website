# Homepage destination gallery — 20 October 2026

The homepage `slides` array has **14 real photographs**. The original four destination positions remain in their original order, now displaying licensed photographs instead of designed imagery; ten real destination photographs follow. Every image was already cached in this project. No photographs were downloaded or generated for this change.

Each added entry has `provinceId`, `placeRef`, `photo`, and bilingual (`th` / `en`) `name`, `line`, and `alt` fields. `photo` references the existing licensed catalog and local image variants. Every `placeRef` resolves to the exact existing place in `content.js`.

## Selection and sources

The later homepage refinement replaced the first four displayed images with these existing photographs. Their source records and licences remain in `dist/content.js`, and their local responsive files in `dist/complete-media.js`. The visible camera icon opens the current photograph's attribution.

| Position | Photo key | Photographer | Licence | Scene |
| --- | --- | --- | --- | --- |
| 1 | `vang-vieng` | Basile Morin | CC BY-SA 4.0 | Karst mountains reflected in the water at Vang Vieng |
| 2 | `phousi` | Basile Morin | CC BY-SA 4.0 | Luang Prabang rooftops and the Mekong at dusk |
| 3 | `tad-fane` | Supanut Arunoprayote | CC BY 4.0 | Twin Tad Fane waterfalls |
| 4 | `that-luang` | Phillip Maiwald (Nikopol) | CC BY-SA 3.0 | Golden Pha That Luang and its grounds |

The homepage image preload and share image now use the same real Vang Vieng photograph as the first slide. Both the direct source template and generated locale pages preload its responsive local files.

The ten 960 px local files were visually inspected. All are landscape photographs. Captions describe the photographed scene: for example, the Kong Lor view is the cave entrance, the Vat Phou view is the plumeria-lined stairway, and the Muang Ngoi view is from Phanoi Viewpoint. The selection alternates forest pools, mountain villages, river sunsets, a cave, temple architecture, misty peaks, ancient stonework and the southern Mekong rapids. No added entry repeats an identical source image.

All ten photo records are defined in `dist/content.js` (`photos`). Their local variant mappings are exposed through `dist/complete-media.js` (`localPhotos`, originally from `media-catalog.js`). Existing attribution and license metadata should accompany display. All ten use [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); cached derivatives are resized and converted to WebP, and display may crop to fit.

| Position | Photo key / exact place reference | Recorded photographer | Wikimedia Commons source | Original dimensions |
| --- | --- | --- | --- | --- |
| 5 | `kuang-si` / `luang-prabang/kuang-si` | Basile Morin | [Kuang Si Falls and a turquoise water pool](https://commons.wikimedia.org/wiki/File:Kuang_Si_Falls_and_a_turquoise_water_pool_in_Luang_Prabang_province_Laos.jpg) | 6039 × 4026 |
| 6 | `nong-khiaw` / `luang-prabang/nong-khiaw` | Ekrem Canli | [Nong Khiaw panorama](https://commons.wikimedia.org/wiki/File:Nong_Khiaw_pano%281%29.jpg) | 3888 × 2592 |
| 7 | `si-phan-don` / `champasak/si-phan-don` | Basile Morin | [Pirogue on the Mekong at sunset near Don Det](https://commons.wikimedia.org/wiki/File:Pirogue_running_on_the_Mekong_at_sunset_with_pink_clouds_in_Don_Det_Laos.jpg) | 6720 × 3780 |
| 8 | `kong-lor` / `khammouane/kong-lor` | Jakub Hałun | [Kong Lor Cave entrance](https://commons.wikimedia.org/wiki/File:20171120_Wlot_jaskini_Kong_Lor_w_Laosie_3663_DxO.jpg) | 4114 × 2158 |
| 9 | `muang-ngoi` / `luang-prabang/muang-ngoi` | Christophe95 | [Muang Ngoi Neua from Phanoi Viewpoint](https://commons.wikimedia.org/wiki/File:Muang_Ngoi_Neua_from_the_Phanoi_Viewpoint.jpg) | 5184 × 3888 |
| 10 | `wat-xieng-thong` / `luang-prabang/wat-xieng-thong` | Basile Morin | [Temple Wat Xieng Thong](https://commons.wikimedia.org/wiki/File:Temple_Wat_Xieng_Thong_-_Luang_Prabang_-_Laos.jpg) | 5529 × 3291 |
| 11 | `nam-xay` / `vientiane-province/nam-xay` | Basile Morin | [Karst peaks and sunrise mist from Nam Xay](https://commons.wikimedia.org/wiki/File:Karst_peaks_mist_and_colorful_clouds_at_sunrise_seen_from_Mount_Nam_Xay_in_Vang_Vieng_Laos.jpg) | 6571 × 4381 |
| 12 | `vat-phou` / `champasak/vat-phou` | Basile Morin | [Plumeria over the stone stairs of Wat Phou](https://commons.wikimedia.org/wiki/File:Twisted_Plumeria_tree_trunk_overgrowing_the_steep_stone_stairs_of_Wat_Phou_temple%2C_Champasak%2C_Laos.jpg) | 6720 × 4480 |
| 13 | `plain-of-jars` / `xiengkhouang/plain-of-jars` | Jakub Hałun | [Plain of Jars, 2017](https://commons.wikimedia.org/wiki/File:20171115_Plain_of_Jars_Laos_2540_DxO.jpg) | 4867 × 3224 |
| 14 | `khone-phapheng` / `champasak/khone-phapheng` | Basile Morin | [Khone Phapheng Falls](https://commons.wikimedia.org/wiki/File:Khone_Phapheng_Falls%2C_Si_Phan_Don%2C_Laos%2C_widest_waterfall_in_the_world.jpg) | 6688 × 3762 |

## Cached files and byte sizes

All files below already existed before the gallery expansion. Paths are relative to `dist/assets/images/photos/`; the runtime's default source is the 960 px variant and its `srcset` includes all three widths.

| Filename stem | `-480.webp` bytes | `-960.webp` bytes | `-1600.webp` bytes |
| --- | ---: | ---: | ---: |
| `kuang-si` | 37,536 | 157,592 | 380,610 |
| `nong-khiaw` | 36,594 | 150,430 | 351,738 |
| `si-phan-don` | 13,374 | 55,242 | 130,738 |
| `kong-lor` | 36,214 | 158,742 | 405,498 |
| `muang-ngoi` | 44,356 | 176,474 | 391,952 |
| `wat-xieng-thong` | 29,572 | 119,504 | 305,562 |
| `nam-xay` | 21,784 | 93,508 | 217,700 |
| `vat-phou` | 56,656 | 230,878 | 539,608 |
| `plain-of-jars` | 32,042 | 146,664 | 378,864 |
| `khone-phapheng` | 30,426 | 126,748 | 298,958 |

## Validation

The gallery has 14 `photo` entries with bilingual labels and alt text. Province and exact place references resolve to the existing content; local responsive files and attribution metadata remain available. The ten files and 30 variants detailed above describe the earlier expansion, with the first four photographs listed separately. No source metadata or existing media catalog entries were changed.

## Gallery behavior and verification

The gallery starts rotating every eight seconds under normal motion preferences. Hovering over the hero or Play control no longer prevents the next photo from appearing. The Play/Pause control contains only its SVG icon and an accessible name; instructional playback text is not displayed. The thumbnail strip is one horizontal row on every viewport and supports touch panning, trackpad scrolling, and mouse dragging. Selecting a photograph follows its exact place reference and exposes an icon linking to that photograph's credit.

The player pauses offscreen or in a hidden tab, stops when reduced motion is enabled, and leaves keyboard exploration still until Play is explicitly activated. A failed automatic photo is skipped without clearing the current picture. Image changes wait for decoding, and the selected thumbnail stays in view.

Verification: 39 source/data tests passed, 29 complete browser tests passed, and one additional horizontal-strip regression passed for both mouse drag and native touch swipe. Playback tests assert actual changes to the main image and selected slide, including while the pointer remains on Play; pause and reduced-motion tests assert that the image does not advance. Six visual cases at 320, 390 and 1440px showed 14 thumbnails, loaded images, empty visible Play-button text, correct real-photo credit links and no page overflow or JavaScript errors. Captures are in `.artifacts/hero-gallery-2026-10-20/round1/`.

After the complete homepage refinement, all 39 source/data tests and all 33 browser tests passed again, including those playback and failure-recovery cases with the new first four real photographs. Current desktop, mobile, small English and tablet captures are in `.artifacts/home-refresh-2026-10-20/round1/`.
