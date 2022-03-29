"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../src");
const original = {
    a: {
        aa: 1,
        ab: [{ aba: '1', abb: '2' }, { abc: 3, abd: { abda: 18 } }]
    },
    b: 33
};
original.c = original;
original.a.ab[1].abd.abdb = original.a.ab;
const copy = (0, src_1.deepCopy)(original);
console.log(copy);
console.log('\noriginal.c === copy.c: ', original.c === copy.c);
console.log('copy.c === copy: ', copy.c === copy);
function customizer(params) {
    const { isItACycle, value, accumulator } = params;
    if (isItACycle) {
        if (accumulator.counter) {
            accumulator.counter++;
        }
        else {
            accumulator.counter = 1;
        }
        return {
            processed: true,
            result: `${accumulator.counter}: Death to cyclic dependencies!`,
        };
    }
    else {
        return {
            processed: false,
            result: value,
        };
    }
}
const copy2 = (0, src_1.deepCopy)(original, { customizer });
console.log(JSON.stringify(copy2, null, 4));
