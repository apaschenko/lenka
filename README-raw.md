
# lenka <span><img alt="node-current" src="https://img.shields.io/badge/node-%3E%3D%206.4.0-green?style=plastic" align="right" /><img src="./docs/blank.png" align="right"><img src="https://img.shields.io/static/v1?label=javascript&message=es2015%20%28es6%2b%29&color=green&style=plastic" align="right"/><img src="./docs/blank.png" align="right"><img alt="typescript 3.1" src="https://img.shields.io/static/v1?label=typescript&message=%3E%3D%203.1&color=green&style=plastic" align="right" /><img src="./docs/blank.png" align="right"><img alt="coverage" src="https://img.shields.io/static/v1?label=coverage&message=[[[coverage]]]%25&color=green&style=plastic&logo=github" align="right" /></span>

A set of useful utilities. 

At the moment it contains only two utilities: 
- [deepCopy](#deepcopy)
- [typeOf](#typeof)

## Prerequisites:
`javascript:` version >= es2015 (es6+) or `typescript:` version >= 3.1

For the using as node.js package: `node.js` version >= 6.4.0

## Installation
`npm install lenka`

***

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
{{{ts_examples/deep_copy/example01_simple_usage.ts}}}
```

### T.2. Copy an object with circular dependencies
```typescript
{{{ts_examples/deep_copy/example02_copy_object_with_circular_dependencies.ts}}}
```

### T.3. Customization to limit copy levels
```typescript
{{{ts_examples/deep_copy/example03_customization_to_limit_copy_levels.ts}}}
```

### T.4. Customization to remove circular dependencies
```typescript
{{{ts_examples/deep_copy/example04_customization_to_remove_circular_deps.ts}}}
```

### T.5. Customization to change value of some field
```typescript
{{{ts_examples/deep_copy/example05_customization_to_change_the_value_of_some_field.ts}}}
```

### Verbose mode

### T.6. Using the accumulator to calculate the sum of the numeric nodes of the original object.
```typescript
{{{ts_examples/deep_copy/example06_verbose_mode_total.ts}}}
```

### T.7 Using an originalToCopy Map for post-processing. 
```typescript
{{{ts_examples/deep_copy/example07_verbose_mode_postprocessing.ts}}}
```

## typeOf

### Motivation
The built-in javascript operator does not work satisfactorily because it has remained unchanged from the earliest versions of the language.
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
  nan?: boolean     // default is false
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
