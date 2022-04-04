import { expect } from 'chai'
import EventEmitter from 'events'

import { typeOf } from '../../src'

class MyClass {
  a() { return 1 }
}

class MyClassExt extends Number {
 toMyNumber() { return 7 }
}

const constMyClass = MyClass
const constMyClassInstance = new MyClass()
const constMyClassExt = MyClassExt
const constMyClassExtInstance = new MyClassExt()

const fixtures = [
  { value: WeakMap, type: 'WeakMap' },
  { value: new WeakMap(), type: 'weakMap' },
  { value: new WeakSet(), type: 'weakSet' },
  { value: new Map(), type: 'map' },
  { value: new Set(), type: 'set' },
  { value: { a: 1, b: 2}, type: 'object' },
  { value: new Object(null), type: 'object' },
  { value: function myFunction(a) { return a }, type: 'function' },
  { value: MyClass, type: 'MyClass' },
  { value: new MyClass(), type: 'myClass' },
  { value: MyClassExt, type: 'MyClassExt' },
  { value: new MyClassExt(), type: 'myClassExt' },
  { value: constMyClass, type: 'MyClass' },
  { value: constMyClassInstance, type: 'myClass' },
  { value: constMyClassExt, type: 'MyClassExt' },
  { value: constMyClassExtInstance, type: 'myClassExt' },
  { value: EventEmitter, type: 'EventEmitter' },
  { value: new EventEmitter(), type: 'eventEmitter' },
  { value: async function myAsyncFunction() {}, type: 'asyncFunction' },
  { value: function* myGenerator() { yield 1 }, type: 'generatorFunction' },
  { value: [1, 2, 3], type: 'array' },
  { value: /.*.a/g, type: 'regExp' },
  { value: Number, type: 'Number' },
  { value: 1, type: 'number' },
  { value: Number(1), type: 'number' },
  { value: 'www', type: 'string' },
  { value: String('eee'), type: 'string' },
  { value: NaN, type: ['number', 'nan', 'number', 'nan'] },
  { value: Number.POSITIVE_INFINITY, type: ['number', 'number', '+infinity', '+infinity'] },
  { value: Number.NEGATIVE_INFINITY, type: ['number', 'number', '-infinity', '-infinity'] },
  { value: ArrayBuffer, type: 'ArrayBuffer' },
  { value: new ArrayBuffer(8), type: 'arrayBuffer' },
  { value: null, type: 'null' },
  { value: undefined, type: 'undefined' },
  { value: void 0, type: 'undefined' },
  { value: Symbol(), type: 'symbol' },
  { value: true, type: 'boolean' },
  { value: Promise, type: 'Promise' },
  { value: new Promise((resolve) => { resolve(1)}), type: 'promise' }
]

describe('whatIsIt', function() {
  for (const item of fixtures) {
    for (let i = 0; i < 4; i++) {
      it('test', function() {
        expect(
          typeOf(item.value, { nan: i%2 ? true : false, infinity: i > 1 }))
          .to.equal(Array.isArray(item.type) ? item.type[i] : item.type)
      })
    }
  }
})
