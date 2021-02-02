// src/index.js

import { version } from '../package.json';
import RiverBasinDistrict from './models/river-basin-district';
// import Station from './models/station';

import { createStationReadings } from './models/station-readings';

// export { version, RiverBasinDistrict, Station };
export { version, createStationReadings, RiverBasinDistrict };
