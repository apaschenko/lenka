"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.combine = exports.clone = exports.LResults = exports.MISSING = exports.BY_DEFAULT = void 0;
const summary_1 = require("./lib/summary");
const combine_params_1 = require("./lib/combine_params");
const general_types_1 = require("./lib/general_types");
const results_1 = require("./lib/results");
Object.defineProperty(exports, "LResults", { enumerable: true, get: function () { return results_1.LResults; } });
var symbols_1 = require("./lib/symbols");
Object.defineProperty(exports, "BY_DEFAULT", { enumerable: true, get: function () { return symbols_1.BY_DEFAULT; } });
Object.defineProperty(exports, "MISSING", { enumerable: true, get: function () { return symbols_1.MISSING; } });
function copyKeysAndProperties(parentNode, children, parentTarget) {
    const value = parentNode.value;
    const target = parentNode.target;
    for (const producedAs of general_types_1.ProducedAsIntSet) {
        for (const producedBy of children[producedAs].values()) {
            if (!(Object.hasOwnProperty.call(target, producedBy) && value[producedBy] === target[producedBy])) {
                const child = parentNode.createChild(producedBy, producedAs, parentTarget);
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                cloneInternal(child);
                if (!child.isItMissed) {
                    child.linkTargetToParent();
                }
            }
        }
    }
}
function cloneInternal(node) {
    const finalOptions = node.summary.finalCloneOptions;
    if (finalOptions.customizer) {
        node.target = finalOptions.customizer(node.customizerParams);
    }
    node.setFlags();
    node.addToNodesToLabels();
    if (!node.isItProcessed) {
        node.createInstance();
        copyKeysAndProperties(node, node.childrenKeys);
    }
}
function combineInternal(summary, nodes) {
    const actions = summary.finalCombineOptions.actions;
    const combineParams = new combine_params_1.CombineParams(summary, nodes);
    actions.every((action) => { return action.tryToRun(combineParams); });
    combineParams.postCheck();
    for (const keyType of general_types_1.ProducedAsIntSet) {
        for (const childrenByKey of combineParams.result[keyType].values()) {
            const childNodes = childrenByKey.map((child) => {
                return combineParams._createChild(child);
            });
            switch (childNodes.length) {
                case 1:
                    cloneInternal(childNodes[0]);
                    childNodes[0].linkTargetToParent();
                    break;
                case 2:
                    combineInternal(summary, childNodes);
                    break;
                default:
                    throw new TypeError('E02: Internal error');
            }
        }
        ;
    }
}
function clone(original, rawOptions) {
    const summary = new summary_1.Summary([original], 'clone', rawOptions);
    const node = summary.selectedRoot;
    cloneInternal(node);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return summary.buildResult();
}
exports.clone = clone;
function combine(firstSource, secondSource, rawOptions) {
    const summary = new summary_1.Summary([firstSource, secondSource], 'combine', rawOptions);
    combineInternal(summary, summary.roots);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return summary.buildResult();
}
exports.combine = combine;
