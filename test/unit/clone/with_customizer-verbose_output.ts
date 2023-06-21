import { expect } from 'chai';

import { BY_DEFAULT, MISSING, clone, CustomizerParams } from '../../../src';

function trivialCustomizer(_params: CustomizerParams): any {
  return BY_DEFAULT;
}

interface CustParamsToCollectLabels extends CustomizerParams {
  accumulator: {
    labelA: number,
    labelC: number,
    label0: number,
  };
}

function customizerToCollectLabels(params: CustParamsToCollectLabels): any {
  if (params.key === 'a' && params.level === 1) {
    params.accumulator.labelA = params.label;
  } else if (params.key === 'c' && params.level === 3) {
    params.accumulator.labelC = params.label;
  } else if (params.key == 0 && params.level === 2) {
    params.accumulator.label0 = params.label;
  }

  return BY_DEFAULT;
}

describe('===== clone [with customizer: verbose output] =====', () => {
  it('object', () => {
    const original = {
      a: 1,
      b: [
        {
          c: 'ccc',
          d: 2,
        },
      ],
      e: {
        f: [3, { g: 8, i: 'iii' }],
        bb: null,
      },
    };

    original.e.bb = original;

    const { result } = clone(original, {
      customizer: trivialCustomizer,
      output: 'verbose',
    });

    expect(result).to.deep.equal(original);
    expect(result).to.not.equal(original);
  });

  it('array', () => {
    const original: any[] = [
      {
        a: 1,
        b: [
          {
            c: 'ccc',
            d: 2,
          },
        ],
        e: {
          f: [3, { g: 8, i: 'iii' }],
        },
      },
      77,
      { j: 3, k: 'kkk' },
    ];

    original.push({ z: original });

    const { result } = clone(original, {
      customizer: trivialCustomizer,
      output: 'verbose',
    });

    expect(result).to.deep.equal(original);
    expect(result).to.not.equal(original);
  });

  it('object with postprocessing: an accumulator using)', () => {
    interface CustParams extends CustomizerParams {
      accumulator: {
        counter: number,
        description: string,
        rootLabel: number,
        rootProducedAs: string,
      };
    }

    const customizer = (params: CustParams) => {
      const acc = params.accumulator;

      acc.counter += 1;

      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      acc.description += `label: ${params.label} (key: ${params.key || 'root'}, lvl:${
        params.level
      }, ${params.isItAPrimitive ? 'primitive' : 'object'}, ${
        params.isItAdouble ? 'double' : 'new'
      });`;

      acc.rootLabel = params.root.label;

      return BY_DEFAULT;
    };

    const original: any = {
      a: 'aa',
      b: ['bba', 'bbb', { bbc: [1, { xxx: [15] }] }],
      c: { d: 1, e: 2, f: [{ g: [5, [9, 11]] }, 77] },
    };

    original.loop = original.c;

    const copy = clone(original, {
      customizer,
      accumulator: { counter: 0, description: '' },
      output: 'verbose',
    });

    expect(copy.accumulator).to.deep.equal({
      counter: 23,
      description: 'label: 0 (key: root, lvl:0, object, new);' +
      'label: 1 (key: a, lvl:1, primitive, new);' +
      'label: 2 (key: b, lvl:1, object, new);' +
      'label: 3 (key: 0, lvl:2, primitive, new);' +
      'label: 4 (key: 1, lvl:2, primitive, new);' +
      'label: 5 (key: 2, lvl:2, object, new);' +
      'label: 6 (key: bbc, lvl:3, object, new);' +
      'label: 7 (key: 0, lvl:4, primitive, new);' +
      'label: 8 (key: 1, lvl:4, object, new);' +
      'label: 9 (key: xxx, lvl:5, object, new);' +
      'label: 10 (key: 0, lvl:6, primitive, new);' +
      'label: 11 (key: c, lvl:1, object, new);' +
      'label: 12 (key: d, lvl:2, primitive, new);' +
      'label: 13 (key: e, lvl:2, primitive, new);' +
      'label: 14 (key: f, lvl:2, object, new);' +
      'label: 15 (key: 0, lvl:3, object, new);' +
      'label: 16 (key: g, lvl:4, object, new);' +
      'label: 17 (key: 0, lvl:5, primitive, new);' +
      'label: 18 (key: 1, lvl:5, object, new);' +
      'label: 19 (key: 0, lvl:6, primitive, new);' +
      'label: 20 (key: 1, lvl:6, primitive, new);' +
      'label: 21 (key: 1, lvl:3, primitive, new);' +
      'label: 22 (key: loop, lvl:1, object, double);',
      rootLabel: 0,
    });
  });

  it('object with postprocessing: setByLabel (succesfully for "key" and "property")', () => {
    const original = new Map<string, any>([
      ['a', 'aaa'],
      ['b', [2, { c: 9 }]]
    ]);

    const expectedResult = new Map<string, any>([
      ['a', 'bbb'],
      ['b', ['kkk', { c: 15 }]]
    ]);

    const { setByLabel, result, accumulator } = clone(original, {
      customizer: customizerToCollectLabels,
      accumulator: {
        counter: 0,
        sequence: '',
        labelA: -1,
        labelC: -1,
        label0: -1,
      },
      output: 'verbose',
    });

    setByLabel(accumulator.labelA, 'bbb');
    setByLabel(accumulator.labelC, 15);
    setByLabel(accumulator.label0, 'kkk');

    expect(result).to.deep.equal(expectedResult);
  });

  it('object with postprocessing: setByLabel (succesfully for "value")', () => {
    const original = new Map<string, any>([
      ['a', 'aaa'],
      ['b', new Set([5, 6, 7])]
    ]);

    const expectedResult = new Map<string, any>([
      ['a', 'aaa'],
      ['b', new Set([5, 'bbb', 7])]
    ]);

    const { setByLabel, result, accumulator } = clone(original, {
      customizer: (params: CustomizerParams) => {
        if (params.value === 6) {
          params.accumulator.label = params.label;
        }
        return BY_DEFAULT;
      },
      accumulator: { label: -1 },
      output: 'verbose',
    });

    setByLabel(accumulator.label, 'bbb');

    expect(result).to.deep.equal(expectedResult);
  });

  it('object with postprocessing: setByLabel (attempt to change the root node)', () => {
    const original = {
      a: 'aaa',
      b: [2, { c: 9 }],
    };

    const result = clone(original, {
      customizer: customizerToCollectLabels,
      accumulator: {
        counter: 0,
        sequence: '',
        labelA: -1,
        labelC: -1,
        label0: -1,
      },
      output: 'verbose',
    });

    expect(result.setByLabel.bind(result, 0, 'bbb')).to.throw(
      "You can't change a root node value (the whole cloning result) with" +
                " setByLabel method! Instead, use new value directly in your code."
    );
  });

  it('object with postprocessing: setByLabel (whrong label type error)', () => {
    const original = {
      a: 'aaa',
      b: [2, { c: 9 }],
    };

    const result = clone(original, {
      customizer: customizerToCollectLabels,
      accumulator: {
        counter: 0,
        sequence: '',
        labelA: -1,
        labelC: -1,
        label0: -1,
      },
      output: 'verbose',
    });

    expect(result.setByLabel.bind(result, ('aaa' as unknown as number), 'bbb')).to.throw(
      'Parameter of setByLabel/deleteLabel functions must be a number.'
    );
  });

  it('object with postprocessing: setByLabel (negative label number error)', () => {
    const original = {
      a: 'aaa',
      b: [2, { c: 9 }],
    };

    const result = clone(original, {
      customizer: customizerToCollectLabels,
      accumulator: {
        counter: 0,
        sequence: '',
        labelA: -1,
        labelC: -1,
        label0: -1,
      },
      output: 'verbose',
    });

    expect(result.setByLabel.bind(result, -1, 'bbb')).to.throw(
      'Invalid parameter of setByLabel/deleteLabel functions (out of range).'
    );
  });

  it('object with postprocessing: deleteByLabel (whrong label type error)', () => {
    const original = {
      a: 'aaa',
      b: [2, { c: 9 }],
    };

    const result = clone(original, {
      customizer: customizerToCollectLabels,
      accumulator: {
        counter: 0,
        sequence: '',
        labelA: -1,
        labelC: -1,
        label0: -1,
      },
      output: 'verbose',
    });

    expect(result.deleteByLabel.bind(result, ('aaa' as unknown as number), 'bbb')).to.throw(
      'Parameter of setByLabel/deleteLabel functions must be a number.'
    );
  });

  it('object with postprocessing: deleteByLabel (negative label number error)', () => {
    const original = {
      a: 'aaa',
      b: [2, { c: 9 }],
    };

    const result = clone(original, {
      customizer: customizerToCollectLabels,
      accumulator: {
        counter: 0,
        sequence: '',
        labelA: -1,
        labelC: -1,
        label0: -1,
      },
      output: 'verbose',
    });

    expect(result.deleteByLabel.bind(result, -1, 'bbb')).to.throw(
      'Invalid parameter of setByLabel/deleteLabel functions (out of range).'
    );
  });

  it('object with postprocessing: deleteByLabel (succesfully for "key")', () => {
    const original = {
      a: 'aaa',
      b: new Map([['a', 1], ['b', 2]]),
    };

    const expectedResult = {
      a: 'aaa',
      b: new Map([['a', 1]]),
    };

    const { deleteByLabel, result, accumulator } = clone(original, {
      customizer: (params: CustomizerParams) => {
        if (params.key === 'b') {
          params.accumulator.label = params.label;
        }
        return BY_DEFAULT;
      },
      accumulator: {
        label: -1,
      },
      output: 'verbose',
    });

    deleteByLabel(accumulator.label);

    expect(result).to.deep.equal(expectedResult);
  });

  it('object with postprocessing: deleteByLabel (succesfully for "property")', () => {
    const original = {
      a: 'aaa',
      b: { aa: 1, bb: 2, cc: 3 },
    };

    const expectedResult = {
      a: 'aaa',
      b: { aa: 1, cc: 3 },
    };

    const { deleteByLabel, result, accumulator } = clone(original, {
      customizer: (params: CustomizerParams) => {
        if (params.key === 'bb') {
          params.accumulator.label = params.label;
        }
        return BY_DEFAULT;
      },
      accumulator: {
        label: -1,
      },
      output: 'verbose',
    });

    deleteByLabel(accumulator.label);

    expect(result).to.deep.equal(expectedResult);
  });

  it('object with postprocessing: deleteByLabel (succesfully for "value")', () => {
    const original = {
      a: 'aaa',
      b: new Set(['aa', 'bb', 'cc']),
    };

    const expectedResult = {
      a: 'aaa',
      b: new Set(['aa', 'cc']),
    };

    const { deleteByLabel, result, accumulator } = clone(original, {
      customizer: (params: CustomizerParams) => {
        if (params.key === 'bb') {
          params.accumulator.label = params.label;
        }
        return BY_DEFAULT;
      },
      accumulator: {
        label: -1,
      },
      output: 'verbose',
    });

    deleteByLabel(accumulator.label);

    expect(result).to.deep.equal(expectedResult);
  });

  it('object with postprocessing: deleteByLabel error (an attemt to delete the root node)', () => {
    const original = {
      a: 'aaa',
      b: [2, { c: 9 }],
    };

    const result = clone(original, {
      customizer: customizerToCollectLabels,
      output: 'verbose',
    });

    expect(result.deleteByLabel.bind(result, 0)).to.throw(
      "You can't delete a root node (the whole cloning result)!"
    );
  });

  it('check parents', () => {
    const original = { a: { b: 15 } };

    const { accumulator } = clone(original, {
      output: 'verbose',
      accumulator: { root: -1, b: -1 },
      customizer: (params: CustomizerParams) => {
        if (params.label === 0) {
          params.accumulator.root = params.parent;
        }

        if (params.key === 'b') {
          params.accumulator.b = params.parent.value;
        }

        return BY_DEFAULT;
      }
    });

    expect(accumulator.b).to.be.equal(original.a);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(accumulator.root).to.be.null;
  });

  it('check indexes', () => {
    const original = {
      a: new Map<string, any>([
        ['aa', 7],
        ['ab', 'AB'],
        ['ac', { aca: 15 }],
      ]),
      b: new Set([8, '9', 'last']),
      c: 10,
    };

    const expectedResult = {
      a: new Map<string, any>([
        ['aa', 7],
        ['ac', { aca: 15 }],
      ]),
      b: new Set([8, 'last']),
    };

    const result = clone(original, {
      output: 'verbose',
      accumulator: { ixs: [] },
      customizer: (params: CustomizerParams) => {
        params.accumulator.ixs.push(params.index);
        return ['ab', '9', 'c'].includes(params.key) ? MISSING : BY_DEFAULT;
      },
    });

    expect(result.result).to.deep.equal(expectedResult);

    for (const value of result.accumulator.ixs) {
      expect(value).to.equal(0);
    }
  });

  it('getting options', () => {
    const options = {
      output: 'verbose',
      accumulator: { options: [] },
      customizer: (params: CustomizerParams) => {
        params.accumulator.options.push(params.options);

        return BY_DEFAULT;
      }
    } as const;

    const result = clone({ a: 1 }, options);

    expect(result.options).to.be.equal(options);

    for (const opts of result.accumulator.options) {
      expect(opts).to.be.equal(options);
    }
  });
});
