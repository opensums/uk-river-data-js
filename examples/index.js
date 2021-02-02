const { Station } = require('../dist/cjs');

const station = new Station('3400TH');

station.getCurrentReadings().then((readings) => {
  console.log('Readings', readings.toTimeSeries());
  // console.log('TimeSeries', readings.getTimeSeries());
});
