import { expect } from 'chai';

import { combine } from '../../../src';

const objectAndMap = 'object, map';

const firstObject = {
  a: {
    aa: 1,
    ab: 'aabb',
  },
  b: {
    ba: 2,
    bb: 'bbbb',
  },
  c: 3,
};

const secondObject = {
  not_a: 5,
  b: {
    bba: 10,
    bbb: 'bbb-string (from second source)',
  },
  not_c: 'not-c string',
};

const invalidAction =
  'Each item of options.actions array must be an object with mandatory "coverage" and "actor" ' +
  'properties, and optional "params" property.';

describe('===== combine [default options and errors] =====', () => {
  it('Successful run: objects', () => {
    const expectedResult = { ...firstObject, ...secondObject };

    const result = combine(firstObject, secondObject);
    expect(result).deep.equals(expectedResult);
    expect(result).to.not.equal(firstObject);
  });

  it('Successful run: maps', () => {
    const firstMap = new Map([
      ['a', 'aa'],
      ['b', 'bb'],
      ['c', 'cc'],
    ]);
    const secondMap = new Map([
      ['not-a', 'not-a-value'],
      ['b', 'b-second'],
      ['not-c', 'not-c-value'],
    ]);
    const expectedResult = new Map([
      ['a', 'aa'],
      ['b', 'b-second'],
      ['c', 'cc'],
      ['not-a', 'not-a-value'],
      ['not-c', 'not-c-value'],
    ]);

    const result = combine(firstMap, secondMap);
    expect(result).deep.equals(expectedResult);
    expect(result).to.not.equal(firstMap);
  });

  it('Successful run: object and primitive', () => {
    const expectedResult = 1;

    const result = combine(firstObject, 1);
    expect(result).to.equal(expectedResult);
  });

  it('Successful run: primitive and object', () => {
    const result = combine(true, firstObject);
    expect(result).to.deep.equals(firstObject);
    expect(result).to.not.equal(firstObject);
  });

  it('Successful run: sets', () => {
    const firstSet = new Set(['a', 'b', 'c']);
    const secondSet = new Set(['c', 'd', 'e']);
    const expectedResult = new Set(['a', 'b', 'c', 'd', 'e']);

    const result = combine(firstSet, secondSet);
    expect(result).deep.equals(expectedResult);
    expect(result).to.not.equal(firstSet);
  });

  it('Unknown option', () => {
    expect(
      combine.bind(null, firstObject, secondObject, { unknown: 1 })
    ).to.throw(
      'Unknown combine() "unknown" option. Valid options are "accumulator", ' +
        '"customizer", "creator", "output", "descriptors", "actions".'
    );
  });

  it('Invalid "accumulator" option', () => {
    expect(
      combine.bind(null, firstObject, secondObject, { accumulator: 1 })
    ).to.throw(
      'The optional combine() option "accumulator" must not be a primitive type.'
    );
  });

  it('Invalid "descriptors" option', () => {
    expect(
      combine.bind(null, firstObject, secondObject, { descriptors: 1 })
    ).to.throw(
      'The optional combine() option "descriptors" must be a boolean.'
    );
  });

  it('Invalid "output" option', () => {
    expect(
      combine.bind(null, firstObject, secondObject, { output: 'brief' })
    ).to.throw(
      'Invalid value of the optional combine() option "output". Possible values are "simple", "verbose".'
    );
  });

  it('Invalid "customizer" option', () => {
    expect(
      combine.bind(null, firstObject, secondObject, {
        customizer: 'customizer',
      })
    ).to.throw(
      'If optional combine() option "customizer" is present, it must be a function.'
    );
  });

  it('"actions" option is not an array', () => {
    expect(
      combine.bind(null, firstObject, secondObject, {
        actions: 'actions',
      })
    ).to.throw(
      'If optional combine() option "actions" is present, it must be an array.'
    );
  });

  it('Unknown key in "actions" item', () => {
    expect(
      combine.bind(null, firstObject, secondObject, {
        actions: [
          { coverage: 'Object, Map', actor: 'merge' },
          { coverage: ' OBJECT , map', function: 'merge' },
        ],
      })
    ).to.throw(invalidAction);
  });

  it('Extra key in "actions" item', () => {
    expect(
      combine.bind(null, firstObject, secondObject, {
        actions: [
          { coverage: objectAndMap, actor: 'merge' },
          { coverage: objectAndMap, actor: 'merge', function: 'merge' },
        ],
      })
    ).to.throw(invalidAction);
  });

  it('Missing "actor" key in "actions" item', () => {
    expect(
      combine.bind(null, firstObject, secondObject, {
        actions: [
          { coverage: objectAndMap, actor: 'merge' },
          { coverage: '*' },
        ],
      })
    ).to.throw(invalidAction);
  });

  it('Missing "coverage" key in "actions" item', () => {
    expect(
      combine.bind(null, firstObject, secondObject, {
        actions: [
          { coverage: objectAndMap, actor: 'merge' },
          { actor: 'merge' },
        ],
      })
    ).to.throw(invalidAction);
  });

  it('Extra "coverage" item', () => {
    expect(
      combine.bind(null, firstObject, secondObject, {
        actions: [
          { coverage: 'object', actor: 'merge' },
          { coverage: [objectAndMap, 'all', 'array'], actor: 'merge' },
        ],
      })
    ).to.throw(
      `Invalid "merge" actor description. When actor's coverage is specified as an array, that array must contains ` +
        `exactly two elements: coverages for the first and second parameters.`
    );
  });

  it('Too few "coverage" items', () => {
    expect(
      combine.bind(null, firstObject, secondObject, {
        actions: [
          { coverage: 'object', actor: 'merge' },
          { coverage: ['object'], actor: 'merge' },
        ],
      })
    ).to.throw(
      `Invalid "merge" actor description. When actor's coverage is specified as an array, that array must contains ` +
        `exactly two elements: coverages for the first and second parameters.`
    );
  });

  it('Unknown predefined coverage name', () => {
    expect(
      combine.bind(null, firstObject, secondObject, {
        actions: [
          { coverage: 'object', actor: 'merge' },
          { coverage: ['object', 'unknown'], actor: 'merge' },
        ],
      })
    ).to.throw(
      `Unknown type "unknown" as second source of "merge" actor. Possible values for this parameter are function or ` +
        `string which contains comma separated list of "a", "r", "y", "collection", "primitive", "all", "*", ` +
        `"!collection", "!primitive", "vocabulary", "!vocabulary", "array", "!array", "map", "!map", ` +
        `"object", "!object", "set", "!set", "boolean", "!boolean", "undefined", "!undefined", "symbol", "!symbol", ` +
        `"string", "!string", "number", "!number", "bigint", "!bigint", "null", "!null" in any combinations.`
    );
  });

  it('Invalid predefined coverage type', () => {
    expect(
      combine.bind(null, firstObject, secondObject, {
        actions: [
          { coverage: 'object', actor: 'merge' },
          { coverage: ['object', true], actor: 'merge' },
        ],
      })
    ).to.throw(
      `Invalid "merge" actor description. The coverage can't be a boolean. It must be either a function or a ` +
        `string representing one of the preset values ("replace", "merge", "diff").`
    );
  });

  it('Unknown predefined actor name', () => {
    expect(
      combine.bind(null, firstObject, secondObject, {
        actions: [
          { coverage: 'object', actor: 'merge' },
          { coverage: ['object', 'object'], actor: 'unknown' },
        ],
      })
    ).to.throw(
      'Unknown predefined actor "unknown". Valid values are "replace", "merge", "diff".'
    );
  });

  it('Invalid actor type', () => {
    expect(
      combine.bind(null, firstObject, secondObject, {
        actions: [
          { coverage: 'object', actor: 'merge' },
          { coverage: ['object', 'object'], actor: 25 },
        ],
      })
    ).to.throw(
      "Actor can't be a number. It must be either a function or a string representing one of the preset values."
    );
  });
});
