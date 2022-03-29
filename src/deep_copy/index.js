"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
function deepCopy(original, options) {
    var internalData = {
        root: original,
        level: 0,
        processedItems: new Map()
    };
    return deepCopyInternal(original, options, internalData);
}
exports["default"] = deepCopy;
function customCopy(original, options, internalData) {
    if (internalData.processedItems.has(original)) {
        return { processed: true, result: internalData.processedItems.get(original) };
    }
    if (options.customizer) {
        return options.customizer(original, internalData.root, internalData.level);
    }
    return { processed: false, result: original };
}
function deepCopyInternal(original, options, internalData) {
    if (Array.isArray(original)) {
        var _a = customCopy(original, options, internalData), processed = _a.processed, result = _a.result;
        if (processed) {
            return result;
        }
        var copy = original.map(function (elem) { return deepCopyInternal(elem, options, __assign(__assign({}, internalData), { level: internalData.level + 1 })); });
        internalData.processedItems.set(original, copy);
        return copy;
    }
    else if (typeof original === 'object' && original !== null) {
        var _b = customCopy(original, options, internalData), processed = _b.processed, result = _b.result;
        if (processed) {
            return result;
        }
        var copy = Object.fromEntries(Object.entries(original)
            .map(function (_a) {
            var k = _a[0], v = _a[1];
            return [k, deepCopyInternal(v, options, __assign(__assign({}, internalData), { level: internalData.level + 1 }))];
        }));
        internalData.processedItems.set(original, copy);
        return copy;
    }
    else {
        return original;
    }
}
