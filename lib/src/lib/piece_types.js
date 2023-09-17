"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = exports.Vocabulary = exports.CollectionsSet = exports.VocabulariesSet = exports.ReducedObjTypesSet = exports.PrimitiveTypesSet = void 0;
exports.PrimitiveTypesSet = [
    'boolean',
    'undefined',
    'symbol',
    'string',
    'number',
    'bigint',
    'null',
];
exports.ReducedObjTypesSet = [
    'date',
    'regexp',
    'function',
    'dataview',
    'arraybuffer',
];
exports.VocabulariesSet = ['array', 'map', 'object'];
exports.CollectionsSet = [...exports.VocabulariesSet, 'set']; // Yes, all the vocabularies are collections too.
exports.Vocabulary = 'vocabulary';
exports.Collection = 'collection';
