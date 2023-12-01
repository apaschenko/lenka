"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Summary = void 0;
const results_1 = require("./results");
const node_1 = require("./node");
const action_1 = require("./action");
const general_types_1 = require("./general_types");
const symbols_1 = require("./symbols");
const utils_1 = require("./utils");
const DefaultCloneOptions = {
    accumulator: {},
    customizer: null,
    creator: null,
    output: 'simple',
    descriptors: false,
};
const DefaultCombineOptions = Object.assign(Object.assign({}, DefaultCloneOptions), { actions: [] });
class Summary {
    constructor(rawData, operation, rawOptions) {
        this._valuesToLabels = new Map();
        this._allNodes = new Map();
        this._roots = [];
        this._label = 0;
        this._operation = operation;
        this._rawOptions = rawOptions || {};
        this._finalOptions = this.validateAndBuildOptions(operation, rawOptions);
        this.initRoots(rawData);
    }
    addToAllNodes(node) {
        node.label = this.getAndIncreaceLabel();
        this._allNodes.set(node.label, node);
    }
    addToNodesToLabels(node) {
        if (!(this._valuesToLabels.has(node.value)
            || node.isItAPrimitive
            || node.isItMissed)) {
            this._valuesToLabels.set(node.value, node.label);
        }
    }
    hasValue(rawData) {
        return this._valuesToLabels.has(rawData);
    }
    buildResult() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this._finalOptions.output === 'simple'
            ? this._selectedRoot.target
            : new results_1.LResults(this);
    }
    getAndIncreaceLabel() {
        return this._label++;
    }
    setByLabel(label, rawData) {
        const node = this.getNodeByLabel(label);
        if (node.producedAs === 'root') {
            throw new TypeError("You can't change a root node value (the cloning or combine result entirely) with" +
                " setByLabel method! Instead, use new value directly in your code.");
        }
        const { target } = node.parentTarget;
        switch (node.producedAs) {
            case 'keys':
                target.set(node.producedBy, rawData);
                break;
            case 'properties':
                target[node.producedBy] = rawData;
                break;
            case 'items':
                if (Array.isArray(target)) {
                    target[node.producedBy] = rawData;
                }
                else {
                    target.delete(node.target);
                    target.add(rawData);
                }
                break;
        }
        node.target = rawData;
    }
    deleteByLabel(label) {
        const node = this.getNodeByLabel(label);
        if (node.producedAs === 'root') {
            throw new TypeError("You can't delete a root node (the cloning or combine result entirely)!");
        }
        const { target } = node.parentTarget;
        switch (node.producedAs) {
            case 'keys':
                target.delete(node.producedBy);
                break;
            case 'properties':
                delete target[node.producedBy];
                break;
            case 'items':
                if (Array.isArray(target)) {
                    delete target[node.producedBy];
                }
                else {
                    target.delete(node.target);
                }
                break;
        }
        node.target = symbols_1.MISSING;
    }
    createTargetInstance(node) {
        switch (node.type) {
            case 'array':
                this.constructInstance(node, [node.value.length]);
                break;
            case 'arraybuffer':
                if (typeof node.value.slice === 'function') {
                    // eslint-disable-next-line unicorn/prefer-spread
                    node.target = node.value.slice(0);
                }
                else {
                    const originalUnit8Array = new Uint8Array(node.value);
                    this.constructInstance(node, [originalUnit8Array.length]);
                    const copyUnit8Array = new Uint8Array(node.target);
                    for (const [index, value] of originalUnit8Array.entries()) {
                        copyUnit8Array[index] = value;
                    }
                }
                break;
            case 'date':
                this.constructInstance(node, [+node.value]);
                break;
            case 'dataview':
                this.constructInstance(node, [node.value.buffer]);
                break;
            case 'regexp':
                this.constructInstance(node, [node.value.source, node.value.flags]);
                break;
            default:
                this.constructInstance(node);
                break;
        }
    }
    get accumulator() {
        return this._finalOptions.accumulator;
    }
    get result() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this._selectedRoot.target;
    }
    get selectedRoot() {
        return this._selectedRoot;
    }
    selectRootByIndex(index) {
        this._selectedRoot = this._roots[index];
        return this._selectedRoot;
    }
    get rawCloneOptions() {
        return this._rawOptions;
    }
    get rawCombineOptions() {
        return this._rawOptions;
    }
    get finalCloneOptions() {
        return this._finalOptions;
    }
    get finalCombineOptions() {
        return this._finalOptions;
    }
    get roots() {
        return this._roots;
    }
    constructInstance(node, params = []) {
        const { summary: { finalCloneOptions }, isItAPrimitive, value, customizerParams } = node;
        const result = finalCloneOptions.creator ? finalCloneOptions.creator(customizerParams) : symbols_1.BY_DEFAULT;
        if (result === symbols_1.BY_DEFAULT) {
            node.target = isItAPrimitive ? value : Reflect.construct(value.constructor, params);
        }
        else {
            node.target = result;
        }
    }
    // eslint-disable-next-line sonarjs/cognitive-complexity
    validateAndBuildOptions(operation, rawOptions = {}) {
        const optionsType = typeof rawOptions;
        if (!['undefined', 'object'].includes(optionsType)) {
            throw new TypeError(`The ${operation}() options must be an object.`);
        }
        const finalOptions = operation === 'clone' ? Object.assign({}, DefaultCloneOptions) : Object.assign({}, DefaultCombineOptions);
        for (const [optionName, optionValue] of Object.entries(rawOptions)) {
            switch (optionName) {
                case 'accumulator':
                    if (typeof optionValue !== 'object') {
                        throw new TypeError(`The optional ${operation}() option "accumulator" must not be a primitive type.`);
                    }
                    finalOptions.accumulator = optionValue;
                    break;
                case 'descriptors':
                    if (typeof optionValue !== 'boolean') {
                        throw new TypeError(`The optional ${operation}() option "descriptors" must be a boolean.`);
                    }
                    finalOptions.descriptors = optionValue;
                    break;
                case 'output':
                    if (!general_types_1.OutputTypeSet.includes(optionValue)) {
                        throw new TypeError(`Invalid value of the optional ${operation}() option "output". ` +
                            `Possible values are ${(0, utils_1.quotedListFromArray)(general_types_1.OutputTypeSet)}.`);
                    }
                    finalOptions.output = optionValue;
                    break;
                case 'customizer':
                case 'creator':
                    if (typeof optionValue !== 'function') {
                        throw new TypeError(`If optional ${operation}() option "${optionName}" is present, it must be a function.`);
                    }
                    finalOptions[optionName] = optionValue;
                    break;
                default:
                    if (optionName === 'actions' && operation === 'combine') {
                        if (!Array.isArray(optionValue)) {
                            throw new TypeError(`If optional ${operation}() option "actions" is present, it must be an array.`);
                        }
                        finalOptions.actions = optionValue.map((rawAction, index) => {
                            return new action_1.FinalAction(rawAction, index);
                        });
                    }
                    else {
                        throw new TypeError(`Unknown ${operation}() "${optionName}" option. Valid options are ${(0, utils_1.quotedListFromArray)(Object.keys(operation === 'clone' ? DefaultCloneOptions : DefaultCombineOptions))}.`);
                    }
            }
        }
        if (operation === 'combine') {
            finalOptions.actions.push(new action_1.FinalAction({ coverage: 'all', actor: 'merge' }, -1));
        }
        return finalOptions;
    }
    initRoots(rawData) {
        for (const [index, value] of rawData.entries()) {
            const node = node_1.LenkaNode.createRootNode({
                value,
                index,
                summary: this,
            });
            this._roots.push(node);
        }
        if (rawData.length === 1) {
            this._selectedRoot = this._roots[0];
        }
    }
    getNodeByLabel(label) {
        if (typeof label !== 'number') {
            throw new TypeError('Parameter of setByLabel/deleteByLabel functions must be a number.');
        }
        if (!this._allNodes.has(label)) {
            throw new TypeError('Invalid parameter of setByLabel/deleteByLabel functions (unknown label).');
        }
        return this._allNodes.get(label);
    }
}
exports.Summary = Summary;
