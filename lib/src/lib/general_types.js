"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultActionParamsDiff = exports.ProducedAsIntSet = exports.OutputTypeSet = void 0;
exports.OutputTypeSet = ['simple', 'verbose'];
exports.ProducedAsIntSet = ['keys', 'properties', 'items'];
exports.DefaultActionParamsDiff = {
    byProperties: true,
    byKeys: false,
    byValues: false,
    byArrayKeys: false,
    namesItemsToProps: false,
    namesKeysToProps: false,
    valuesFromProps: false,
    valuesFromKeys: false,
};
