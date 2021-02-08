// test/functional/models.station.test.js

import { Station } from '../../dist/cjs';

const { getLatest } = Station;

let station;

async function getLatestCached() {
  if (!station) {
    station = await getLatest('3400TH');
  }
  return station;
}

describe('An object created by createCurrentReadings', () => {
  describe('the latest readings for a station', () => {
    it('should be more than 1m and 50cumecs', async () => {
      const { latest } = await getLatestCached();
      expect(latest.level[1]).toBeGreaterThan(1);
      expect(latest.flow[1]).toBeGreaterThan(50);
      // Timestamps should be equal.
      expect(latest.flow[0]).toBe(latest.level[0]);
    });

    it('should have equal timestamps within the last 4 hours', async () => {
      const { latest } = await getLatestCached();
      expect(latest.flow[0]).toBe(latest.level[0]);
      const lag = Date.now() - new Date(latest.flow[0]).valueOf();
      expect(lag).toBeGreaterThan(0);
      expect(lag).toBeLessThan(14400000);
    });
  });
});
