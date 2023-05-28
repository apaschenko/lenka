"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatIsIt = void 0;
function refineDescriptorAndName(str) {
    if (!str) {
        return { descriptor: undefined, name: undefined };
    }
    let i = str[0] === '[' ? 1 : 0;
    let descriptor = '';
    let name = '';
    while (str[i] !== ' ') {
        descriptor += str[i++];
    }
    i++;
    while (![' ', '{', '(', '<', ']'].includes(str[i])) {
        name += str[i++];
    }
    return { descriptor, name: name || undefined };
}
const toLower = (str) => { var _a; return `${(_a = str === null || str === void 0 ? void 0 : str[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase()}${str === null || str === void 0 ? void 0 : str.slice(1)}`; };
const toUpper = (str) => { var _a; return `${(_a = str === null || str === void 0 ? void 0 : str[0]) === null || _a === void 0 ? void 0 : _a.toUpperCase()}${str === null || str === void 0 ? void 0 : str.slice(1)}`; };
// eslint-disable-next-line sonarjs/cognitive-complexity
function whatIsIt(wtf, options) {
    var _a;
    if (wtf === void 0) {
        return 'undefined';
    }
    if (wtf === null) {
        return 'null';
    }
    const { descriptor: descrRough, name: typeRough } = refineDescriptorAndName(Object.prototype.toString.call(wtf));
    const ctorName = (_a = wtf === null || wtf === void 0 ? void 0 : wtf.constructor) === null || _a === void 0 ? void 0 : _a.name;
    switch (typeRough.toLowerCase()) {
        case 'number':
            // eslint-disable-next-line no-case-declarations
            const ctorType = toLower(ctorName) || 'number';
            if (Number.isNaN(wtf)) {
                return (options === null || options === void 0 ? void 0 : options.nan) ? 'nan' : ctorType;
            }
            if (
            // eslint-disable-next-line unicorn/prefer-number-properties
            wtf === Infinity
                || wtf === Number.NEGATIVE_INFINITY
                || wtf === Number.POSITIVE_INFINITY) {
                return (options === null || options === void 0 ? void 0 : options.infinity) ? 'infinity' : ctorType;
            }
            return ctorType;
        case 'function':
            // eslint-disable-next-line no-case-declarations
            const { descriptor, name } = refineDescriptorAndName(wtf.toString());
            if (descriptor === 'class') {
                return name;
            }
            else if (descriptor === 'function') {
                return (name[0] === name[0].toUpperCase()) ? name : 'function';
            }
            else {
                return name;
            }
        case 'object':
            return ctorName ? toLower(ctorName) : 'object';
        default:
            // eslint-disable-next-line no-case-declarations
            const isInstance = (descrRough === null || descrRough === void 0 ? void 0 : descrRough.toLowerCase()) === 'object';
            return isInstance ? toLower(typeRough) : toUpper(typeRough);
    }
}
exports.whatIsIt = whatIsIt;
