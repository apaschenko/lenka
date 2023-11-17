"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredefinedActorsSet = exports.PredefActCoverSet = void 0;
const piece_types_1 = require("./piece_types");
exports.PredefActCoverSet = [
    ...piece_types_1.CollectionsSet, ...piece_types_1.PrimitiveTypesSet, 'collection', 'primitive', 'vocabulary', 'keyholder', 'all', '*'
];
exports.PredefinedActorsSet = ['replace', 'merge', 'diff'];
