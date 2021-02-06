// src/readings.js

import { request } from './request';
import { DAY, getTypeFromMeasure } from './helpers';

// Map measure uris to friendly names.
function mapLatestStationMeasures(
  data,
  measures,
  measuresMap,
  stationReference
) {
  const obj = {};
  obj[stationReference] = {};
  return data.reduce((mapped, { dateTime, measure, value }) => {
    mapped[stationReference][mapMeasure(measure, measures, measuresMap)] = [
      dateTime,
      value,
    ];
    return mapped;
  }, obj);
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

class Readings {
  constructor(options = {}) {
    // The reference for this station.
    if (options.stationReference) {
      this.selectionType = 'stationReference';
      this.selectionValue = options.stationReference;
    }

    // Readings that can be measured for the selected stations.
    this.measures = {};

    // Reverse map from measure URIs to keys in `this.measures`.
    this.measuresMap = {};

    // Loaded readings.
    this.readings = {};

    // Latest readings.
    this.latest = null;
  }

  // TODO rewrite for multiple stations.
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
    switch (this.selectionType) {
      case 'stationReference': {
        const path = `/flood-monitoring/id/stations/${this.selectionValue}/readings`;
        const params = { latest: '' };
        const response = await (options.request || request)({ path, params });
        this.latest = mapLatestStationMeasures(
          response.data.items,
          this.measures,
          this.measuresMap
        );
        return options.response ? [this.latest, response] : this.latest;
      } // end case stationReference

      default: {
        const e = new Error('Cannot get latest readings for selection type');
        e.info = this.selectionType;
        throw e;
      } // end case default
    }
  }
}

/**
 * Create a Readings object.
 *
 * @param  {object} [options = {}] Options.
 * @return {Readings} An object for getting readings.
 */
export function createReadings(options = {}) {
  return new Readings(options);
}
