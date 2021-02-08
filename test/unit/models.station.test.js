// test/unit/models.station.test.js

import getLatestResponse from '../responses/station-get-latest.json';

import Station from '../../src/models/station';

const { getLatest } = Station;

describe('The Station model', () => {
  describe('Station.getLatest()', () => {
    it('should make the right request', async () => {
      const stationReference = '3400TH';
      const options = {
        path: `/flood-monitoring/id/stations/${stationReference}/readings`,
        params: { latest: '' },
      };
      const response = { data: { items: [] } };
      const request = jest.fn(() => Promise.resolve(response));

      await getLatest(stationReference, { request });

      expect(request).toHaveBeenLastCalledWith(options);
    });

    it('should return a promise for a Station object', async () => {
      const stationReference = '3400TH';
      const latest = {
        flow: ['2021-02-08T10:15:00Z', 344.6],
        level: ['2021-02-08T10:15:00Z', 4.666],
      };
      const response = { data: getLatestResponse };
      const request = jest.fn(() => Promise.resolve(response));

      const station = await getLatest(stationReference, { request });

      expect(station.stationReference).toBe(stationReference);
      expect(station.latest).toEqual(latest);
    });
  });
});
