// src/index.js

import { version } from '../package.json';
import RiverBasinDistrict from './river-basin-district';
// import Station from './models/station';

import { createReadings } from './readings';
import { createStation } from './station';

// export { version, RiverBasinDistrict, Station };
export { version, createReadings, createStation, RiverBasinDistrict };
