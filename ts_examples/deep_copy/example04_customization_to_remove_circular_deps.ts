import { deepCopy, DCCustomizerParams, DCCustomizerReturn } from '../../src'

// Let's define a some complex object.
const original: any = {
  a: {
    aa: 1,
    ab: [{ aba: '1', abb: '2' }, { abc: 3, abd: { abda: 18 } }]
  },
  b: 33
}

// Let's mess it up by adding two cyclic dependencies.
original.c = original
original.a.ab[1].abd.abdb = original.a

// We want to replace all cyclic dependencies in the copy 
// with the string "Death to cycles!"

// To do this, we need to define a customizer function (note that the package provides service
// types to describe the parameters and return the customizer).
// This function will be called for each node of the original object.
function customizer(params: DCCustomizerParams): DCCustomizerReturn {
  // It takes one parameter: object. A full description of all fields of this object is 
  // provided in the README.
  // To solve the task, we need only one field: boolean flag "isItACycle".
  const { isItACycle } = params

  // If the node on which the customizer is called is not a cyclic dependency,
  // let the deepCopy process the data (for this we 
  // will return "{ processed: false }"), and for circular deps. we will 
  // interrupt processing, returning processed: true and the result.
  return (isItACycle)
  ? { 
      processed: true,
      result: 'Death to cycles!',
    }
  : {
      processed: false,
      result: 'If we return "processed: false", then the value will be ignored.',
    }
} 

// Get copy.
const copy = deepCopy(original, { customizer })

// Wow! The copy does not contain cycles!
console.log(JSON.stringify(copy, null, 4))
