// src/helpers.js

/** @const {int} DAY Microseconds in a day. */
export const DAY = 24 * 60 * 60000;

/** @const {int} measureTypes Friendly names for measure types in ids. */
const types = {
  'flow-': 'flow',
  'level-stage': 'level',
  'level-downstage': 'downstreamLevel',
  'level-tidal_level': 'tideLevel',
};

export function getTypeFromMeasure(measure) {
  const matches = measure.match(/[A-Za-z0-9]*-([A-Za-z]*-[A-Za-z]*)-.*-.*-.*$/);
  return types[matches[1]] ?? measure;
}
