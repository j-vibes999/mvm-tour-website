// Unified catalog: keep real photography and generated illustrations distinguishable.
import * as original from './media-catalog.js';
import * as north from './media-north.js';
import * as central from './media-central.js';
import * as south from './media-south.js';
import * as northA from './media-north-completion-a.js';
import * as northCentral from './media-north-central-completion.js';
import * as root from './media-root-completion.js';
import * as southCompletion from './media-south-completion.js';

export const extraPhotos = { ...original.extraPhotos, ...north.photos, ...central.photos, ...south.photos, ...northA.photos, ...northCentral.photos, ...root.photos, ...southCompletion.photos };
export const provincePhotos = original.provincePhotos;
export const placePhotos = { ...original.placePhotos, ...north.placePhotos, ...central.placePhotos, ...south.placePhotos, ...northA.placePhotos, ...northCentral.placePhotos, ...root.placePhotos, ...southCompletion.placePhotos };
export const localPhotos = { ...original.localPhotos, ...north.localPhotos, ...central.localPhotos, ...south.localPhotos, ...northA.localPhotos, ...northCentral.localPhotos, ...root.localPhotos, ...southCompletion.localPhotos };
