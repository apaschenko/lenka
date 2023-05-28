/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable prettier/prettier */
import { clone, CustParamsAccStrict, BY_DEFAULT } from '../../src';

// Imagine that you are the director of a zoo.
// Wolves, hares and foxes live and breed in your zoo. Each animal is
// settled in a separate single aviary or cage.
// You asked your assistant to count the number of animals of each
// species.
// He conscientiously walked around the zoo, but arithmetic is too
// difficult for him, so he brought you this report:
const original = {
  aviaries: {
    northern: {
      'the one where the boy fell last year': 'wolf',
      'where the crocodile lived': 'fox',
    },
    western: {
      'where I would like to live': 'hare',
      'named after Monty Python': 'fox',
      'the aviaries we built on credit': {
        first: 'hare',
        second: `I don't know who it is but it's creepy!`,
        'I always forget about this aviary': 'hare',
        'damn, there are too many!': 'wolf',
      },
    },
  },
  cages: {
    warm: 'hare',
    skewed: '?',
    new: 'this cage is empty',
    'cages that Alice gave us': {
      blue: `it's definitely not an elephant`,
      'who has a holey ': `it hid and I couldn't see who it was`,
      woodens: {
        old: 'hare',
        older: 'sorry, I forgot to check it',
        oldest: 'hare',
      },
      'first time I see this cage!': 'fox',
      "I'm too lazy to write separately for each cage": [
        'hare',
        `I don't know who it is but it bites`,
        'fox',
      ],
    },
  },
};

// Let's make sure that we have successfully replaced the hares with
// beavers both in the properties of objects and in the members of
// arrays.
console.log('original: ', JSON.stringify(original, null, 4));

// Let's copy this report, and at the same time still count the animals.
// And if we have more hares than wolves, then we will exchange all our
// hares for beavers in the neighboring zoo.
// In order not to do the job twice, we will remember the places where
// each of the biological species is located during copying.
// We can easily do this because the customizer receives a label
// of the current node.

const acc = { wolf: [], hare: [], fox: [] };

function customizer(params: CustParamsAccStrict<typeof acc>): any {
  // It takes one parameter: object. A full description of all fields
  // of this object is provided in the README.
  const {
    value,       // Value of the current node.
    accumulator, // The value of this object is preserved between calls,
                 // so we will remember the places of occupation here.
    label,       // unique label of the current node.
  } = params;

  // we will remember places only for the predefined accumulator's keys
  // ('hares', 'foxes' and 'wolves'
  if (value in accumulator) {
    accumulator[value as keyof typeof accumulator].push(label);
  }

  return BY_DEFAULT;
}

// Get copy.
const { result, accumulator, setByLabel } = clone(original, {
  customizer,
  accumulator: { wolf: [], hare: [], fox: [] },
  output: 'verbose',
});

for (const [name, places] of Object.entries(accumulator)) {
  console.log(`${name}: ${(places as number[]).length}`);
}

// if there were more hares than wolves, then we'll change all
// hares for beavers.
const { hare, wolf } = accumulator;
if (hare.length > wolf.length) {
  // So, let's do it!
  for (const label of hare) {
    setByLabel(label as number, 'beaver');
  }
}

// Let's make sure that we have successfully replaced the hares with
// beavers both in the properties of objects and in the members of
// arrays.
console.log('Result: ', JSON.stringify(result, null, 4));
