// src/models/river-basin-district.js
import { request } from '../api';

// -flow--i-15_min-m3_s"
// -flow--Mean-15_min-m3_s
// -flow--i-15_min-m3_s
// -level-downstage-i-15_min-mASD
// -level-stage-i-15_min-mASD
// -level-stage-i-15_min-mAOD
// -level-tidal_level-Mean-15_min-m
// -level-tidal_level-Mean-15_min-mAOD
// - valueType: mean
// - unitName: mAOD, mASD, m3, m

// Capture regex \/{id}-(.*)$
// Alt: /{id}-{parameter}-{qualifierType}-{valueType}-{periodType}-{unitName}

// qualifiers: tidal_level, groundwater
/*
function transform(data) {
  return data.reduce((items, { notation: id, label: name }) => {
    items[id] = {
      id,
      name,
    };
    return items;
  }, {});
}
*/

const DAY = 24 * 60 * 60000;

/*
"@id": "http://environment.data.gov.uk/flood-monitoring/data/readings/3400TH-level-stage-i-15_min-mAOD/2021-02-01T23-15-00Z",
"dateTime": "2021-02-01T23:15:00Z",
"measure": "http://environment.data.gov.uk/flood-monitoring/id/measures/3400TH-level-stage-i-15_min-mAOD",
"value": 4.716
*/

/*
  [
    {
      '@id': 'http://environment.data.gov.uk/flood-monitoring/data/readings/3400TH-level-stage-i-15_min-mAOD/2021-02-02T15-15-00Z',
      dateTime: '2021-02-02T15:15:00Z',
      measure: 'http://environment.data.gov.uk/flood-monitoring/id/measures/3400TH-level-stage-i-15_min-mAOD',
      value: 4.681
    },
    {
      '@id': 'http://environment.data.gov.uk/flood-monitoring/data/readings/3400TH-flow--i-15_min-m3_s/2021-02-02T15-15-00Z',
      dateTime: '2021-02-02T15:15:00Z',
      measure: 'http://environment.data.gov.uk/flood-monitoring/id/measures/3400TH-flow--i-15_min-m3_s',
      value: 377.5
    }
  ],
*/

const types = {
  'flow-': 'flow',
  'level-stage': 'level',
  'level-downstage': 'downstreamLevel',
  'level-tidal_level': 'tideLevel',
};

function getTypeFromMeasure(measure) {
  const matches = measure.match(/[A-Za-z0-9]*-([A-Za-z]*-[A-Za-z]*)-.*-.*-.*$/);
  return types[matches[1]] ?? measure;
}

// Map measure uris to friendly names.
function mapMeasures(data, measures, measuresMap) {
  return data.reduce((mapped, { dateTime, measure, value }) => {
    if (!measuresMap[measure]) {
      const type = getTypeFromMeasure(measure);
      if (measures[type]) {
        measures[measure] = { id: measure };
        measuresMap[measure] = measure;
      } else {
        measures[type] = { id: measure };
        measuresMap[measure] = type;
      }
    }
    mapped[measuresMap[measure]] = [dateTime, value];
    return mapped;
  }, {});
}

class StationReadings {
  constructor(stationReference, options = {}) {
    this.options = options;

    // Readings that can be measured for this station.
    this.measures = {};

    // Reverse map from measure URIs to keys in `this.measures`.
    this.measuresMap = {};

    // The reference for this station.
    this.stationReference = stationReference;

    // Loaded readings.
    this.readings = {};

    // Latest readings.
    this.latest = null;
  }

  async getSince() {
    try {
      const since =
        new Date(Date.now() - DAY).toISOString().substring(0, 19) + 'Z';
      return request({
        path:
          `/flood-monitoring/id/stations/${this.stationReference}` +
          `/readings?since=${since}&_sorted`,
      });
    } catch (err) {
      const e = new Error('Error requesting readings');
      e.error = err;
      throw e;
    }
  }

  async getLatest(options = {}) {
    try {
      const response = await (options.request || request)({
        path:
          `/flood-monitoring/id/stations/${this.stationReference}` +
          `/readings?latest`,
      });
      this.latest = mapMeasures(
        response.data.items,
        this.measures,
        this.measuresMap
      );
      return options.response ? [this.latest, response] : this.latest;
    } catch (err) {
      const e = new Error('Error requesting readings');
      e.error = err;
      throw e;
    }
  }
  toTimeSeries() {
    const mapIds = {};
    const timeSeries = {};
    this.response.data.items.forEach(({ measure, dateTime, value }) => {
      if (!mapIds[measure]) {
        mapIds[measure] = getTypeFromMeasure(measure);
        timeSeries[mapIds[measure]] = [];
      }
      timeSeries[mapIds[measure]].unshift([dateTime, value]);
    });
    return timeSeries;
  }
}

/**
 * Create a Station Readings object.
 *
 * @param {(string|object)} stationReference The station reference or an options object.
 * @param {object} [options = {}] Options.
 * @return {StationReadings} An object for getting station readings.
 */
export function createStationReadings(stationReference, options = {}) {
  return new StationReadings(stationReference, options);
}
