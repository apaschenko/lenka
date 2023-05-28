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
  if (params.producedBy === 'a' && params.level === 1) {
    params.accumulator.labelA = params.label;
  } else if (params.producedBy === 'c' && params.level === 3) {
    params.accumulator.labelC = params.label;
  } else if (params.producedBy == 0 && params.level === 2) {
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

      acc.sequence += `${
        params.path.map((item) => item.producedBy).join(',') || 'root'
      }(${params.level})[${params.produsedAs}]${
        params.isItAPrimitive ? 'pr.' : 'obj.'
      }${params.isItAdouble ? 'double' : 'new'};`;

      acc.rootLabel = params.root.label;
      acc.rootProducedAs = params.root.produsedAs;

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
        'root(0)[root]obj.new;a(1)[property]pr.new;b(1)[property]obj.new;b,0(2)[property]pr.new;' +
        'b,1(2)[property]pr.new;b,2(2)[property]obj.new;b,2,bbc(3)[property]obj.new;b,2,bbc,0(4)[property]pr.new;' +
        'b,2,bbc,1(4)[property]obj.new;b,2,bbc,1,xxx(5)[property]obj.new;b,2,bbc,1,xxx,0(6)[property]pr.new;' +
        'c(1)[property]obj.new;c,d(2)[property]pr.new;c,e(2)[property]pr.new;c,f(2)[property]obj.new;' +
        'c,f,0(3)[property]obj.new;c,f,0,g(4)[property]obj.new;c,f,0,g,0(5)[property]pr.new;' +
        'c,f,0,g,1(5)[property]obj.new;c,f,0,g,1,0(6)[property]pr.new;c,f,0,g,1,1(6)[property]pr.new;' +
        'c,f,1(3)[property]pr.new;loop(1)[property]obj.double;',
      rootLabel: 0,
      rootProducedAs: 'root',
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
