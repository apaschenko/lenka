import { expect } from 'chai'

import { isItTheSameAs } from '../../src'

class MyArray extends Array {
  size() { return this.length }
}

class MyNumberExt extends Number {
  d: 6
}

class MySet extends Set {
  constructor(params: any[]) {
    super(params)
    this.m = 3
  }

  m: number
}

class MyMap extends Map {}

const someObject = { a: 1, b: 3, c: [4, 5] }
const copyObject = { a: 1, b: 3, c: [4, 5] }
const someArray = ['a', { b: [1, 2]}, 3]
const copyArray = ['a', { b: [1, 2]}, 3]

const fixtures = [
  { number: 1, descr: 'primitive type', original: 7, toCompare: 7, expect: [ true, true, true, true ] },
  { number: 2, descr: 'primitive number with Number', original: 1, toCompare: Number(1), expect: [ true, true, true, true ] },
  // eslint-disable-next-line unicorn/new-for-builtins
  { number: 3, descr: 'class and its subclass', original: new Number(9), toCompare: new MyNumberExt(9), expect: [ true, true, false, false ] },
  { number: 4, descr: 'equals objects', original: { a: 1, b: [2, { c: 3, d: 4 }] }, toCompare: { a: 1, b: [2, { c: 3, d: 4 }] }, expect: [ true, true, true, true ] },
  { number: 5, descr: 'objects with different nested value', original: { a: 1, b: [2, { c: 3, d: 5 }] }, toCompare: { a: 1, b: [2, { c: 3, d: 4 }] }, expect: [ false, false, false, false ] },
  // eslint-disable-next-line unicorn/no-new-array
  { number: 6, descr: 'array and custom array type', original: new Array(2), toCompare: new MyArray(2), expect: [ true, true, false, false ] },
  { number: 7, descr: 'arrays with diff. length', original: [1, 2, 3], toCompare: [1, 2, 3, 4], expect: [ false, false, false, false ] },
  { number: 8, descr: 'objects with diff. number of properties', original: { a: 1, b: 2 }, toCompare: { a: 1, b: 2, c: null }, expect: [ false, false, false, false ] },
  { number: 9, descr: 'the same array', original: someArray, toCompare: someArray, expect: [ true, true, true, true ] },
  { number: 10, descr: 'the same object', original: someObject, toCompare: someObject, expect: [ true, true, true, true ] },
  // eslint-disable-next-line unicorn/new-for-builtins
  { number: 11, descr: 'objects with diff. nested property classes', original: { a: new Number(1), b: [2, { c: 3, d: 4 }] }, toCompare: { a: new MyNumberExt(1), b: [2, { c: 3, d: 4 }] }, expect: [ true, true, false, false ] },
  { number: 12, descr: 'objects with diff. configurable property of nested field', original: someObject, toCompare: Object.defineProperty({ ...copyObject }, 'a', { writable: true, enumerable: true, configurable: false }), expect: [true, true, true, false] },
  { number: 13, descr: 'objects with diff. enumerable property of nested field', original: someObject, toCompare: Object.defineProperty({ ...copyObject }, 'a', { writable: true, enumerable: false, configurable: true }), expect: [true, true, true, false] },
  { number: 14, descr: 'objects with diff. writable property of nested field', original: someObject, toCompare: Object.defineProperty({ ...copyObject }, 'a', { writable: false, enumerable: true, configurable: true }), expect: [true, true, true, false] },
  { number: 15, descr: 'objects with diff. get property of nested field', original: someObject, toCompare: Object.defineProperty({ ...copyObject }, 'a', { get: () => 1, enumerable: true, configurable: true }), expect: [true, true, true, false] },
  { number: 16, descr: 'objects with diff. freeze', original: someObject, toCompare: Object.freeze({ ...copyObject }), expect: [true, true, true, false] },
  { number: 17, descr: 'objects with diff. extentialble', original: someObject, toCompare: Object.preventExtensions({ ...copyObject }), expect: [true, true, true, false] },
  { number: 18, descr: 'objects wit diff. sealing', original: someArray, toCompare: Object.seal([ ...copyArray ]), expect: [true, true, true, false] },
  { number: 19, descr: 'arrays with diff. freeze', original: someArray, toCompare: Object.freeze([ ...copyArray ]), expect: [true, true, true, false] },
  { number: 20, descr: 'arrays with diff. extentialble', original: someArray, toCompare: Object.preventExtensions([ ...copyArray ]), expect: [true, true, true, false] },
  { number: 21, descr: 'equals sets', original: new Set([1, 2, 3]), toCompare: new Set([1, 2, 3]), expect: [true, true, true, true] },
  { number: 22, descr: 'different sets', original: new Set([1, 2, 3]), toCompare: new Set([1, 2, 4]), expect: [false, false, false, false] },
  { number: 23, descr: 'set and custom class', original: new Set([5, 6, 7]), toCompare: new MySet([5, 6, 7]), expect: [true, true, false, false]},
  { number: 24, descr: 'equals maps', original: new Map([[1, 'one'], [2, 'two']]), toCompare: new Map([[1, 'one'], [2, 'two']]), expect: [true, true, true, true] },
  { number: 25, descr: 'maps with diff. keys', original: new Map([[1, 'one'], [2, 'two']]), toCompare: new Map([[1, 'one'], [3, 'two']]), expect: [false, false, false, false] },
  { number: 26, descr: 'maps with diff. values', original: new Map([[1, 'one'], [2, 'two']]), toCompare: new Map([[1, 'one'], [2, 'five']]), expect: [false, false, false, false] },
  { number: 27, descr: 'map and custom class', original: new Map(), toCompare: new MyMap(), expect: [true, true, false, false] },
  { number: 28, descr: 'map and object', original: new Map([[1, 'one'], [2, 'two']]), toCompare: { 1: 'one', 2: 'two' }, expect: [false, false, false, false] },
  { number: 29, descr: 'equals typed arrays', original: new Int16Array([1, 2]), toCompare: new Int16Array([1, 2]), expect: [true, true, true, true] },
  { number: 30, descr: 'typed array with diff. length', original: new Int16Array([1, 2]), toCompare: new Int16Array([1, 2, 3]), expect: [false, false, false, false] },
  { number: 31, descr: 'typed arrays with diff. values', original: new Int16Array([1, 2]), toCompare: new Int16Array([1, 3]), expect: [false, false, false, false] },
  { number: 32, descr: 'equals functions', original: function() { return 2; }, toCompare: function() { return 2; }, expect: [true, true, true, true] },
  { number: 33, descr: 'different functions', original: function(a) { return a; }, toCompare: function(b) { return b; }, expect: [false, false, false, false] },
  { number: 34, descr: 'equals functions as array\'s member', original: [function() { return 2; }], toCompare: [function() { return 2; }], expect: [true, true, true, true] },
  { number: 35, descr: 'different functions as array\'s member', original: [function(a) { return a; }], toCompare: [function(b) { return b; }], expect: [false, false, false, false] },
  { number: 36, descr: 'equals functions as object\'s field', original: { a: function() { return 2; } }, toCompare: { a: function() { return 2; } }, expect: [true, true, true, true] },
  { number: 37, descr: 'different functions as object\'s field', original: { a: function(a) { return a; } }, toCompare: { a: function(b) { return b; } }, expect: [false, false, false, false] },
]

const modes = ['soft', 'moderate', 'strict', 'draconian'] as const;

describe('====== isItTheSameAs ======', function() {
  for (const [indexMode, mode] of modes.entries()) {
    // eslint-disable-next-line @typescript-eslint/no-loop-func
    describe(`--- ${mode} mode ---`, function() {
      for (const item of fixtures) {
        it(`${mode} test ${item.number}: ${item.descr}`, function () {
          expect(
            isItTheSameAs(item.original, item.toCompare, { mode })
          )
          .to
          .equal(item.expect[indexMode])
        })
      }}
    )
  }

  it(`--- invalid mode setting ---`, function() {
    try {
      isItTheSameAs(1, 2, { mode: 'invalid' as 'soft' })
      expect('test failed').is.equal(false)
    } catch (error) {
      expect(error).to.be.an('error')
    }
  })
})

