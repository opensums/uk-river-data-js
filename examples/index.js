const { getLatest } = require('..').Station;

getLatest('3400TH', { response: true })
  .then(([station, response]) => {
    console.log('Station', station);
    console.log('Response', response.data.items);
    // console.log('TimeSeries', readings.getTimeSeries());
  })
  .catch((err) => {
    console.log('Error', err);
  });
