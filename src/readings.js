// src/readings.js

import { request } from './request';
import { DAY, getTypeFromMeasure } from './helpers';

/*
"@id" : "http://environment.data.gov.uk/flood-monitoring/data/readings/F1906-flow-logged-i-15_min-m3_s/2021-02-07T22-30-00Z" ,
"dateTime" : "2021-02-07T22:30:00Z" ,
"measure" : "http://environment.data.gov.uk/flood-monitoring/id/measures/F1906-flow-logged-i-15_min-m3_s" ,
"value" : 12.146
*/

function parseReadingsId(id) {
  // /F1906-flow-logged-i-15_min-m3_s/2021-02-07T22-30-00Z
  const [dateTime, measureId] = id.split('/').reverse();
  const [stationReference, parameter, thing, period, interval, unit] = measureId.split('-');
  return {dateTime, stationReference, parameter, thing, period, interval, unit};
}

// Map measure uris to friendly names.
function mapLatestMeasures(data, measures, measuresMap) {
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
    } else if (options.parameter) {
      this.selectionType = 'parameter';
      this.selectionValue = options.parameter;
    } else {
      // Throw?
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
        console.log('Getting latest');
        const path = '/flood-monitoring/data/readings';
        const params = { latest: '', stationReference: this.selectionValue };
        const response = await (options.request || request)({ path, params });
        this.latest = mapLatestMeasures(
          response.data.items,
          this.measures,
          this.measuresMap
        );
        return options.response ? [this.latest, response] : this.latest;
      } // end case stationReference

      case 'parameter': {
        const path = '/flood-monitoring/data/readings';
        const params = { latest: '', parameter: this.selectionValue };
        const response = await (options.request || request)({ path, params });
        this.latest = mapLatestMeasures(
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
