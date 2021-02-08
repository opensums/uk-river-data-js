// src/index.js

import { version } from '../package.json';
import RiverBasinDistrict from './river-basin-district';

import { createReadings } from './readings';
import Station from './models/station';

// export { version, RiverBasinDistrict, Station };
export { version, createReadings, Station, RiverBasinDistrict };
