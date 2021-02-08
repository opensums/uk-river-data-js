const { getLatest } = require('..').Station;

getLatest('3400TH').then(({ latest }) => {
  console.log('Latest', latest);
  // console.log('TimeSeries', readings.getTimeSeries());
});
