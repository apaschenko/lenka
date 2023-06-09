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
function copyProperties(source, restrictedProperties) {
    const value = source.value;
    const target = source.target;
    for (const key of Reflect.ownKeys(value)) {
        if (restrictedProperties.includes(key)
            || Object.hasOwnProperty.call(target, key) && value[key] === target[key]) {
            continue;
        }
        const child = source.createChild(key, 'property');
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        root(child);
        if (!child.isItMissed) {
            copyProperty(source, child);
        }
    }
}
function cloneSet(source) {
    createAndRegister(source);
    for (const parentKey of source.value.values()) {
        const child = source.createChild(parentKey, 'value');
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        root(child);
        if (child.target !== service_1.MISSING) {
            source.target.add(child.target);
        }
    }
}
function cloneMap(source) {
    createAndRegister(source);
    for (const parentKey of source.value.keys()) {
        const child = source.createChild(parentKey, 'key');
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        root(child);
        if (child.target !== service_1.MISSING) {
            source.target.set(parentKey, child.target);
        }
    }
}
function cloneArrayBuffer(source) {
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
}
function root(source) {
    customCopy(source);
    if (source.isItProcessed) {
        return;
    }
    const restrictedProperties = [];
    switch (source.type) {
        case 'object':
            createAndRegister(source);
            break;
        case 'array':
            createAndRegister(source, [source.value.length]);
            restrictedProperties.push('length');
            break;
        case 'set':
            cloneSet(source);
            break;
        case 'map':
            cloneMap(source);
            break;
        case 'arraybuffer':
            cloneArrayBuffer(source);
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
    }
    copyProperties(source, restrictedProperties);
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
