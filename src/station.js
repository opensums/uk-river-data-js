// src/single-station-readings.js

import { request } from './request';
import { DAY, getTypeFromMeasure } from './helpers';

// Map measure uris to friendly names.
function mapLatestMeasures(data, measures, measuresMap) {
  return data.reduce((mapped, { dateTime, measure, value }) => {
    mapped[mapMeasure(measure, measures, measuresMap)] = [dateTime, value];
    return mapped;
  }, {});
}

function mapMeasure(measure, measures, measuresMap) {
  // If the measure id has already been mapped, return it.
  if (measuresMap[measure]) return measuresMap[measure];

  const type = getTypeFromMeasure(measure);
  if (measures[type]) {
    measures[measure] = { id: measure };
    measuresMap[measure] = measure;
    return measure;
  }
  measures[type] = { id: measure };
  measuresMap[measure] = type;
  return type;
}

// Map measure uris to friendly names.
function mapTimeSeriesMeasures(data, measures, measuresMap, readings = {}) {
  return data.reduce((mapped, { dateTime, measure, value }) => {
    const type = mapMeasure(measure, measures, measuresMap);
    if (mapped[type]) {
      mapped[type].unshift([dateTime, value]);
      return mapped;
    }
    mapped[type] = [[dateTime, value]];
    return mapped;
  }, readings);
}

class Station {
  constructor(stationReference) {
    // The reference for this station.
    this.stationReference = stationReference;

    // Readings that can be measured for this station.
    this.measures = {};

    // Reverse map from measure URIs to keys in `this.measures`.
    this.measuresMap = {};

    // Loaded readings.
    this.readings = {};

    // Latest readings.
    this.latest = null;
  }

  async getSince(options = {}) {
    try {
      const since =
        new Date(Date.now() - DAY).toISOString().substring(0, 19) + 'Z';
      /*
        new Date(Math.floor(Date.now() / DAY - 1) * DAY)
          .toISOString().substring(0, 19) + 'Z';
          */
      const path = `/flood-monitoring/id/stations/${this.stationReference}/readings`;
      const params = {
        since,
        _sorted: '',
        _limit: 500,
      };
      const response = await (options.request || request)({ path, params });

      mapTimeSeriesMeasures(
        response.data.items,
        this.measures,
        this.measuresMap,
        this.readings
      );
      return options.response ? [this.readings, response] : this.readings;
    } catch (err) {
      const e = new Error('Error requesting readings');
      e.error = err;
      throw e;
    }
  }

  async getLatest(options = {}) {
    try {
      const path = `/flood-monitoring/id/stations/${this.stationReference}/readings`;
      const params = { latest: '' };
      const response = await (options.request || request)({ path, params });
      this.latest = mapLatestMeasures(
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
}

/**
 * Create a Station object.
 *
 * @param  {(string|object)} stationReference The station reference or an options object.
 * @param  {object} [options = {}] Options.
 * @return {Station} An object for getting station readings.
 */
export function createStation(stationReference, options = {}) {
  return new Station(stationReference, options);
}
