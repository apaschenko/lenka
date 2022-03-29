# lenka

A set of useful utilities.

At the moment it contains only one utility: `deepCopy`

## Prerequisites
NodeJS version >= v6.4.0

## Installation
`npm install lenka`

***

## deepCopy

### Motivation:
There are many out-of-the-box deep copy solutions (for example, `_.deepClone/deepCloneWith` from [Lodash](https://lodash.com/docs) package). But when trying to copy objects with circular references, they crashes with stack overflow, and their customization options are extremely limited.
These shortcomings I tried to correct in `deepCopy`.
### Features:
- ![done](./docs/icons8-check-mark-18.png) Correct copying of objects that contain cyclic references.
- ![done](./docs/icons8-check-mark-18.png) Advanced customization ability.

### Including to your code:

**typescript:**
`import { deepCopy } from lenka`

**javascript:**
`const { deepCopy } = require('lenka')`

### Usage:
```typescript
const copy = deepCopy(original)
- or -
const copy = deepCopy(original, options)
```

When `deepCopy` invoked without options, it works just like regular deep copy utilities, with one exception:
if the original object contains circular referenceses, then all these references will be correctly reproduced in the copy (of course, they will point to members of the copy, not the original).

To control the behavior of `deepCopy`, you can pass an options object (for a typescript, the Lenka package exports a service type **DCOptions** that describes the fields of this object).
```javascript
{
  customizer: (params: DCCustomizerParams) => DCCustomizerReturn
  accumulator?: any // default is {} (empty object)
  mode?: 'simple' | 'verbose' // default is 'simple'
}
```

`customizer` is a reference to your customizer function.
```typescript
function customizer(params) {
  ...
}

const copy = deepCopy(original, { customizer })
```
This customizer will be called for the each node of an original object (for each key of object, each array item and each atomic values).

The customizer takes one parameter: this is an object (for a typescript, the Lenka package exports a service type **DCCustomizerParams** that describes the fields of this object).
```typescript
{
  accumulator: object    // Place where you can save some data between customizer calls, if necessary (see options.accumulator)
  value: any             // Value of the current node in the original 
  parent: object | any[] // Reference to parent node of the original
  key: string | number   // Key of parent node for current node (index of array item or key of object) 
  root: any              // Reference to root of the original object
  level: number          // Nesting level of the current node (root level is 0)
  isItACycle: boolean    // Whether the current node is a circular dependency
}
```

The customizer should return an object with two fields (for a typescript, the Lenka package exports a service type **DCCustomizerReturn** that describes the fields of this object):
```typescript
{
  processed: boolean
  result: any
}
```

If `processed = false`, the customizer gives `deepCopy` the ability to handle the current node by default. The returned `result` value is ignored in this case.
If `processed = true`, the returned `result` value is used as value of corresponding node in the copy.

`accumulator` this is where your setup function will store data between calls. If you don't set a value for this field, it will default to an empty object.

`mode` can have one of two values: `simple` or `verbose`.
In a simple mode, `deepCopy` returns a copy of the original object.
In verbose mode, the function returns an object with three properties:
```typescript
{
  copy: any                                       // a copy of the original object
  accumulator: DCOptions['accumulator']           // resulting accumulator value
  originalToCopy: InternalData['originalToCopy']  // A plan whose keys are references to the nodes of the
              // original object and values of these keys are references to the corresponding nodes of the copy.
}
```

Verbose mode allows you to perform the necessary post-processing of a copy or original after copying is completed.

-----

## A few use cases
(You can find all these examples in `/src/examples` folder)

- **Typescript examples**
  - ["simple" (default) mode](#simple-default-mode)
    - [Simple usage](#T1-simple-usage)
    - [Copy an object with circular dependencies](#T2-copy-an-object-with-circular-dependencies)
    - [Customization to limit copy levels](#T3-customization-to-limit-copy-levels)
    - [Customization to remove circular dependencies](#T4-customization-to-remove-circular-dependencies)
    - [Customization to change value of some field](#T5-customization-to-change-value-of-some-field)
  - ["verbose" mode](#verbose-mode)

### Simple (default) mode
### T.1. Simple usage
```typescript
import { deepCopy } from 'lenka'

// Let's define a some complex object...
const original: any = {
  a: {
    aa: 1,
    ab: [
      { 
        aba: '1',
        abb: '2' 
      },
      {
        abc: 3,
        abd: {
          abda: 18,
        },
      },
    ]
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
console.log('original.a.ab[1] === copy.a.ab[1]: ', original.a.ab[1] === copy.a.ab[1]) // false
```

### T.2. Copy an object with circular dependencies
```typescript
import { deepCopy } from 'lenka'

// Let's define a some complex object.
const original: any = {
  a: {
    aa: 1,
    ab: [
      { 
        aba: '1', 
        abb: '2' 
      }, 
      { 
        abc: 3, 
        abd: { abda: 18 } 
      }
    ]
  },
  b: 33
}

// Let's mess it up by adding two cyclic dependencies...
original.c = original
original.a.ab[1].abd.abdb = original.a

// ...and copy it.
const copy = deepCopy(original)

// Let's make sure the result still contains the circular dependencies
// (we can't use JSON.stringify here because it's not supports objects with loops!)
console.log(copy)

// Cyclic dependencies in the copy are reproduced correctly, they do not point to the original. 
console.log('copy.c === original.c: ', copy.c === original.c) // false
console.log(
  'copy.a.ab[1].abd.abdb === original.a.ab[1].abd.abdb: ',
  copy.a.ab[1].abd.abdb === original.a.ab[1].abd.abdb,
) // false
```

### T.3. Customization to limit copy levels
```typescript
import { deepCopy, DCCustomizerParams, DCCustomizerReturn } from 'lenka'

// Let's take the some object:
const original: any = {
  a: {
    aa: {
      aaa: 1,
      aab: {
        aaba: 72,
      }
    },
    ab: [
      { 
        aba: '1',
        abb: '2' 
      },
      { 
        abc: 3,
        abd: { abda: 18 } 
      },
    ],
    ac: {
      aca: 1,
      acb: { acba: 'leaf' }
    }
  },
  b: 33,
}

// Let's say we want to get something between a deep and a shallow copy: let the top N levels 
// of the original be copied, while the deeper levels of nesting remain references to the nodes
// of the original object.

const MAX_LEVEL = 3

// To do this, we need to define a customizer function (note that the package provides service
// types to describe the parameters and return the customizer).
// This function will be called for each node of the original object.
function customizer(params: DCCustomizerParams): DCCustomizerReturn {
  // It takes one parameter: object. A full description of all fields of this object is 
  // provided in the README.
  // To solve the task, we need only two fields: the current nesting level and value of the
  // current original node.
  const { level, value } = params

  // For nesting levels less than the threshold, let the deepCopy process the data (for this we 
  // will return "{ processed: false }"), and when the specified depth is reached, we will 
  // interrupt processing, returning processed: true and link to the original.
  return (level < MAX_LEVEL)
  ? { 
      processed: false,
      result: 'If we return "processed: false", then the value will be ignored.',
    }
  : {
      processed: true,
      result: value,
    }
} 

// Get copy.
const copy = deepCopy(original, { customizer })

console.log('copy === original: ', copy === original) // false

// Top level items (level=0) copied
console.log('copy.a === original.a: ', copy.a === original.a) // false

// Second level (level=1) copied too.
console.log('copy.a.ab === original.a.ab: ', copy.a.ab === original.a.ab) // false
console.log('copy.a.ac === original.a.ac: ', copy.a.ac === original.a.ac) // false

// Third level didn't copied.
console.log('copy.a.ac.acb === original.a.ac.acb: ', copy.a.ac.acb === original.a.ac.acb) // true
```

### T.4. Customization to remove circular dependencies
```typescript
import { deepCopy, DCCustomizerParams, DCCustomizerReturn } from 'lenka'

// Let's define a some complex object.
const original: any = {
  a: {
    aa: 1,
    ab: [{ aba: '1', abb: '2' }, { abc: 3, abd: { abda: 18 } }]
  },
  b: 33
}

// Let's mess it up by adding two cyclic dependencies.
original.c = original
original.a.ab[1].abd.abdb = original.a

// We want to replace all cyclic dependencies in the copy 
// with the string "Death to cycles!"

// To do this, we need to define a customizer function (note that the package provides service
// types to describe the parameters and return the customizer).
// This function will be called for each node of the original object.
function customizer(params: DCCustomizerParams): DCCustomizerReturn {
  // It takes one parameter: object. A full description of all fields of this object is 
  // provided in the README.
  // To solve the task, we need only one field: boolean flag "isItACycle".
  const { isItACycle } = params

  // If the node on which the customizer is called is not a cyclic dependency,
  // let the deepCopy process the data (for this we 
  // will return "{ processed: false }"), and for circular deps. we will 
  // interrupt processing, returning processed: true and the result.
  return (isItACycle)
  ? { 
      processed: true,
      result: 'Death to cycles!',
    }
  : {
      processed: false,
      result: 'If we return "processed: false", then the value will be ignored.',
    }
} 

// Get copy.
const copy = deepCopy(original, { customizer })

// Wow! The copy does not contain cycles!
console.log(JSON.stringify(copy, null, 4))
```

### T.5. Customization to change value of some field
```typescript
import { deepCopy, DCCustomizerParams, DCCustomizerReturn } from 'lenka'

// Let's define a some object.
const original: any = {
  name: 'John',
  surname: 'Doe',
  age: 35,
  address: '-',
  timestamps: {
    createdAt: '1995-12-17T03:24:00.285Z',
    updatedAt: '2003-09-01T16:52:30.011Z',
  }
}

// Suppose that when copying an object, we want to update the "updatedAt" field
// with current data.

// To do this, we need to define a customizer function (note that the package provides service
// types to describe the parameters and return the customizer).
// This function will be called for each node of the original object.
function customizer(params: DCCustomizerParams): DCCustomizerReturn {
  // It takes one parameter: object. A full description of all fields of this object is 
  // provided in the README.
  // To solve the task, we need only one field: "key" that contains a name of the field.
  const { key } = params

  // If the node on which the customizer is not "updatedAt",
  // let the deepCopy process the data (for this we 
  // will return "{ processed: false }"), and for "updatedAt" we will 
  // interrupt processing, returning processed: true and the result.
  return (key === 'updatedAt')
  ? { 
      processed: true,
      result: new Date().toISOString(),
    }
  : {
      processed: false,
      result: 'If we return "processed: false", then the value will be ignored.',
    }
} 

// Get copy.
const copy = deepCopy(original, { customizer })

// The value of "updatedAt" has been changed.
console.log(JSON.stringify(copy, null, 4))
```

### Verbose mode

### T.6. Using the accumulator to calculate the sum of the numeric nodes of the original object.
```typescript
import { deepCopy, DCCustomizerParams, DCCustomizerReturn } from 'lenka'

// Let's say a sports coach gave us his gym inventory results as a Javascript object.
// We should copy this object (the coach won't let us keep the original).
// Let's count at the same time how many items are in the gym.
const original: any = {
  balls: 3,
  hulaHoops: 7,
  skateboards: {
    red: 2,
    yellow: 5,
    green: 3,
  },
  kettlebells: {
    '8kg': 6,
    '16kg': 4,
  },
  barbells: {
    forChildren: 2,
    forAdults: {
      new: 1,
      other: {
        rusty: 6,
        broken: 1,
      }
    }
  }
}

// To do this, we use three features of deep copying: the customizer function, the
// accumulator and the verbose mode (so that after copying we get access to the accumulator 
// in which we will accumulate the total number of items.

function customizer(params: DCCustomizerParams): DCCustomizerReturn {
  // It takes one parameter: object. A full description of all fields of this object is 
  // provided in the README.
  // To solve the task, we need two field: "accumulator" and "value".
  const { value, accumulator } = params

  // We will calculate the sum of the values of all numerical nodes
  if ('number' === typeof value) {
    accumulator.count = accumulator.count + value
  }

  return {
    processed: false,
    result: 'If we return "processed: false", the value of result will be ignored.',
  }
} 

// Get copy.
const { copy, accumulator } = deepCopy(original, { 
  customizer,
  accumulator: { count: 0 },
  mode: 'verbose',
})

console.log('copy: ', JSON.stringify(copy, null, 4))
console.log(`Total number of item: ${ accumulator.count }`) // 40
```

### T.7 Using an originalToCopy Map for post-processing. 
```typescript
import { deepCopy, DCCustomizerParams, DCCustomizerReturn } from 'lenka'

// Imagine that you are the director of a zoo.
// Wolves, hares and foxes live and breed in your zoo. Each animal is 
// settled in a separate single aviary or cage.
// You asked your assistant to count the number of animals of each species.
// He  conscientiously walked around the zoo, but arithmetic is too
// difficult for him, so he brought you this report:
const original = {
  aviaries: {
    northern: {
      'the one where the boy fell last year': 'wolf',
      'where the crocodile lived': 'fox',
    },
    western: {
      'where I would like to live': 'hare',
      'named after Monty Python': 'fox',
      'the aviaries we built on credit': {
        'first': 'hare',
        'second': `I don't know who it is but it's creepy!`,
        'I always forget about this aviary': 'hare',
        'damn, there are too many!': 'wolf',
      }
    },
  },
  cages: {
    'warm': 'hare',
    'skewed': '?',
    'new': 'this cage is empty',
    'cages that Alice gave us': {
      'blue': `it's definitely not an elephant`,
      'who has a holey ': `it hid and I couldn't see who it was`,
      'woodens': {
        'old': 'hare',
        'older': 'sorry, I forgot to check it',
        'oldest': 'hare',
      },
      'first time I see this cage!': 'fox'
    },
  },
}

console.log('original: ', JSON.stringify(original, null, 4))

// Let's copy this report, and at the same time still count the animals. 
// And if we have more hares than wolves, then we will exchange all our 
// hares for beavers in the neighboring zoo.
// In order not to do the job twice, we will remember the places where each 
// of the biological species is located during copying.
// We can easily do this because the customizer receives a reference to the
// parent node of the current node and a key in the parent node on each call.
// But be careful: this is a link to the parent node of the original, not a copy!

function customizer(params: DCCustomizerParams): DCCustomizerReturn {
  // It takes one parameter: object. A full description of all fields of this object is 
  // provided in the README.
  const { 
    value,       // value of the current node
    parent,      // reference to parent node (OF ORIGINAL!)
    key,         // key of parent node for current node
    accumulator, // the value of this object is preserved between calls, so we will
                 // remember the places of occupation here. 
  } = params


  // we will remember places only for hares, foxes and wolves
  if (['wolf', 'fox', 'hare'].includes(value)) {
    accumulator[value].push({ parent, key })
  }

  return {
    processed: false,
  }
} 

// Get copy.
const { copy, accumulator, originalToCopy } = deepCopy(original, { 
  customizer,
  accumulator: { wolf: [], hare: [], fox: [] },
  mode: 'verbose',
})

// Let's check how many hares, foxes and wolves we have.
for (const [name, places] of Object.entries(accumulator)) {
  console.log(`${name}: ${places.length}`)
}

// if there were more hares than wolves, then we will exchange all hares for beavers.
const { hare, wolf } = accumulator
if (hare.length > wolf.length) {
  // Oh, stop! We have kept the places of the hares in the ORIGINAL, but we want to
  // exchange in a COPY!
  // Don't worry. Fortunately, this is easy to do. In verbose mode, the function 
  // returns "originalToCopy" field. This is a Map whose keys are links to each of
  // the nodes of the original, and whose values are links to the corresponding 
  // nodes of the copy.
  // So, let's do it!
  for (const { parent, key } of hare) {
    const placeInCopy = originalToCopy.get(parent)
    placeInCopy[key] = 'beaver'
  }
}

console.log('copy: ', JSON.stringify(copy, null, 4))
```

(c) 2022 Licensed under the Apache License, Version 2.0.
   You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
