// Every reviewed Lao and Simplified Chinese string, keyed by the English source.
// Source for generated language catalogues; browsers import lo.js or zh.js separately.
import places from './places.js';
import details from './details.js';
import programs from './programs.js';
import ui from './ui.js';
import effects from './effects.js';

export default { ...details, ...programs, ...places, ...ui, ...effects };
