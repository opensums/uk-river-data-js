// src/models.station.js

import { request } from '../request';
import { DAY } from '../helpers';
import { parseMeasureId } from './measure';

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

  const { type } = parseMeasureId(measure);
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
    // Configure a request.
    const path = `/flood-monitoring/id/stations/${this.stationReference}/readings`;
    const params = { latest: '' };
    // Get the response, using an optional request method if provided.
    const response = await (options.request || request)({ path, params });

    // Map the received items.
    try {
      this.latest = mapLatestMeasures(
        response.data.items,
        this.measures,
        this.measuresMap
      );
      return options.response ? [this.latest, response] : this.latest;
    } catch (err) {
      const e = new Error('Error processing response');
      e.error = err;
      e.response = response;
      throw e;
    }
  }
}

/**
 * Get a Station object with the latest readings.
 *
 * @param  {string} stationReference The station reference.
 * @param  {object} [options = {}] Options.
 * @return {Promise} A promise for a Station object with the latest readings.
 */
async function getLatest(stationReference, options = {}) {
  const station = new Station(stationReference, options);
  if (options.response) {
    const [, response] = await station.getLatest(options);
    return [station, response];
  }
  await station.getLatest(options);
  return station;
}

export default {
  getLatest,
};
