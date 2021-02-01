// src/models/river-basin-district.js
import { request } from '../api';

function transform(data) {
  return data.reduce((items, { notation: id, label: name }) => {
    items[id] = {
      id,
      name,
    };
    return items;
  }, {});
}

export default class RiverBasinDistrict {
  constructor(options = {}) {
    this.request = options.request ?? request;
  }

  async get() {
    try {
      const res = await this.request({
        path: '/catchment-planning/so/RiverBasinDistrict',
      });
      return transform(res.data.items);
    } catch (err) {
      console.log('Error', err);
    }
  }

  async getCatchments() {}
}

// /catchment-planning/so/RiverBasinDistrict/6/management-catchments

/*
{
  '@id': 'http://environment.data.gov.uk/catchment-planning/so/RiverBasinDistrict/6',
  label: 'Thames',
  notation: '6',
  type: [
    'http://environment.data.gov.uk/catchment-planning/def/water-framework-directive/RiverBasinDistrict',
    'http://purl.org/linked-data/version#VersionedThing'
  ]
}
*/
