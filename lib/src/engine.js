"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clone = void 0;
const service_1 = require("./service");
function cloneProperty(parent, child) {
    const key = child.producedBy;
    if (child.summary.cloneOptions.descriptors) {
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
const cloneKaPProcessors = {
    property: (source, child) => { cloneProperty(source, child); },
    key: (source, child) => { source.target.set(child.producedBy, child.target); },
    value: (source, child) => { source.target.add(child.target); },
    root: (_source, _child) => { throw new TypeError(`Internal error E01.`); },
};
function copyKaPInternal(params) {
    const { parentSource, parentTarget, producedBy, producedAs, value, target } = params;
    if (Object.hasOwnProperty.call(target, producedBy) && value[producedBy] === target[producedBy]) {
        return;
    }
    const child = parentSource.createChild(producedBy, producedAs, parentTarget);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    cloneInternal(child);
    if (!child.isItMissed) {
        cloneKaPProcessors[producedAs](parentSource, child);
    }
}
function copyKeysAndProperties(parentSource, children, parentTarget) {
    const value = parentSource.value;
    const target = parentSource.target;
    for (const producedAs of service_1.ProducedAsIntSet) {
        for (const producedBy of children[producedAs]) {
            copyKaPInternal({ parentSource, parentTarget, producedBy, producedAs, value, target });
        }
    }
}
function cloneInternal(source) {
    const finalOptions = source.summary.cloneOptions;
    if (finalOptions.customizer) {
        source.target = finalOptions.customizer(new service_1.CustomizerParams(source));
    }
    source.setFlags();
    source.addToSourcesToLabels();
    if (!source.isItProcessed) {
        source.createInstance();
        copyKeysAndProperties(source, source.childKeys);
    }
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
