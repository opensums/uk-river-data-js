const { createStationReadings } = require('..');

const readings = createStationReadings('3400TH');

readings.getLatest().then((latest) => {
  console.log('Readings', readings);
  console.log('Latest', latest);
  // console.log('TimeSeries', readings.getTimeSeries());
});
