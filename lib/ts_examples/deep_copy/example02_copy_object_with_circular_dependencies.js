"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../src");
// Let's define a some complex object.
const original = {
    a: {
        aa: 1,
        ab: [{ aba: '1', abb: '2' }, { abc: 3, abd: { abda: 18 } }]
    },
    b: 33
};
// Let's mess it up by adding two cyclic dependencies...
original.c = original;
original.a.ab[1].abd.abdb = original.a;
// ...and copy it.
const copy = (0, src_1.deepCopy)(original);
// Let's make sure the result still contains the circular dependencies
// (we can't use JSON.stringify here because it's not supports objects with loops!)
console.log(copy);
// Cyclic dependencies in the copy are reproduced correctly, they do not point to the original. 
console.log('copy.c === original.c: ', copy.c === original.c); // false
console.log('copy.a.ab[1].abd.abdb === original.a.ab[1].abd.abdb: ', copy.a.ab[1].abd.abdb === original.a.ab[1].abd.abdb); // false
