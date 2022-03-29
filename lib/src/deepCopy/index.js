"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepCopy = void 0;
const deepCopy = (original, options) => {
    const internalData = {
        root: original,
        originalItems: [],
        processedObjects: new Map(),
        circulars: [],
        customizerData: {}
    };
    const result = deepCopyInternal(original, internalData, 0, original, 0, options);
    const { processedObjects, circulars } = internalData;
    for (const { parentOriginalObject, parentKey, original } of circulars) {
        const parentCopyObject = processedObjects.get(parentOriginalObject);
        parentCopyObject[parentKey] = processedObjects.get(original);
    }
    return result;
};
exports.deepCopy = deepCopy;
function customCopy(params) {
    const { original, internalData, level, parentOriginalObject, parentKey, isItObject, options, } = params;
    const { originalItems, circulars } = internalData;
    if (isItObject) {
        originalItems.push(original);
    }
    let isItACycle = false;
    if (isItObject && originalItems.indexOf(original) !== originalItems.length - 1) {
        isItACycle = true;
    }
    if (options === null || options === void 0 ? void 0 : options.customizer) {
        const maybeCustomized = options.customizer({
            accumulator: internalData.customizerData,
            value: original,
            parent: parentOriginalObject,
            key: parentKey,
            root: internalData.root,
            level,
            isItACycle,
        });
        if (maybeCustomized.processed) {
            return maybeCustomized;
        }
    }
    if (isItACycle) {
        circulars.push({ parentOriginalObject, parentKey, original });
        return { processed: true, result: null };
    }
    return { processed: false, result: original };
}
function deepCopyInternal(original, internalData, level, parentOriginalObject, parentKey, options) {
    if (Array.isArray(original)) {
        const { processed, result } = customCopy({
            original,
            internalData,
            level,
            parentOriginalObject,
            parentKey,
            isItObject: true,
            options,
        });
        if (processed) {
            return result;
        }
        const copy = original.map((item, key) => deepCopyInternal(item, internalData, level + 1, original, key, options));
        internalData.processedObjects.set(original, copy);
        return copy;
    }
    else if (typeof original === 'object' && original !== null) {
        const { processed, result } = customCopy({
            original,
            internalData,
            level,
            parentOriginalObject,
            parentKey,
            isItObject: true,
            options,
        });
        if (processed) {
            return result;
        }
        const copy = Object.entries(original).reduce((acc, item) => {
            const [key, value] = item;
            acc[key] = deepCopyInternal(value, internalData, level + 1, original, key, options);
            return acc;
        }, {});
        internalData.processedObjects.set(original, copy);
        return copy;
    }
    else {
        const { processed, result } = customCopy({
            original,
            internalData,
            level,
            parentOriginalObject,
            parentKey,
            isItObject: true,
            options,
        });
        return processed ? result : original;
    }
}
