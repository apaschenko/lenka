import { expect } from 'chai';

import { clone } from '../../../src';

class MyObject extends Object {
  kkk: number;

  add: number;

  constructor(value, add) {
    super(value);
    this.kkk = 8;
    this.add = add;
  }
}

describe('===== clone [without customizer] =====', () => {
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
      },
    };

    const copy = clone(original);

    expect(copy).to.deep.equal(original);
    expect(copy).to.not.equal(original);
  });

  it('array', () => {
    const original = [
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

    const copy = clone(original);

    expect(copy).to.deep.equal(original);
    expect(copy).to.not.equal(original);
  });

  it('object with circular dependencies', () => {
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

    const copy = clone(original);

    expect(copy).to.deep.equal(original);
    expect(copy).to.not.equal(original);
  });

  it('array with circular dependencies', () => {
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

    const copy = clone(original);

    expect(copy).to.deep.equal(original);
    expect(copy).to.not.equal(original);
  });

  it('object as a custom class instance', () => {
    const original = new MyObject(
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
      28
    );

    const copy = clone(original);

    expect(copy).to.deep.equal(original);
    expect(copy).to.not.equal(original);
    expect(copy.kkk).to.deep.equal(original.kkk);
    expect(copy.add).to.equal(28);
  });

  it('map', () => {
    class MyMap extends Map {
      kkk: any;

      lll: any;
    }

    const key = ['key-1', 7, { a: 8, b: '9' }];
    const original = new MyMap();
    const a = [1, 2, 3];
    const b = { ba: 11, bb: 22, bc: '33', bd: { bda: 1, bdb: 2 } };
    original.set('a', a);
    original.set('b', b);
    original.set('c', undefined);
    original.set('d', 1);
    original.set(key, null);

    original.kkk = original;
    original.lll = original.get('b');
    const copy: MyMap = clone(original);

    expect(copy).to.deep.equal(original);
    expect(copy).to.not.equal(original);
    for (const [origKey, origValue] of original.entries()) {
      expect(copy.get(origKey)).to.deep.equal(origValue);
    }
    expect(copy.size).to.equal(original.size);
    expect(copy.kkk).to.deep.equal(original);
    expect(copy.lll).to.deep.equal(b);
  });

  it('set', () => {
    const original = new Set([1, 3, { a: 2, b: [5, 6] }, ['a', 3, 8]]);
    const copy: Set<any> = clone(original);

    expect(copy).to.not.equal(original);
    expect(copy.size).to.equal(original.size);
    const originalValues = [...original];
    const copyValues = [...copy];
    for (const [origIndex, origValue] of originalValues.entries()) {
      expect(copyValues[origIndex]).to.deep.equal(origValue);
    }
  });

  it('arraybuffer (slice function is presents)', () => {
    const content = [1, 0, 3, 25];
    const original = new ArrayBuffer(content.length);
    const originalView = new DataView(original);
    for (const [index, value] of content.entries()) {
      originalView.setUint8(index, value);
    }

    const copy: ArrayBuffer = clone(original);

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(copy instanceof ArrayBuffer).to.be.true;
    expect(copy).to.not.equal(original);
    expect(copy.byteLength).to.equal(original.byteLength);
    const copyView = new DataView(copy);
    for (const [index, value] of content.entries()) {
      expect(copyView.getUint8(index)).to.equal(value);
    }
  });

  it('arraybuffer (slice function is absend)', () => {
    class ABWithoutSlice extends ArrayBuffer {
      constructor(byteLength: number) {
        super(byteLength);
        this.slice = undefined;
      }

      slice: undefined;
    }

    const content = [1, 0, 3, 25];
    const original = new ABWithoutSlice(content.length);
    const originalView = new DataView(original);
    for (const [index, value] of content.entries()) {
      originalView.setUint8(index, value);
    }

    const copy: ArrayBuffer = clone(original);

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(copy instanceof ArrayBuffer).to.be.true;
    expect(copy).to.not.equal(original);
    expect(copy.byteLength).to.equal(original.byteLength);
    const copyView = new DataView(copy);
    for (const [index, value] of content.entries()) {
      expect(copyView.getUint8(index)).to.equal(value);
    }
  });

  it('date', () => {
    const original = new Date();
    const copy: Date = clone(original);

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(copy instanceof Date).to.be.true;
    expect(copy).to.not.equal(original);
    expect(copy.getTime()).to.equal(original.getTime());
  });

  it('dataview', () => {
    const buffer = new ArrayBuffer(8);
    const original = new DataView(buffer);
    for (let i = 0; i < buffer.byteLength; i++) {
      original.setInt8(i, i + 5);
    }

    const copy = clone(original);

    expect(copy).to.not.equal(original);
    expect(copy.buffer).to.equal(original.buffer);
  });

  it('regexp', () => {
    const original = /a.*b/gi;
    const copy: RegExp = clone(original);

    expect(copy).to.not.equal(original);
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(copy instanceof RegExp).to.be.true;
    expect(copy.flags).to.be.deep.equal(original.flags);
    expect(copy.source).to.be.equal(original.source);
  });
});
