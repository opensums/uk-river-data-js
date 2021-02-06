import { createStation } from '../../dist/cjs';

let latest;

async function getLatest(readings) {
  if (!latest) {
    latest = await readings.getLatest();
  }
  return latest;
}

describe('An object created by createCurrentReadings', () => {
  describe('the latest readings for a station', () => {
    const readings = createStation('3400TH');

    it('should be more than 1m and 50cumecs', async () => {
      const latest = await getLatest(readings);
      expect(latest.level[1]).toBeGreaterThan(1);
      expect(latest.flow[1]).toBeGreaterThan(50);
      // Timestamps should be equal.
      expect(latest.flow[0]).toBe(latest.level[0]);
    });

    it('should have equal timestamps within the last 4 hours', async () => {
      const latest = await getLatest(readings);
      expect(latest.flow[0]).toBe(latest.level[0]);
      const lag = Date.now() - new Date(latest.flow[0]).valueOf();
      expect(lag).toBeGreaterThan(0);
      expect(lag).toBeLessThan(14400000);
    });

    test('getLatest() should return a reference to readings.latest', async () => {
      const latest = await getLatest(readings);
      expect(latest).toBe(readings.latest);
    });
  });
});
