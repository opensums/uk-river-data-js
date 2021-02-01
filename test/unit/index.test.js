// test/unit/index.test.js

import { version } from '../../src/index';
import { SEMVER } from '../helpers';

describe('The boilerplate source code', () => {
  it('should have a version', () => {
    expect(version).toMatch(SEMVER);
  });
});
