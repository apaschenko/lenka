
# lenka [[[version]]]<span><img alt="node-current" src="https://img.shields.io/badge/node-%3E%3D%206.4.0-green?style=plastic" align="right" /><img src="./docs/blank.png" align="right"><img src="https://img.shields.io/static/v1?label=javascript&message=es2015%20%28es6%2b%29&color=green&style=plastic" align="right"/><img src="./docs/blank.png" align="right"><img alt="typescript 3.4" src="https://img.shields.io/static/v1?label=typescript&message=%3E%3D%203.1&color=green&style=plastic" align="right" /><img src="./docs/blank.png" align="right"><img alt="coverage" src="https://img.shields.io/static/v1?label=coverage&message=[[[coverage]]]%25&color=green&style=plastic&logo=github" align="right" /></span>

A set of useful utilities:
- [**isEquals**: ] 
- [**clone**: customizable cloning of any objects or arrays with circular references](#clone)
- [**typeOf**: intuitively obvious js typeof+instanceOf with support of user-defined and platform-specific classes](#typeof)

## Prerequisites:
`javascript:` version >= es2015 (es6+) or `typescript:` version >= 3.4

For the using as node.js package: `node.js` version >= 6.4.0

## Installation
`npm install lenka`

***

## Migration from 0.2.x, 0.3.x versions
This version has many changes compared to earlier versions. Please follow this documentation.

## clone

### Motivation:
There are many out-of-the-box deep copy solutions (for example, `_.deepClone/deepCloneWith` from [Lodash](https://lodash.com/docs) package). But when trying to copy objects with circular references, they crashes with stack overflow, and their customization options are extremely limited. If the object contains duplicate references, a copy of each of these references is created instead of correctly reproducing the structure of the original object.
These shortcomings I tried to correct in `clone`.

### Features:
- ![done](./docs/check-mark-14.png) Correct copying of objects and arrays that contain cyclic references (by default, all circular references of the original will be reproduced in the copy).
- ![done](./docs/check-mark-14.png) Advanced customization ability.

### Including to your code:

**typescript:**
`import { clone } from lenka`

**javascript:**
`const { clone } = require('lenka')`

### Usage:
```typescript
const copy = clone(original [, options])
```

When `clone` invoked without options, it works just like regular deep copy utilities, with one exception:
if the original object contains circular and/or duplicate referenceses, then all these references will be correctly reproduced in the copy (of course, they will point to members of the copy, not the original).

To control the behavior of `clone`, you can pass an options object (for typescript, the Lenka package exports **CloneOptions** interface that describes the fields of this object). All fields of this object are optional.
```typescript
{
  customizer?: (params: CustomizerParams) => unknown
  accumulator?: Record<PropertyKey, any> // default is {} (empty object)
  output?: 'simple' | 'verbose'          // default is 'simple'
  descriptors?: boolean                  // default is false
}
```

`customizer` is a reference to your customizer function.
```typescript
function customizer(params: CustomizerParams) {
  // ...
}

const copy = clone(original, { customizer })
```
This customizer will be called for the each node of an original object (for each key of object, each array's and set's item, etc.).

The customizer takes one parameter: this is an object (for typescript, the Lenka package exports a service type **CustomizerParams** that describes the fields of this object).
```typescript
{
  accumulator: Record<PropertyKey, any> // Place where you can save some
                          // data between customizer calls, if necessary
                          // (see options.accumulator above).
  value: any              // Value of the current node in the original.
  parent: CustomizerParams // Reference to parent node of the original.
                          // For the root node this is null.
  root: CustomizerParams  // Link to the CustomizerParams object of the
                          // root node
  index: number           // for clone() function - always 0. Ignore it.
  level: number           // It's a level of current node: 0 for the
                          // root node, 1 for its children, etc.
  label: number           // Internal label of the current node. You
                          // can save it in accumulator and use later 
                          // for the postrocessing in the 'verbose' mode
                          // (please see "verbose mode postprocessing"
                          // example).
  producedBy: any         // Key or property name in parent node for 
                          // current node (for example, index of array 
                          // item, key of object or value of Set's item)
  producedAs: ProducedAs  // How to get current node from parent.
                          // Please see the explanation below.
  path: array             // Full path from the root to current node.
                          // Each item of this array is an object with
                          // two fields: producedBy and producedAs.
  isItADouble: boolean    // Whether the current node is a duplicate of 
                          // a link already present in the original.
  isItAPrimitive: boolean // Whether the value of the current node is 
                          // of a primitive type (number, string etc.)
  options: CloneOptions   // Options you passed to the clone() function.
}
```

**Note:** All fields of the object have read-only access. You cannot change values of these fields: <img src="[[[picURL]]]/readonly.png" height="145px;" width="596px;" alt="Read only access"/>

The customizer must return one of two things:
- If the customizer returns any value, processing of the current node is considered complete and the returned result is used as the value of that node in the copy.
- If the customizer returns a special `BY_DEFAULT` value (you should import it from the lenka package: `import {BY_DEFAULT} from 'lenka'`), it means that the customizer delegates the processing of this node to deepCopy (see [use cases](#a-few-use-cases) below).

`accumulator` this is where your setup function will store data between calls. If you don't set a value for this field, it will sets by default to an empty object.

`mode` can have one of two values: `'simple'` or `'verbose'`.
In a simple mode, `deepCopy` returns a copy of the original object.
In verbose mode, the function returns an object with three properties:
```typescript
{
  copy: any                                       // a copy of the original object
  accumulator: DCOptions['accumulator']           // resulting accumulator value
  sourceToTarget: InternalData['sourceToTarget']  // A plan whose keys are references to the nodes of the
              // original object and values of these keys are references to the corresponding nodes of the copy.
}
```

Verbose mode allows you to perform the necessary post-processing of a copy or original after copying is completed.

`descriptors`: By default, Lenka copies objects without regard to [properties descriptors](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor) to speed up work. This almost always gives the expected result. But if you want the descriptors of all properties of the copy to exactly match the original (for example, if you are copying an object that has some fields that have getters and/or setters), set this flag to true.

-----

## A few use cases
(You can find all these examples in `/src/examples` folder)

- **Typescript examples**
  - ["simple" (default) mode](#simple-default-mode)
    - [Simple usage](#t1-simple-usage)
    - [Customization to prevent redundant cloning](#t2-customization-to-prevent-redundant-cloning)
    - [Customization to limit copy levels](#t3-customization-to-limit-copy-levels)
    - [Customization to remove circular dependencies](#t4-customization-to-remove-circular-dependencies)
    - [Customization to change value of some field](#t5-customization-to-change-value-of-some-field)
  - ["verbose" mode](#verbose-mode)
    - [Using the accumulator to calculate the sum of numeric nodes](#t6-using-the-accumulator-to-calculate-the-sum-of-the-numeric-nodes-of-the-original-object)
    - [Using sourceToTarget Map for post-processing](#t7-using-an-sourceToTarget-map-for-post-processing)

### Simple (default) mode
### T.1. Simple usage
```typescript
{{{ts_examples/clone/example01_simple_usage.ts}}}
```

### T.2. Customization to prevent redundant cloning
```typescript
{{{ts_examples/clone/example02_customization-to-prevent-redundant-cloning.ts}}}
```

### T.3. Customization to limit copy levels
```typescript
{{{ts_examples/clone/example03_customization_to_limit_copy_levels.ts}}}
```

### T.4. Customization to remove circular and duplicate dependencies
```typescript
{{{ts_examples/clone/example04_customization_to_remove_circular_deps.ts}}}
```

### T.5. Customization to change value of some field
```typescript
{{{ts_examples/clone/example05_customization_to_change_the_value_of_some_field.ts}}}
```

### Verbose mode

### T.6. Using the `accumulator` to calculate the sum of the numeric nodes of the original object.
```typescript
{{{ts_examples/clone/example06_verbose_mode_total.ts}}}
```

### T.7 Using an `sourceToTarget` Map for post-processing. 
```typescript
{{{ts_examples/clone/example07_verbose_mode_postprocessing.ts}}}
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
kindOf(myNumber) // "number" (instead "extNumber")

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

Although `NaN`, `Infinity`, `Number.POSITIVE_INFINITY` and `Number.NEGATIVE_INFINITY` in Javascript refer to numbers, using them in calculations rarely gives the expected result.
For your convenience, if you specify the "`nan: true`" option, typeOf will return result for `NaN` as a separate type "nan", not a "number".
Similarly for infinities:
```typescript
typeOf(NaN)                      // "number"
typeOf(nan, { nan: true })       // "nan"
typeOf(Infinity)                 // "number"
typeOf (Infinity, { nan: true }) // "infinity"
typeOf(Number.POSITIVE_INFINITY)                     // "number"
typeOf(Number.POSITIVE_INFINITY, { infinity: true }) // "infinity"
typeOf(Number.NEGATIVE_INFINITY)                     // "number"
typeOf(Number.NEGATIVE_INFINITY, { infinity: true }) // "infinity"
```

(c) 2022
