"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../src");
// Let's take the some object:
const original = {
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
};
// Let's say we want to get something between a deep and a shallow copy: let the top N levels 
// of the original be copied, while the deeper levels of nesting remain references to the nodes
// of the original object.
const MAX_LEVEL = 3;
// To do this, we need to define a customizer function (note that the package provides service
// types to describe the parameters and return the customizer).
// This function will be called for each node of the original object.
function customizer(params) {
    // It takes one parameter: object. A full description of all fields of this object is 
    // provided in the README.
    // To solve the task, we need only two fields: the current nesting level and value of the
    // current original node.
    const { level, value } = params;
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
        };
}
// Get copy.
const copy = (0, src_1.deepCopy)(original, { customizer });
console.log('copy === original: ', copy === original); // false
// Top level items (level=0) copied
console.log('copy.a === original.a: ', copy.a === original.a); // false
// Second level (level=1) copied too.
console.log('copy.a.ab === original.a.ab: ', copy.a.ab === original.a.ab); // false
console.log('copy.a.ac === original.a.ac: ', copy.a.ac === original.a.ac); // false
// Third level didn't copied.
console.log('copy.a.ac.acb === original.a.ac.acb: ', copy.a.ac.acb === original.a.ac.acb); // true
