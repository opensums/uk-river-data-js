import { createStationReadings } from '../..';

describe('An object created by createCurrentReadings', () => {
  describe('the latest readings for a station', async () => {
    const readings = createStationReadings('3400TH');
    const latest = await readings.getLatest();

    it('should be more than 1m and 50cumecs', () => {
      expect(latest.level[1]).toBeGreaterThan(1);
      expect(latest.flow[1]).toBeGreaterThan(50);
      // Timestamps should be equal.
      expect(latest.flow[0]).toBe(latest.level[0]);
    });

    it('should have equal timestamps within the last hour', () => {
      expect(latest.flow[0]).toBe(latest.level[0]);
      const lag = Date.now() - new Date(latest.flow[0]).valueOf();
      expect(lag).toBeGreaterThan(0);
      expect(lag).toBeLessThan(3600000);
    });
  });
});
