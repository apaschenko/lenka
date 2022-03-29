"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../src");
// Let's say a sports coach gave us his gym inventory results as a Javascript object.
// We should copy this object (the coach won't let us keep the original).
// Let's count at the same time how many items are in the gym.
const original = {
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
};
// To do this, we use three features of deep copying: the customizer function, the
// accumulator and the verbose mode (so that after copying we get access to the accumulator 
// in which we will accumulate the total number of items.
function customizer(params) {
    // It takes one parameter: object. A full description of all fields of this object is 
    // provided in the README.
    // To solve the task, we need two field: "accumulator" and "value".
    const { value, accumulator } = params;
    // We will calculate the sum of the values of all numerical nodes
    if ('number' === typeof value) {
        accumulator.count = accumulator.count + value;
    }
    return {
        processed: false,
        result: 'If we return "processed: false", the value of result will be ignored.',
    };
}
// Get copy.
const { copy, accumulator } = (0, src_1.deepCopy)(original, {
    customizer,
    accumulator: { count: 0 },
    mode: 'verbose',
});
console.log('copy: ', JSON.stringify(copy, null, 4));
console.log(`Total number of item: ${accumulator.count}`); // 40
