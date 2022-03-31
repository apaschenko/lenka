import { expect } from 'chai'

import { deepCopy, DCCustomizerParams, DCCustomizerReturn, DCOptions } from '../../src'

describe('deepCopy with customizer', () => {
  function customizer(params: DCCustomizerParams): DCCustomizerReturn {
    return { processed: false }
  }

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
  
    original.b['bb'] = original

    const options: DCOptions = {
      customizer,
    }

    const copy = deepCopy(original, options)

    expect(copy).to.deep.equal(original)
    expect(copy).to.not.equal(original)
  })

  it('array', () => {
    const original: any = [
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

    original.push({ z: original })

    const options: DCOptions = {
      customizer,
    }

    const copy = deepCopy(original, options)
  
    expect(copy).to.deep.equal(original)
    expect(copy).to.not.equal(original)
  })
})
