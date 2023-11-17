import { clone, LCustomizerParams, BY_DEFAULT } from '../../src';

// Let's define a some object.
const original: any = {
  name: 'John',
  surname: 'Doe',
  age: 35,
  address: '-',
  timestamps: {
    createdAt: '1995-12-17T03:24:00.285Z',
    updatedAt: '2003-09-01T16:52:30.011Z',
  },
};

// Suppose that when copying an object, we want to update the
// "updatedAt" field with current data.

// To do this, we need to define a customizer function (note that the
// package provides service types to describe the parameters and return
// the customizer).
// This function will be called for each node of the original object.
function customizer(params: LCustomizerParams): any {
  // It takes one parameter: object. A full description of all fields
  // of this object is provided in the README.

  // To solve the task, we need only one field: "producedBy" that
  // contains a name of the field.
  const { key } = params;

  // If the node on which the customizer is not "updatedAt",
  // let the deepCopy process the data (for this we
  // will return `BY_DEFAULT`), and for "updatedAt" we will
  // interrupt processing, returning the result.

  // eslint-disable-next-line prettier/prettier
  return key === 'updatedAt'
    ? new Date().toISOString()
    : BY_DEFAULT;
}

// Get copy.
const copy = clone(original, { customizer });

// The value of "updatedAt" has been changed.
console.log(JSON.stringify(copy, null, 4));
