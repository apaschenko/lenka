import { expect } from 'chai';

import { BY_DEFAULT, clone, CustomizerParams } from '../../../src';

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
        sequence: string,
        rootLabel: number,
        rootProducedAs: string,
      };
    }

    const customizer = (params: CustParams) => {
      const acc = params.accumulator;

      acc.counter += 1;

      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      acc.sequence += `${params.label}(${params.key || 'root'})[${
        params.level
      }]${params.isItAPrimitive ? 'prm.' : 'obj.'}${
        params.isItAdouble ? 'double' : 'new'
      };`;

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
      accumulator: { counter: 0, sequence: '' },
      output: 'verbose',
    });

    expect(copy.accumulator).to.deep.equal({
      counter: 23,
      sequence:
        '0(root)[0]obj.new;1(a)[1]prm.new;2(b)[1]obj.new;3(0)[2]prm.new;' +
        '4(1)[2]prm.new;5(2)[2]obj.new;6(bbc)[3]obj.new;7(0)[4]prm.new;' +
        '8(1)[4]obj.new;9(xxx)[5]obj.new;10(0)[6]prm.new;11(c)[1]obj.new;' +
        '12(d)[2]prm.new;13(e)[2]prm.new;14(f)[2]obj.new;15(0)[3]obj.new;' +
        '16(g)[4]obj.new;17(0)[5]prm.new;18(1)[5]obj.new;19(0)[6]prm.new;' +
        '20(1)[6]prm.new;21(1)[3]prm.new;22(loop)[1]obj.double;',
      rootLabel: 0,
    });
  });

  it('object with postprocessing: setByLabel (succesfully for primitive types)', () => {
    const original = {
      a: 'aaa',
      b: [2, { c: 9 }],
    };

    const expectedResult = {
      a: 'bbb',
      b: ['kkk', { c: 15 }],
    };

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
});
