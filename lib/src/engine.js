"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clone = void 0;
const service_1 = require("./service");
function customCopy(source) {
    const finalOptions = source.summary.finalOptions;
    if (finalOptions.customizer) {
        source.target = finalOptions.customizer(new service_1.CustomizerParams(source));
    }
    source.setFlags();
    source.addToSourcesToLabels();
}
function createAndRegister(source, params = []) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const target = Reflect.construct(source.value.constructor, params);
    source.target = target;
}
function copyProperty(parent, child) {
    const key = child.producedBy;
    if (child.summary.finalOptions.descriptors) {
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
    for (const { producedBy, producedAs } of source.childrenPartial) {
        if (Object.hasOwnProperty.call(target, producedBy) && value[producedBy] === target[producedBy]) {
            continue;
        }
        const child = source.createChild(producedBy, producedAs);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        root(child);
        if (!child.isItMissed) {
            switch (producedAs) {
                case 'property':
                    copyProperty(source, child);
                    break;
                case 'key':
                    source.target.set(producedBy, child.target);
                    break;
                case 'value':
                    source.target.add(child.target);
                    break;
            }
        }
    }
}
function root(source) {
    customCopy(source);
    if (source.isItProcessed) {
        return;
    }
    switch (source.type) {
        case 'array':
            createAndRegister(source, [source.value.length]);
            break;
        case 'arraybuffer':
            if (typeof source.value.slice === 'function') {
                // eslint-disable-next-line unicorn/prefer-spread
                source.target = source.value.slice(0);
            }
            else {
                const originalUnit8Array = new Uint8Array(source.value);
                createAndRegister(source, [originalUnit8Array.length]);
                const copyUnit8Array = new Uint8Array(source.target);
                for (const [index, value] of originalUnit8Array.entries()) {
                    copyUnit8Array[index] = value;
                }
            }
            break;
        case 'date':
            createAndRegister(source, [+source.value]);
            break;
        case 'dataview':
            createAndRegister(source, [source.value.buffer]);
            break;
        case 'regexp':
            createAndRegister(source, [source.value.source, source.value.flags]);
            break;
        default:
            createAndRegister(source);
            break;
    }
    copyKeysAndProperties(source);
}
function clone(original, rawOptions) {
    const summary = new service_1.Summary([original], rawOptions);
    const source = summary.roots[0];
    root(source);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (rawOptions === null || rawOptions === void 0 ? void 0 : rawOptions.output) === 'verbose'
        ? summary.setAndGetResult(source.target)
        : source.target;
}
exports.clone = clone;
