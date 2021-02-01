const { RiverBasinDistrict } = require('..');

new RiverBasinDistrict().get().then((districts) => {
  console.log('Districts', districts);
});
