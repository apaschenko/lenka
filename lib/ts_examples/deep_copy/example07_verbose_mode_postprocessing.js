"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = require("../../src");
// Imagine that you are the director of a zoo.
// Wolves, hares and foxes live and breed in your zoo. Each animal is 
// settled in a separate single aviary or cage.
// You asked your assistant to count the number of animals of each species.
// He  conscientiously walked around the zoo, but arithmetic is too
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
                'first': 'hare',
                'second': `I don't know who it is but it's creepy!`,
                'I always forget about this aviary': 'hare',
                'damn, there are too many!': 'wolf',
            }
        },
    },
    cages: {
        'warm': 'hare',
        'skewed': '?',
        'new': 'this cage is empty',
        'cages that Alice gave us': {
            'blue': `it's definitely not an elephant`,
            'who has a holey ': `it hid and I couldn't see who it was`,
            'woodens': {
                'old': 'hare',
                'older': 'sorry, I forgot to check it',
                'oldest': 'hare',
            },
            'first time I see this cage!': 'fox',
            'I\'m too lazy to write separately for each cell': [
                'hare',
                `I don't know who it is but it bites`,
                'fox'
            ]
        },
    },
};
console.log('original: ', JSON.stringify(original, null, 4));
// Let's copy this report, and at the same time still count the animals. 
// And if we have more hares than wolves, then we will exchange all our 
// hares for beavers in the neighboring zoo.
// In order not to do the job twice, we will remember the places where each 
// of the biological species is located during copying.
// We can easily do this because the customizer receives a reference to the
// parent node of the current node and a key in the parent node on each call.
// But be careful: this is a link to the parent node of the original, not a copy!
function customizer(params) {
    // It takes one parameter: object. A full description of all fields of this object is 
    // provided in the README.
    const { value, // value of the current node
    parent, // reference to parent node (OF ORIGINAL!)
    key, // key of parent node for current node
    accumulator, // the value of this object is preserved between calls, so we will
    // remember the places of occupation here. 
     } = params;
    // we will remember places only for hares, foxes and wolves
    if (['wolf', 'fox', 'hare'].includes(value)) {
        accumulator[value].push({ parent, key });
    }
    return {
        processed: false,
    };
}
// Get copy.
const { copy, accumulator, originalToCopy } = (0, src_1.deepCopy)(original, {
    customizer,
    accumulator: { wolf: [], hare: [], fox: [] },
    mode: 'verbose',
});
// Let's check how many hares, foxes and wolves we have.
for (const [name, places] of Object.entries(accumulator)) {
    console.log(`${name}: ${places.length}`);
}
// if there were more hares than wolves, then we will exchange all hares for beavers.
const { hare, wolf } = accumulator;
if (hare.length > wolf.length) {
    // Oh, stop! We have kept the places of the hares in the ORIGINAL, but we want to
    // exchange in a COPY!
    // Don't worry. Fortunately, this is easy to do. In verbose mode, the function 
    // returns "originalToCopy" field. This is a Map whose keys are links to each of
    // the nodes of the original, and whose values are links to the corresponding 
    // nodes of the copy.
    // So, let's do it!
    for (const { parent, key } of hare) {
        const placeInCopy = originalToCopy.get(parent);
        placeInCopy[key] = 'beaver';
    }
}
console.log('copy: ', JSON.stringify(copy, null, 4));
