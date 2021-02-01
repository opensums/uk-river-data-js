// babel.config.js

const { NODE_ENV } = process.env;

const presets = [];

if (NODE_ENV === 'test') {
  presets.push(['@babel/preset-env', { targets: { node: 'current' } }]);
}

module.exports = {
  presets,
};
