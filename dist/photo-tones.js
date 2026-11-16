// Average colour of each local photograph (slightly deepened). It fills the frame while a photo loads,
// so slow connections see calm colour instead of an empty box. A missing key falls back to forest green.
// Regenerate after adding photos: python3 scripts/photo-tones.py (needs Pillow).
export const photoTones = {
  'alms-giving':'#6c483d','anouvong-cave':'#686464','attapeu-fields':'#525840','balloon':'#605c60',
  'blue-lagoon':'#5a6952','buddha-park':'#4a6161','central-kong-leng':'#0e6a70','central-phou-bia':'#374855',
  'central-phou-hualone':'#6d705b','central-phou-khao-khouay':'#4c4b44','central-san-phou-mok':'#575a52',
  'central-tham-pha-fa':'#514f44','central-tham-piu':'#222320','central-that-sikhottabong':'#5e6a6a',
  'central-wat-phabath':'#637a88','central-wat-simungkhun':'#6a6458','fort-carnot':'#6a6c64',
  'huay-xai-town':'#605f5b','khone-phapheng':'#7c7873','kong-lor':'#4b5045','kuang-si':'#4d5650','li-phi':'#64615f',
  'lp-night-market':'#3a2f29','mekong-night-market':'#434b5b','muang-khoun-temple':'#6e6a60','muang-ngoi':'#586751',
  'muang-sing-town':'#776c6b','nam-ha-forest':'#586854','nam-kading-river':'#757777','nam-ngum-lake':'#576f82',
  'nam-song':'#6a777a','nam-xay':'#5d6764','nc-ban-na-tower':'#5d5742','nc-elephant-festival':'#7e6b5c',
  'nc-hintang':'#5c6856','nc-tad-saleuy':'#595c54','nc-tai-daeng-weaving':'#735354','nc-thakhek-loop':'#556577',
  'nc-uxo-centre':'#988d88','nc-wat-jom-khao':'#6d6c68','nong-khiaw':'#606d5d','north-a-ban-komen-tea':'#575a3c',
  'north-a-chom-ong':'#4d3b29','north-a-ethnic-museum':'#836e66','north-a-gibbon-experience':'#5c6048',
  'north-a-nam-dee':'#575d45','north-a-nam-kat':'#363f1e','north-a-namtha-night-market':'#40322b',
  'north-a-phou-that':'#2d261d','north-nam-nern-safari':'#5f6163','north-phongsaly-old-quarter':'#2f3231',
  'north-phou-fa':'#52594f','pak-ou':'#68523d','paksong-coffee':'#58634d','patuxai':'#737883',
  'phongsaly-town':'#656a5d','phousi':'#353f4d','plain-of-jars':'#69706d','point-tham-chang':'#34200e',
  'point-that-ing-hang':'#765c43','root-bolaven-villages':'#5c5f48','root-heuan-hin':'#5b5936',
  'root-phou-xieng-thong':'#655f49','root-saysettha-stupa':'#635b3b','royal-palace':'#635d55',
  'savannakhet-town':'#6e6665','sayaboury-elephants':'#67533b','sekong-river':'#6d6458','si-phan-don':'#707372',
  'slow-boat':'#6f716f','south-dinosaur-museum':'#6a5652','south-dong-amphan':'#5a5949','south-dong-natad':'#45482f',
  'south-finish-kandone':'#665b4b','south-finish-samakkhixay-market':'#68604a','south-finish-tad-hua-khon':'#60686b',
  'south-finish-tad-saepha':'#78766d','south-nong-fa':'#54615e','south-xe-xap':'#585b56','tad-faek-falls':'#717570',
  'tad-fane':'#394336','tad-lo-falls':'#3c4338','that-luang':'#6d7776','vang-vieng':'#737877','vat-phou':'#48472a',
  'vieng-xai-cave':'#57574e','wat-si-saket':'#7f6f63','wat-xieng-thong':'#6f7675',
};

export const imageTones = {
  'champasak':'#444630','hero':'#66543d','kuang-si':'#61634b','luang-prabang':'#6f5331','vang-vieng':'#605b42',
  'vientiane':'#805b33',
};
