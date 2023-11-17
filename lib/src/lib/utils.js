"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quotedListFromArray = void 0;
const quotedListFromArray = function (array) {
    return array.map((keyName) => { return '"' + keyName + '"'; }).join(', ');
};
exports.quotedListFromArray = quotedListFromArray;
