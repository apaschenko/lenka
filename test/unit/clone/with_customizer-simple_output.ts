import { expect } from 'chai';

import {
  BY_DEFAULT,
  clone,
  CustomizerParams,
  CloneOptions,
  MISSING,
} from '../../../src';

function trivialCustomizer(_params: CustomizerParams): any {
  return BY_DEFAULT;
}

function customizerToLimitMaxCopyLevel(params: CustomizerParams): any {
  const { value, level } = params;
  return level <= 2 ? BY_DEFAULT : value;
}

describe('===== clone [with customizer: simple output] =====', () => {
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

    const options: CloneOptions = {
      customizer: trivialCustomizer,
    };

    const copy = clone(original, options);

    expect(copy).to.deep.equal(original);
    expect(copy).to.not.equal(original);
  });

  it('arrays', () => {
    const original: any = [
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    original.push({ z: original });

    const options: CloneOptions = {
      customizer: trivialCustomizer,
    };

    const copy = clone(original, options);

    expect(copy).to.not.equal(original);
    expect(copy).to.deep.equal(original);
    expect(copy).to.not.equal(original);
  });

  it('object with an excluded node', () => {
    const original = {
      a: 'aa',
      b: 2,
      c: { d: [3, 4], e: { f: 7 }, r: 1 },
      g: 28,
    };

    // eslint-disable-next-line unicorn/consistent-function-scoping
    const customizer = (params: CustomizerParams): any => {
      let value;

      switch (params.key) {
        case 'e':
          value = MISSING;
          break;
        case 'g':
          value = 'gg';
          break;
        default:
          value = BY_DEFAULT;
          break;
      }

      return value;
    };

    const copy = clone(original, { customizer });

    expect(copy).to.not.equal(original);
    expect(copy.a).to.equal(original.a);
    expect(copy.b).to.equal(original.b);
    expect(copy.c.d).to.deep.equal(original.c.d);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect('e' in copy.c).to.be.false;
    expect(copy.c.r).to.equal(original.c.r);
    expect(copy.g).equal('gg');
  });

  describe('- descriptors -', () => {
    it('getter', () => {
      const original: { a: string, b?: string } = { a: 'aa' };
      Object.defineProperty(original, 'b', {
        get: () => '7',
      });

      const copy = clone(original, {
        customizer: trivialCustomizer,
        descriptors: true,
      });

      expect(copy).to.not.equal(original);
      expect(copy.b).to.equal('7');
    });

    it('setter', () => {
      const original: { a: string, b: string, c?: string } = {
        a: 'aa',
        b: 'a',
      };
      Object.defineProperty(original, 'b', {
        set: function () {
          this.c = '8';
        },
      });
      original.b = '15';

      const copy = clone(original, {
        customizer: trivialCustomizer,
        descriptors: true,
      });

      expect(copy).to.not.equal(original);
      expect(copy.c).to.equal('8');
    });

    it('getter+setter', () => {
      const original: { a: string, b?: string } = { a: 'aa' };
      Object.defineProperty(original, 'b', {
        get: () => '7',
        set: () => '8',
      });

      const copy = clone(original, {
        customizer: trivialCustomizer,
        descriptors: true,
      });

      expect(copy).to.not.equal(original);
      expect(copy.b).to.equal('7');
    });

    it('writable: false', () => {
      const original = { a: 'aa', b: 'a' };
      Object.defineProperty(original, 'b', {
        writable: false,
        value: '8',
      });

      const copy = clone(original, {
        customizer: trivialCustomizer,
        descriptors: true,
      });

      expect(copy).to.not.equal(original);
      expect(copy.b).to.equal('8');
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(Object.getOwnPropertyDescriptor(copy, 'b').writable).to.be.false;
    });

    it('writable: true', () => {
      const original = { a: 'aa', b: 'a' };
      Object.defineProperty(original, 'b', {
        writable: true,
        value: '8',
      });

      const copy = clone(original, {
        customizer: trivialCustomizer,
        descriptors: true,
      });

      expect(copy).to.not.equal(original);
      expect(copy.b).to.equal('8');
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(Object.getOwnPropertyDescriptor(copy, 'b').writable).to.be.true;
    });
  });

  it('object with a limited copy levels', () => {
    const original: any = {
      a: {
        aa: {
          aaa: 1,
          aab: {
            aaba: 72,
          },
        },
        ab: [
          {
            aba: '1',
            abb: '2',
          },
          {
            abc: 3,
            abd: { abda: 18 },
          },
        ],
        ac: {
          aca: 1,
          acb: { acba: 'leaf' },
        },
      },
      b: 33,
    };

    const copy = clone(original, {
      customizer: customizerToLimitMaxCopyLevel,
    });

    expect(copy).to.not.equal(original);
    expect(copy.a).to.deep.equal(original.a);
    expect(copy.a).to.not.equal(original.a);
    expect(copy.a?.ab).to.not.equal(original.a?.ab);
    expect(copy.a?.ab).to.deep.equal(original.a?.ab);
    expect(copy.a?.ac).to.not.equal(original.a?.ac);
    expect(copy.a?.ac).to.deep.equal(original.a?.ac);
    expect(copy.a?.ac?.acb).to.equal(original.a?.ac?.acb);
  });
});
