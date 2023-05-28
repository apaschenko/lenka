// import { clone, CustParamsAccSoft, CustParamsAccStrict, CustomizerParams, BY_DEFAULT } from '../src';

// const commons = {
//   c: 'cc',
//   d: 'dd'
// }

// const a = [
//   { b0: commons },
//   { c0: commons },
//   { d0: commons }
// ];


// const b =

// {
//   '0': { b0: 1 },
//   '1': { b1: 2 },
//   '2': { c1: 3 }
// }

// const acc = { a, summ: 0 };





// clone(a)




// function customizer(params: CustomizerParams): any {
//   params.accumulator.someKey = 'a'; // it will work
//   params.accumulator = 'b'; // this will result in an error!

//   return BY_DEFAULT;
// }

// function customizerStrict(params: CustParamsAccStrict<typeof acc>): any {
//   const { accumulator } = params;


 

  
//   accumulator.missingKey2 = 'some value';
//   accumulator.summ++;

//   return BY_DEFAULT;
// }


// // Get copy.
// const original = { qq: 'ww'}
// const { result, accumulator, setByLabel } = clone(original, {
//   customizer,
//   accumulator: { wolf: [], hare: [], fox: [] },
//   output: 'verbose',
// });

// for (const [name, places] of Object.entries(accumulator)) {
//   console.log(`${name}: ${(places as number[]).length}`);
// }
// const rerr = clone(original, {
//   customizerStrict,
//   accumulator: { wolf: [], hare: [], fox: [] },
//   output: 'verbose',
// });
// // if there were more hares than wolves, then we'll change all
// // hares for beavers.
// const { hare, wolf } = accumulator;
// if (hare.length > wolf.length) {
//   // So, let's do it!
//   for (const label of hare) {
//     setByLabel(label as number, 'beaver');
//   }
// }

// // Let's make sure that we have successfully replaced the hares with
// // beavers both in the properties of objects and in the members of
// // arrays.
// console.log('Result: ', JSON.stringify(result, null, 4));
