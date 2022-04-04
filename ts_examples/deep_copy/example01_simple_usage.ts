import { deepCopy } from '../../src'

// Let's define a some complex object...
const original: any = {
  a: {
    aa: 1,
    ab: [{ aba: '1', abb: '2' }, { abc: 3, abd: { abda: 18 } }]
  },
  b: 33
}

// ...and copy it.
const copy = deepCopy(original)

// Let's make sure the result looks the same as the original,..
console.log('copy: ', JSON.stringify(copy, null, 4), '\n')

// ...that the utility actually made a copy,..
console.log('copy === original: ', copy === original) // false

// ...and that it's not a shallow copy.
console.log(
  'original.a.ab[1] === copy.a.ab[1]: ',
  original.a.ab[1] === copy.a.ab[1]
) // false
