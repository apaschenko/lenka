
# lenka <span><img alt="node-current" src="https://img.shields.io/badge/node-%3E%3D%206.4.0-green?style=plastic" align="right" /><img src="./docs/blank.png" align="right"><img src="https://img.shields.io/static/v1?label=javascript&message=es2015%20%28es6%2b%29&color=green&style=plastic" align="right"/><img src="./docs/blank.png" align="right"><img alt="typescript 3.1" src="https://img.shields.io/static/v1?label=typescript&message=%3E%3D%203.1&color=green&style=plastic" align="right" /><img src="./docs/blank.png" align="right"><img alt="coverage" src="https://img.shields.io/static/v1?label=coverage&message=94.9%25&color=green&style=plastic&logo=github" align="right" /></span>

A set of useful utilities. 

At the moment it contains only two utilities: 
- [**deepCopy**: customizable cloning of any objects or arrays with circular references](#deepcopy)
- [**typeOf**: intuitively obvious js typeof+instanceOf with support of user-defined and platform-specific classes](#typeof)

## Prerequisites:
`javascript:` version >= es2015 (es6+) or `typescript:` version >= 3.1

For the using as node.js package: `node.js` version >= 6.4.0

## Installation
`npm install lenka`

***

## Migration from 0.2.x versions
The new version does not contain any breaking changes, so no action is required after the upgrade. 

## deepCopy

### Motivation:
There are many out-of-the-box deep copy solutions (for example, `_.deepClone/deepCloneWith` from [Lodash](https://lodash.com/docs) package). But when trying to copy objects with circular references, they crashes with stack overflow, and their customization options are extremely limited.
These shortcomings I tried to correct in `deepCopy`.

### Features:
- ![done](./docs/check-mark-14.png) Correct copying of objects and arrays that contain cyclic references (by default, all circular references of the original will be reproduced in the copy).
- ![done](./docs/check-mark-14.png) Advanced customization ability.

### Including to your code:

**typescript:**
`import { deepCopy } from lenka`

**javascript:**
`const { deepCopy } = require('lenka')`

### Usage:
```typescript
const copy = deepCopy(original)
// or
const copy = deepCopy(original, options)
```

When `deepCopy` invoked without options, it works just like regular deep copy utilities, with one exception:
if the original object contains circular referenceses, then all these references will be correctly reproduced in the copy (of course, they will point to members of the copy, not the original).

To control the behavior of `deepCopy`, you can pass an options object (for a typescript, the Lenka package exports a service type **DCOptions** that describes the fields of this object).
```typescript
{
  customizer: (params: DCCustomizerParams) => DCCustomizerReturn
  accumulator?: any // default is {} (empty object)
  mode?: 'simple' | 'verbose' // default is 'simple'
}
```

`customizer` is a reference to your customizer function.
```typescript
function customizer(params) {
  // ...
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
    - [Simple usage](#t1-simple-usage)
    - [Copy an object with circular dependencies](#t2-copy-an-object-with-circular-dependencies)
    - [Customization to limit copy levels](#t3-customization-to-limit-copy-levels)
    - [Customization to remove circular dependencies](#t4-customization-to-remove-circular-dependencies)
    - [Customization to change value of some field](#t5-customization-to-change-value-of-some-field)
  - ["verbose" mode](#verbose-mode)
    - [Using the accumulator to calculate the sum of numeric nodes](#t6-using-the-accumulator-to-calculate-the-sum-of-the-numeric-nodes-of-the-original-object)
    - [Using originalToCopy Map for post-processing](#t7-using-an-originaltocopy-map-for-post-processing)

### Simple (default) mode
### T.1. Simple usage
```typescript
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

```

### T.2. Copy an object with circular dependencies
```typescript
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
// (we can't use JSON.stringify here because it's not supports objects
// with loops!)
console.log(copy)

// Cyclic dependencies in the copy are reproduced correctly, they do
// not point to the original. 
console.log('copy.c === original.c: ', copy.c === original.c) // false
console.log(
  'copy.a.ab[1].abd.abdb === original.a.ab[1].abd.abdb: ',
  copy.a.ab[1].abd.abdb === original.a.ab[1].abd.abdb,
) // false

```

### T.3. Customization to limit copy levels
```typescript
import { 
  deepCopy,
  DCCustomizerParams,
  DCCustomizerReturn 
} from '../../src'

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

// Let's say we want to get something between a deep and a shallow copy:
// let the top N levels of the original be copied, while the deeper
// levels of nesting remain references to the nodes of the original
// object.

const MAX_LEVEL = 3

// To do this, we need to define a customizer function (note that the
// package provides service
// types to describe the parameters and return the customizer).
// This function will be called for each node of the original object.
function customizer(params: DCCustomizerParams): DCCustomizerReturn {
  // It takes one parameter: object. A full description of all fields
  // of this object is provided in the README.
  // To solve the task, we need only two fields: the current nesting
  // level and value of the current original node.
  const { level, value } = params

  // For nesting levels less than the threshold, let the deepCopy
  // process the data (for this we will return "{ processed: false }"),
  // and when the specified depth is reached, we will 
  // interrupt processing, returning processed: true and link to the
  // original.
  return (level < MAX_LEVEL)
  ? { 
      processed: false,
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
console.log('copy.a.ab === original.a.ab: ',
  copy.a.ab === original.a.ab) // false
console.log('copy.a.ac === original.a.ac: ',
  copy.a.ac === original.a.ac) // false

// Third level didn't copied.
console.log('copy.a.ac.acb === original.a.ac.acb: ', 
  copy.a.ac.acb === original.a.ac.acb) // true
```

### T.4. Customization to remove circular dependencies
```typescript
import {
  deepCopy,
  DCCustomizerParams,
  DCCustomizerReturn 
} from '../../src'

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

// To do this, we need to define a customizer function (note that the 
// package provides service types to describe the parameters and return
// the customizer).
// This function will be called for each node of the original object.
function customizer(params: DCCustomizerParams): DCCustomizerReturn {
  // It takes one parameter: object. A full description of all fields
  // of this object is provided in the README.
  // To solve the task, we need only one field: boolean flag 
  // "isItACycle".
  const { isItACycle } = params

  // If the node on which the customizer is called is not a cyclic 
  // dependency,let the deepCopy process the data (for this we 
  // will return "{ processed: false }"), and for circular deps. we will 
  // interrupt processing, returning processed: true and the result.
  return (isItACycle)
  ? { 
      processed: true,
      result: 'Death to cycles!',
    }
  : {
      processed: false,
    }
} 

// Get copy.
const copy = deepCopy(original, { customizer })

// Wow! The copy does not contain cycles!
console.log(JSON.stringify(copy, null, 4))

```

### T.5. Customization to change value of some field
```typescript
import { 
  deepCopy,
  DCCustomizerParams,
  DCCustomizerReturn
} from '../../src'

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

// Suppose that when copying an object, we want to update the
// "updatedAt" field with current data.

// To do this, we need to define a customizer function (note that the 
// package provides service types to describe the parameters and return
// the customizer).
// This function will be called for each node of the original object.
function customizer(params: DCCustomizerParams): DCCustomizerReturn {
  // It takes one parameter: object. A full description of all fields 
  // of this object is provided in the README.

  // To solve the task, we need only one field: "key" that contains
  // a name of the field.
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
import { 
  deepCopy,
  DCCustomizerParams,
  DCCustomizerReturn
} from '../../src'

// Let's say a sports coach gave us his gym inventory results as 
// a Javascript object.
// We should copy this object (the coach won't let us keep the original)
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

// To do this, we use three features of deep copying: the customizer
// function, the accumulator and the verbose mode (so that after copying
// we get access to the accumulator in which we will accumulate the
// total number of items.

function customizer(params: DCCustomizerParams): DCCustomizerReturn {
  // It takes one parameter: object. A full description of all fields
  // of this object is provided in the README.

  // To solve the task, we need two field: "accumulator" and "value".
  const { value, accumulator } = params

  // We will calculate the sum of the values of all numerical nodes
  if ('number' === typeof value) {
    accumulator.count = accumulator.count + value
  }

  return {
    processed: false,
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
import {
  deepCopy,
  DCCustomizerParams,
  DCCustomizerReturn 
} from '../../src'

// Imagine that you are the director of a zoo.
// Wolves, hares and foxes live and breed in your zoo. Each animal is 
// settled in a separate single aviary or cage.
// You asked your assistant to count the number of animals of each 
// species.
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
      'first time I see this cage!': 'fox',
      'I\'m too lazy to write separately for each cage': [
        'hare',
      `I don't know who it is but it bites`,
      'fox'
      ] 
    },
  },
}

// Let's make sure that we have successfully replaced the hares with 
// beavers both in the properties of objects and in the members of 
// arrays.
console.log('original: ', JSON.stringify(original, null, 4))

// Let's copy this report, and at the same time still count the animals. 
// And if we have more hares than wolves, then we will exchange all our 
// hares for beavers in the neighboring zoo.
// In order not to do the job twice, we will remember the places where
// each of the biological species is located during copying.
// We can easily do this because the customizer receives a reference to
// the parent node of the current node and a key in the parent node on
// each call.
// But be careful: this is a link to the parent node of the original,
// not a copy!

function customizer(params: DCCustomizerParams): DCCustomizerReturn {
  // It takes one parameter: object. A full description of all fields
  // of this object is provided in the README.
  const { 
    value,       // Value of the current node.
    parent,      // Reference to parent node (OF ORIGINAL!).
    key,         // Key of parent node for current node.
    accumulator, // The value of this object is preserved between calls,
                 // so we will remember the places of occupation here. 
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

// if there were more hares than wolves, then we will exchange all
// hares for beavers.
const { hare, wolf } = accumulator
if (hare.length > wolf.length) {
  // Oh, stop! We have kept the places of the hares in the ORIGINAL,
  // but we want to exchange in a COPY!
  // Don't worry. Fortunately, this is easy to do. In verbose mode,
  // the function returns "originalToCopy" field. This is a Map whose
  // keys are links to each of the nodes of the original, and whose
  // values are links to the corresponding nodes of the copy.

  // So, let's do it!
  for (const { parent, key } of hare) {
    const placeInCopy = originalToCopy.get(parent)
    placeInCopy[key] = 'beaver'
  }
}

// Let's make sure that we have successfully replaced the hares with 
// beavers both in the properties of objects and in the members of 
// arrays.
console.log('copy: ', JSON.stringify(copy, null, 4))

```

## typeOf

### Motivation
The built-in `typeof` javascript operator does not work satisfactorily because it has remained unchanged from the earliest versions of the language.
There are many alternative solutions, but they all have serious drawbacks: Almost all of them do not work well with user-defined classes, as well as platform-specific classes (for example, Node.js classes).
Let's take for example one of the most popular solutions - [kind-of](https://www.npmjs.com/package/kind-of):
```typescript
import kindOf from 'kind-of'
import EventEmitter from 'events' // NodeJS-specific class

// The instance of build-in class:
const myWeakMap = new WeakMap

// User-defined class...
class ExtNumber extends Number {
  say1(): { return 1 }
}

// ... and instance of this class:
const myNumber = new ExtNumber()

const myEmitter = new EventEmitter()

// Yes, it's a right result.
kindOf(myWeakMap) // "weakmap"

// And first failure: kind-of doesn't show the classes itself:
// even for standard javascript classes.
// It goes without saying that when we pass a class, we expect to see 
// its name. That its constructor is a function is obvious without 
// kind-of calling
kindOf(WeakMap) // "function" (instead "WeakMap")

// Well, since it does not know how to work with classes, then perhaps 
// it will at least show the type of the instance correctly? 
// Oops, no again.
kindOf(myNumber) // "number" (instead "ExtNumber")

// Failed again: an async function and a (synchronous) function are two
// different things. 
kindOf(async function myAsyncFunction() {}) // "function"

// And things are really bad for platform-specific classes and their 
// instances:
kindOf(myEmitter) // "object"
```

So, my expectations from a correct utility of this type:
- when we pass a class constructor function to it, it should return not "function", but the name of the class with a capital letter.
- When we pass an instance of ANY class (standard or platform-specific) to it, it should return the name of the class starting with a small letter.
- It goes without saying that primitive types should also be supported.

### Including to your code:

**typescript:**
`import { typeOf } from lenka`

**javascript:**
`const { typeOf } = require('lenka')`

### Usage:
```typescript
const type = typeOf(anyData)
// or
const copy = typeOf(anyData, options)
```
The second parameter can be passed to the function is an options. 
At the moment there are only two of them and they indicate how they 
should be processed NaN and Infinities ([see below](#typeof-options)).

### Examples of the typeOf() output:
```typescript
import { typeOf } from lenka
import EventEmitter from 'events'

class MyClass {
  a() { return 1 }
}

class MyClassExt extends Number {
 toMyNumber() { return 7 }
}

const constMyClass = MyClass

typeOf(WeakMap)                                 // "WeakMap"
typeOf(new WeakMap())                           // "weakMap"
typeOf(new Set())                               // "set"
typeOf({ a: 1, b: 2})                           // "object"
typeOf(new Object(null))                        // "object"
typeOf(function myFunction(a) { return a })     // "function"
typeOf(MyClass)                                 // "MyClass"
typeOf(new MyClass())                           // "myClass"
typeOf(MyClassExt)                              // "MyClassExt"
typeOf(new MyClassExt())                        // "myClassExt"
typeOf(constMyClass)                            // "MyClass"
typeOf(EventEmitter)                            // "EventEmitter"
typeOf(new EventEmitter())                      // "eventEmitter"
typeOf(async function myAsyncFunction() {})     // "asyncFunction"
typeOf(function* myGenerator() { yield 1 })     // "generatorFunction"
typeOf([1, 2, 3])                               // "array"
typeOf(/.*.a/g)                                 // "regExp"
typeOf(Number)                                  // "Number"
typeOf(Number(1))                               // "number"
typeOf(7)                                       // "number"
typeOf('www')                                   // "string"
typeOf(null)                                    // "null"
typeOf(undefined)                               // "undefined"
typeOf(void 0)                                  // "undefined"
typeOf(true)                                    // "boolean"
typeOf(Symbol('unic'))                          // "symbol"
typeOf(Promise)                                 // "Promise"
typeOf(new Promise((resolve) => { resolve(1)})) // "promise"
// etc.
```

### typeOf options
```typescript
{
  nan?: boolean      // default is false
  infinity?: boolean // default is false
}
```

Although `NaN`, `Number.POSITIVE_INFINITY` and `Number.NEGATIVE_INFINITY` in Javascript refer to numbers, using them in calculations rarely gives the expected result.
For your convenience, if you specify the "`nan: true`" option, typeOf will return result for `NaN` as a separate type "nan", not a "number".
Similarly for infinities:
```typescript
typeOf(NaN)                // "number"
typeof(nan, { nan: true }) // "nan"

typeOf(Number.POSITIVE_INFINITY)                     // "number"
typeof(Number.POSITIVE_INFINITY, { infinity: true }) // "+infinity"
typeof(Number.NEGATIVE_INFINITY)                     // "number"
typeof(Number.NEGATIVE_INFINITY, { infinity: true }) // "-infinity"
```

(c) 2022
