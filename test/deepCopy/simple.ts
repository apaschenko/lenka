import { expect } from 'chai'

import { deepCopy } from '../../src'

describe('Simple objects and arrays', () => {
  it('object', () => {
    const original = {
      a: 1,
      b: [
        {
          c: 'ccc',
          d: 2 
        },
      ],
      e: {
        f: [ 3, { g: 8, i: 'iii' }],
      },
    }
  
    const copy = deepCopy(original)
  
    expect(copy).to.deep.equal(original)
    expect(copy).to.not.equal(original)
  })

  it('array', () => {
    const original = [
      {
        a: 1,
        b: [
          {
            c: 'ccc',
            d: 2 
          },
        ],
        e: {
          f: [ 3, { g: 8, i: 'iii' }],
        },
      },
      77,
      { j: 3, k: 'kkk' },
    ]
  
    const copy = deepCopy(original)
  
    expect(copy).to.deep.equal(original)
    expect(copy).to.not.equal(original)
  })
})
