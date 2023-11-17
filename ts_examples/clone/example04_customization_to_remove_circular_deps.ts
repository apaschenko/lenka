import { clone, LCustomizerParams, BY_DEFAULT } from '../../src';

// Let's define a some complex object.
const original: any = {
  a: {
    aa: 1,
    ab: [
      { aba: '1', abb: '2' },
      { abc: 3, abd: { abda: 18 } },
    ],
  },
  b: 33,
};

// Let's mess it up by adding two cyclic dependencies.
original.c = original;
original.a.ab[1].abd.abdb = original.a;

// We want to replace all cyclic dependencies in the copy
// with the string "Death to cycles!"

// To do this, we need to define a customizer function (note that the
// package provides service types to describe the parameters and return
// the customizer).
// This function will be called for each node of the original object.
function customizer(params: LCustomizerParams): any {
  // It takes one parameter: object. A full description of all fields
  // of this object is provided in the README.
  // To solve the task, we need only one field: boolean flag
  // "isItADouble".
  const { isItAdouble } = params;

  // If the node on which the customizer is called is not a cyclic
  // or duplicated dependency,let the deepCopy process the data (for
  // this we will return `BY_DEFAULT`), and for circular or duplicate
  // deps. we will interrupt processing and return the result.
  return isItAdouble ? 'Death to cycles!' : BY_DEFAULT;
}

// Get copy.
const copy = clone(original, { customizer });

// Wow! The copy does not contain cycles!
console.log(JSON.stringify(copy, null, 4));
