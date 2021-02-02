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

class CurrentReadingsResponse {
  constructor(response) {
    this.response = response;
  }

  toTimeSeries() {
    console.log(this.response.data);
    const mapIds = {};
    const timeSeries = {};
    this.response.data.items.forEach(({ measure, dateTime, value }) => {
      if (!mapIds[measure]) {
        mapIds[measure] = measure;
        timeSeries[mapIds[measure]] = [];
      }
      timeSeries[mapIds[measure]].unshift([dateTime, value]);
    });
    return timeSeries;
  }
}

export default class Station {
  constructor(id, options = {}) {
    this.stationReference = id;
    this.request = options.request ?? request;
  }

  async getCurrentReadings() {
    try {
      const since =
        new Date(Date.now() - DAY).toISOString().substring(0, 19) + 'Z';
      return new CurrentReadingsResponse(
        await this.request({
          path:
            `/flood-monitoring/id/stations/${this.stationReference}` +
            `/readings?since=${since}&_sorted`,
        })
      );
    } catch (err) {
      const e = new Error('Error requesting current readings');
      e.error = err;
      throw e;
    }
  }
}
