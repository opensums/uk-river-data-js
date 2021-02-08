// src/models/measure.js

// Friendly names for measure types derived from parameter-qualifier strings in measure ids.
const types = {
  'flow-': 'flow',
  'level-stage': 'level',
  'level-downstage': 'downstreamLevel',
  'level-tidal_level': 'tideLevel',
  'rainfall-tipping_bucket_raingauge': 'rainfall',
  'temperature-dry_bulb': 'temperature',
  'wind-speed': 'windSpeed',
  'wind-direction': 'windDirection',
};

// Pre-compile this regular expression.
const parseMeasureIdRegExp = /\/(?<stationReference>[^-]*)-(?<type>(?<parameter>[^-]*)-(?<qualifier>[^-]*))-(?<valueType>[^-]*)-(?<period>[^-]*)-(?<unit>[^-]*)$/;

/**
 * Example: 1491TH-level-stage-i-15_min-mASD
 *
 * @param {string} id A measure id string from the API.
 * @return {Object} Parts parsed from the id.
 */
export function parseMeasureId(id) {
  const { groups } = id.match(parseMeasureIdRegExp);
  groups.type = types[groups.type] ?? groups.type;
  return groups;
}
