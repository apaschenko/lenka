"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isItTheSameAs = void 0;
// eslint-disable-next-line prettier/prettier
const modes = ['soft', 'moderate', 'strict', 'draconian'];
function objectPropertiesCheck(original, toCompare, modeIndex) {
    return modeIndex > 2 // if 'draconian'
        ? Object.isExtensible(original) === Object.isExtensible(toCompare)
            && Object.isFrozen(original) === Object.isFrozen(toCompare)
            && Object.isSealed(original) === Object.isSealed(toCompare)
        : true;
}
function isDescriptorsDifferent(first, second) {
    var _a, _b, _c, _d;
    return first.enumerable !== second.enumerable
        || first.writable !== second.writable
        || first.configurable !== second.configurable
        || first.get !== second.get && ((_a = first.get) === null || _a === void 0 ? void 0 : _a.toString()) !== ((_b = second.get) === null || _b === void 0 ? void 0 : _b.toString())
        || first.set !== second.set && ((_c = first.set) === null || _c === void 0 ? void 0 : _c.toString()) === ((_d = second.set) === null || _d === void 0 ? void 0 : _d.toString());
}
// eslint-disable-next-line sonarjs/cognitive-complexity
function sameInternal(original, toCompare, options, processedNodes) {
    if ((options === null || options === void 0 ? void 0 : options.mode) && !modes.includes(options.mode)) {
        throw new Error(`Unknown mode: "${options.mode}". Valid values are ${modes.map((item) => '"' + item + '"').join(', ')}`);
    }
    const modeIndex = modes.indexOf(options.mode);
    if (original instanceof Set) {
        if (!(toCompare instanceof Set) || modeIndex > 1 && original.constructor !== toCompare.constructor) {
            return false;
        }
        return sameInternal([...original], [...toCompare], options, processedNodes);
    }
    if (original instanceof Map) {
        if (!(toCompare instanceof Map)
            || modeIndex > 1 && original.constructor !== toCompare.constructor
            || original.size !== toCompare.size) {
            return false;
        }
        for (const [key, value] of original.entries()) {
            if (!sameInternal(value, toCompare.get(key), options, processedNodes)) {
                return false;
            }
        }
        return true;
    }
    if (Array.isArray(original) && Array.isArray(toCompare)) {
        if (original === toCompare || processedNodes.includes(original)) {
            return true;
        }
        processedNodes.push(original);
        if (modeIndex > 1 && original.constructor !== toCompare.constructor) {
            return false;
        }
        if (original.length !== toCompare.length) {
            return false;
        }
        for (const [index, origItem] of original.entries()) {
            if (!sameInternal(origItem, toCompare[index], options, processedNodes)) {
                return false;
            }
        }
        return objectPropertiesCheck(original, toCompare, modeIndex);
    }
    if (typeof original === 'object' && typeof toCompare === 'object') {
        if (original === toCompare || processedNodes.includes(original)) {
            return true;
        }
        processedNodes.push(original);
        if (modeIndex > 1 && original.constructor !== toCompare.constructor) {
            return false;
        }
        const origKeys = Reflect.ownKeys(original);
        const toCompKeys = Reflect.ownKeys(toCompare);
        if (origKeys.length !== toCompKeys.length) {
            return false;
        }
        for (const keyName of origKeys) {
            if (modeIndex === 3 && isDescriptorsDifferent(Object.getOwnPropertyDescriptor(original, keyName), Object.getOwnPropertyDescriptor(toCompare, keyName))) {
                return false;
            }
            if (!sameInternal(original[keyName], toCompare[keyName], options, processedNodes)) {
                return false;
            }
        }
        return objectPropertiesCheck(original, toCompare, modeIndex);
    }
    if (typeof original === 'function' && typeof toCompare === 'function') {
        return original === toCompare || original.toString() === toCompare.toString();
    }
    return modeIndex > 0 ? original === toCompare : original == toCompare;
}
function isItTheSameAs(original, toCompare, options) {
    return sameInternal(original, toCompare, options || { mode: 'moderate' }, []);
}
exports.isItTheSameAs = isItTheSameAs;
