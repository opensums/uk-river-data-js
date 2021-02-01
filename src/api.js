import axios from 'axios';

const api = axios.create({
  baseURL: 'https://environment.data.gov.uk',
  timeout: 5000,
  headers: {
    accept: 'application/json',
  },
});

export function request(options = {}) {
  if (options.path) {
    options.url = options.path;
    delete options.path;
  }
  return api(options);
}
