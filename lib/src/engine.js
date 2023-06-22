"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clone = void 0;
const service_1 = require("./service");
function cloneTryToCustomize(source) {
    const finalOptions = source.summary.finalCloneOptions;
    if (finalOptions.customizer) {
        source.target = finalOptions.customizer(new service_1.CustomizerParams(source));
    }
    source.setFlags();
    source.addToSourcesToLabels();
}
function createInstance(source, params = []) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const target = Reflect.construct(source.value.constructor, params);
    source.target = target;
}
function copyProperty(parent, child) {
    const key = child.producedBy;
    if (child.summary.finalCloneOptions.descriptors) {
        // eslint-disable-next-line prettier/prettier
        const descr = Object.getOwnPropertyDescriptor(parent.value, key);
        if (!(descr.get || descr.set)) {
            descr.value = child.target;
        }
        Object.defineProperty(parent.target, key, Object.assign({}, descr));
    }
    else {
        parent.target[key] = child.target;
    }
}
function copyKeysAndProperties(source) {
    const value = source.value;
    const target = source.target;
    for (const child of source.children) {
        if (Object.hasOwnProperty.call(target, child.producedBy) &&
            value[child.producedBy] === target[child.producedBy]) {
            continue;
        }
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        cloneInternal(child);
        if (!child.isItMissed) {
            switch (child.producedAs) {
                case 'property':
                    copyProperty(source, child);
                    break;
                case 'key':
                    source.target.set(child.producedBy, child.target);
                    break;
                case 'value':
                    source.target.add(child.target);
                    break;
            }
        }
    }
}
function cloneInternal(source) {
    cloneTryToCustomize(source);
    if (source.isItProcessed) {
        return;
    }
    switch (source.type) {
        case 'array':
            createInstance(source, [source.value.length]);
            break;
        case 'arraybuffer':
            if (typeof source.value.slice === 'function') {
                // eslint-disable-next-line unicorn/prefer-spread
                source.target = source.value.slice(0);
            }
            else {
                const originalUnit8Array = new Uint8Array(source.value);
                createInstance(source, [originalUnit8Array.length]);
                const copyUnit8Array = new Uint8Array(source.target);
                for (const [index, value] of originalUnit8Array.entries()) {
                    copyUnit8Array[index] = value;
                }
            }
            break;
        case 'date':
            createInstance(source, [+source.value]);
            break;
        case 'dataview':
            createInstance(source, [source.value.buffer]);
            break;
        case 'regexp':
            createInstance(source, [source.value.source, source.value.flags]);
            break;
        default:
            createInstance(source);
            break;
    }
    copyKeysAndProperties(source);
}
function clone(original, rawOptions) {
    const summary = new service_1.Summary([original], 'clone', rawOptions);
    const source = summary.roots[0];
    cloneInternal(source);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (rawOptions === null || rawOptions === void 0 ? void 0 : rawOptions.output) === 'verbose'
        ? summary.setAndGetResult(source.target)
        : source.target;
}
exports.clone = clone;
// export function combine<OPT extends RawCombineOptions>(
//   originals: Source['value'][],
//   rawOptions?: OPT,
// ): CombineReturnType<OPT> {
//   if (!Array.isArray(originals)) {
//     throw new TypeError('First argument of combine() must be an array of originals.');
//   }
//   const summary = new Summary(originals, 'combine', rawOptions);
// }
