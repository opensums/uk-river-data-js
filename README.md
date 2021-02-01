# Boilerplate module

> Boilerplate for a JavaScript module (browser + node).

## Getting Started: in a web page

Current major browsers are supported but not Internet Explorer (edit `targets`
in `rollup.config.js` and run `npm run build` to change this).

Load the script from the CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/boilerplate-module@1"></script>
```

The module is exported as `BoilerplateModule`:

```html
<script>
  document.write(BoilerplateModule.version);
</script>
```

## Getting Started: in Node.js

Node >= 10 is currently supported in the distributed modules.

Install from `npm`:

```console
$ npm i boilerplate-module
```

Require CommonJS module:

```js
// Default should work...
const BoilerplateModule = require('boilerplate-module');
// ...or specify CommonJS module.
const BoilerplateModule = require('boilerplate-module/dist/cjs');
```

or import as an ES6 module:

```js
// Default should work...
import BoilerplateModule from 'boilerplate-module';
// ...or specify ES6 module.
import BoilerplateModule from 'boilerplate-module/dist/esm';
```

### Using

## Documentation

## Contributing

## License

Distributed under the MIT License. See [LICENSE] for more information.

## Contact

## Acknowledgements
