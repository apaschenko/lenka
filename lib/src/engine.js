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
    property: (node, child) => { cloneProperty(node, child); },
    key: (node, child) => { node.target.set(child.producedBy, child.target); },
    value: (node, child) => { node.target.add(child.target); },
    root: (_node, _child) => { throw new TypeError(`Internal error E01.`); },
};
function copyKaPInternal(params) {
    const { parentNode, parentTarget, producedBy, producedAs, value, target } = params;
    if (Object.hasOwnProperty.call(target, producedBy) && value[producedBy] === target[producedBy]) {
        return;
    }
    const child = parentNode.createChild(producedBy, producedAs, parentTarget);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    cloneInternal(child);
    if (!child.isItMissed) {
        cloneKaPProcessors[producedAs](parentNode, child);
    }
}
function copyKeysAndProperties(parentNode, children, parentTarget) {
    const value = parentNode.value;
    const target = parentNode.target;
    for (const producedAs of service_1.ProducedAsIntSet) {
        for (const producedBy of children[producedAs]) {
            copyKaPInternal({ parentNode, parentTarget, producedBy, producedAs, value, target });
        }
    }
}
function cloneInternal(node) {
    const finalOptions = node.summary.cloneOptions;
    if (finalOptions.customizer) {
        node.target = finalOptions.customizer(new service_1.CustomizerParams(node));
    }
    node.setFlags();
    node.addToNodesToLabels();
    if (!node.isItProcessed) {
        node.createInstance();
        copyKeysAndProperties(node, node.childKeys);
    }
}
function clone(original, rawOptions) {
    const summary = new service_1.Summary([original], 'clone', rawOptions);
    const node = summary.roots[0];
    cloneInternal(node);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return (rawOptions === null || rawOptions === void 0 ? void 0 : rawOptions.output) === 'verbose'
        ? summary.setAndGetResult(node.target)
        : node.target;
}
exports.clone = clone;
// export function combine<OPT extends RawCombineOptions>(
//   originals: node['value'][],
//   rawOptions?: OPT,
// ): CombineReturnType<OPT> {
//   if (!Array.isArray(originals)) {
//     throw new TypeError('First argument of combine() must be an array of originals.');
//   }
//   const summary = new Summary(originals, 'combine', rawOptions);
// }
