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
There are many out-of-the-box deep copy solutions (for example, `_.deepClone/deepCloneWith` from [Lodash](https://lodash.com/docs) package). But when trying to copy objects with circular dependencies, they crashes with stack overflow, and their customization options are extremely limited.
These shortcomings I tried to correct in `deepCopy`.
### Features:
- ![done](./docs/icons8-check-mark-18.png) Correct copying of objects that contain cyclic dependencies.
- ![done](./docs/icons8-check-mark-18.png) Advanced customization ability.

### Including to your code:

**typescript:**
`import { deepCopy } from lenka`

**javascript:**
`const { deepCopy } = require('lenka')`

### Usage:
```
const copy = deepCopy(original)
- or -
const copy = deepCopy(original, options)
```

When `deepCopy` invoked without options, it works just like regular deep copy utilities, with one exception:
if the original object contains circular dependencies, then all these dependencies will be correctly reproduced in the copy (of course, they will point to members of the copy, not the original).

To control the behavior of `deepCopy`, you can pass an options object.
Currently this object only includes one field (`customizer`) which should be a reference to your customization function:
```
function customizer(params) {
  ...
}

const copy = deepCopy(original, { customizer })
```
This customizer will be called for the each node of an original object (for each key of object, each array item and each atomic values).

The customizer takes one parameter: this is an object (for a typescript, the Lenka package exports a service type **DCCustomizerParams** that describes the fields of this object).
```
{
  accumulator: {}        // An object where you can save some data between customizer calls, if necessary. 
  value: any             // value of the current node in the original 
  parent: object | any[] // reference to parent node of the original
  key: string | number   // key of parent node for cureent node (index of array item or key of object) 
  root: any              // reference to root of the original object
  level: number          // Nesting level of the current node (root level is 0)
  isItACycle: boolean    // Whether the current node is a circular dependency
}
```

The customizer shoul return an object with two fields (for a typescript, the Lenka package exports a service type **DCCustomizerReturn** that describes the fields of this object):
```
{
  processed: boolean
  result: any
}
```

If `processed = false`, the customizer gives `deepCopy` the ability to handle the current node by default. The returned `result` value is ignored in this case.
If `processed = true`, the returned `result` value is used as value of corresponding node in the copy.

## A few use cases
(You can find all these examples in `/src/examples` folder):

### 1. Simple usage
```
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
console.log('original.a.ab[1] === copy.a.ab[1]: ', original.a.ab[1] === copy.a.ab[1]) // false
```

### 2. Copy an object with circular dependencies
```
import { deepCopy } from '../../src'

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

3. Customization to limit copy levels
```
import { deepCopy, DCCustomizerParams, DCCustomizerReturn } from '../../src'

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

4. Customization to remove circular dependencies
```
import { deepCopy, DCCustomizerParams, DCCustomizerReturn } from '../../src'

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

5. Customization to change value of some field
```
import { deepCopy, DCCustomizerParams, DCCustomizerReturn } from '../../src'

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

(c) 2022 All right reserved
