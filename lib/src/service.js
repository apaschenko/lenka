"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombineParams = exports.Child = exports.CombineSource = exports.CustomizerParams = exports.Summary = exports.FinalAction = exports.Results = exports.Node = void 0;
const general_types_1 = require("./lib/general_types");
const piece_types_1 = require("./lib/piece_types");
const symbols_1 = require("./lib/symbols");
const All = 'all';
const Asterisk = '*';
const PredefActCoverSet = [...piece_types_1.CollectionsSet, piece_types_1.Vocabulary, piece_types_1.Collection, All, Asterisk];
const PredefinedActorsSet = ['replace', 'merge', 'union', 'diff'];
const OutputTypeSet = ['simple', 'verbose'];
const ActionKeys = ['coverage', 'actor'];
;
const TypeCheckers = {
    object: (combineSource) => { return combineSource._internalType === 'object'; },
    array: (combineSource) => { return combineSource._internalType === 'array'; },
    map: (combineSource) => { return combineSource._internalType === 'map'; },
    set: (combineSource) => { return combineSource._internalType === 'set'; },
    collection: (combineSource) => {
        return piece_types_1.CollectionsSet.includes(combineSource._internalType);
    },
    vocabulary: (combineSource) => {
        return piece_types_1.VocabulariesSet.includes(combineSource._internalType);
    },
    [All]: () => { return true; },
    [Asterisk]: () => { return true; },
};
const PredefinedActorFunctions = {
    merge: () => { return symbols_1.BY_DEFAULT; },
    replace: () => { return symbols_1.BY_DEFAULT; },
    union: () => { return symbols_1.BY_DEFAULT; },
    diff: () => { return symbols_1.BY_DEFAULT; },
};
const DefaultCloneOptions = {
    accumulator: {},
    customizer: null,
    output: 'simple',
    descriptors: false,
};
const DefaultCombineOptions = Object.assign(Object.assign({}, DefaultCloneOptions), { actions: [] });
const restrictedProperties = {
    array: new Set(['length']),
    arraybuffer: new Set(['byteLength', 'maxByteLength', 'resizable']),
    dataview: new Set(['buffer', 'byteLength', 'byteOffset']),
    regexp: new Set([
        'dotAll', 'flags', 'global', 'hasIndices', 'ignoreCase', 'multiline', 'source', 'sticky', 'unicode'
    ]),
};
function quotedListFromArray(array) {
    return array.map((keyName) => { return '"' + keyName + '"'; }).join(', ');
}
class Node {
    constructor(value, summary) {
        this._summary = summary;
        this.setValueAndType(value);
        this._isItCustomized = false;
        this._isItMissed = false;
        this._isItProcessed = false;
        this._isItADouble = summary.hasValue(value);
    }
    static createRootNode(params) {
        const { value, summary, index } = params;
        const node = new Node(value, summary);
        node._parentNode = null;
        node._root = node;
        node._index = index;
        node._level = 0;
        node._producedAs = 'root';
        node._summary = summary;
        node._isItADouble = summary.hasValue(value);
        summary.addToAllNodes(node);
        return node;
    }
    static emptyChildrenSet(init) {
        return general_types_1.ProducedAsIntSet.reduce((acc, keyType) => {
            acc[keyType] = init();
            return acc;
        }, {});
    }
    addToNodesToLabels() {
        this._summary.addToNodesToLabels(this);
    }
    setFlags() {
        this._isItMissed = this._target === symbols_1.MISSING;
        this._isItADouble = this._summary.hasValue(this._value);
        this._isItCustomized = this.summary.finalCloneOptions.customizer
            && this.target !== symbols_1.BY_DEFAULT;
        this._isItProcessed = this._isItCustomized
            || this._isItAPrimitive
            || this._isItADouble
            || this._isItMissed;
        if (!this._isItCustomized && (this._isItAPrimitive || this._isItADouble)) {
            this._target = this._value;
        }
    }
    createChild(producedBy, producedAs, parentTarget) {
        const summary = this._summary;
        let value;
        switch (producedAs) {
            case 'key':
                value = this.value.get(producedBy);
                break;
            case 'property':
                value = this.value[producedBy];
                break;
            case 'value':
                value = producedBy;
                break;
            default:
                throw new TypeError(`Internal error S01`);
        }
        const child = new Node(value, summary);
        child._parentNode = this;
        child._parentTarget = parentTarget || this;
        child._root = this._root;
        child._index = this._index;
        child._level = this._level + 1;
        child._producedBy = producedBy;
        child._producedAs = producedAs;
        summary.addToAllNodes(child);
        return child;
    }
    createInstance() {
        this._summary.createTargetInstance(this);
    }
    get value() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this._value;
    }
    get type() {
        return this._type;
    }
    get childKeys() {
        var _a;
        const childKeys = Node.emptyChildrenSet(() => {
            return [];
        });
        if (this._isItAPrimitive) {
            return childKeys;
        }
        for (const producedBy of Reflect.ownKeys(this.value)) {
            if (!((_a = restrictedProperties[this._type]) === null || _a === void 0 ? void 0 : _a.has(producedBy))) {
                childKeys.property.push(producedBy);
            }
        }
        const isSet = this._type === 'set';
        if (isSet || this._type === 'map') {
            for (const producedBy of this.value.keys()) {
                childKeys[isSet ? 'value' : 'key'].push(producedBy);
            }
        }
        return childKeys;
    }
    get parentNode() {
        return this._parentNode;
    }
    set parentNode(parent) {
        this._parentNode = parent;
    }
    get parentTarget() {
        return this._parentTarget;
    }
    set parentTarget(parent) {
        this._parentTarget = parent;
    }
    get root() {
        return this._root;
    }
    set root(root) {
        this._root = root;
    }
    get target() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this._target;
    }
    set target(targetValue) {
        this._target = targetValue;
    }
    get index() {
        return this._index;
    }
    set index(index) {
        this._index = index;
    }
    get level() {
        return this._level;
    }
    set level(level) {
        this._level = level;
    }
    get label() {
        return this._label;
    }
    set label(label) {
        this._label = label;
    }
    get producedBy() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this._producedBy;
    }
    get producedAs() {
        return this._producedAs;
    }
    get isItADouble() {
        return this._isItADouble;
    }
    set isItADouble(isDouble) {
        this._isItADouble = isDouble;
    }
    get isItAPrimitive() {
        return this._isItAPrimitive;
    }
    // get isItCustomized(): boolean {
    //   return this._isItCustomized;
    // }
    get isItMissed() {
        return this._isItMissed;
    }
    get isItProcessed() {
        return this._isItProcessed;
    }
    // set isItProcessed(isProcessed: boolean) {
    //   this._isItProcessed = isProcessed;
    // }
    get summary() {
        return this._summary;
    }
    // set summary(summary: Summary) {
    //   this._summary = summary;
    // }
    // get rawOptions(): RawCloneOptions {
    //   return this._summary.rawOptions;
    // }
    // get finalOptions(): FinalCloneOptions {
    //   return this._summary.finalOptions;
    // }
    setValueAndType(value) {
        this._value = value;
        if (value === symbols_1.MISSING) {
            this._type = symbols_1.MISSING;
        }
        else if (Array.isArray(value)) {
            this._type = 'array';
        }
        else if (value instanceof Set) {
            this._type = 'set';
        }
        else if (value instanceof Map) {
            this._type = 'map';
        }
        else if (value instanceof ArrayBuffer) {
            this._type = 'arraybuffer';
        }
        else if (value instanceof DataView) {
            this._type = 'dataview';
        }
        else if (value instanceof RegExp) {
            this._type = 'regexp';
        }
        else if (value instanceof Date) {
            this._type = 'date';
        }
        else if (typeof value === 'object') {
            this._type = value === null ? 'null' : 'object';
        }
        else {
            this._type = typeof this._value;
        }
        this._isItAPrimitive = piece_types_1.PrimitiveTypesSet.includes(this._type);
    }
}
exports.Node = Node;
;
class Results {
    constructor(summary) {
        this.setByLabel = this._setByLabel.bind(this);
        this.deleteByLabel = this._deleteByLabel.bind(this);
        this._summary = summary;
    }
    get accumulator() {
        return this._summary.accumulator;
    }
    // deprecated
    get options() {
        return this._summary.finalCloneOptions;
    }
    get cloneOptions() {
        return this._summary.finalCloneOptions;
    }
    get combineOptions() {
        return this._summary.finalCombineOptions;
    }
    get result() {
        return this._summary.result;
    }
    _deleteByLabel(label) {
        return this._summary.deleteByLabel(label);
    }
    _setByLabel(label, rawData) {
        return this._summary.setByLabel(label, rawData);
    }
}
exports.Results = Results;
class FinalAction {
    constructor(rawAction) {
        if (typeof rawAction !== 'object') {
            this.throwError();
        }
        const keys = Object.keys(rawAction);
        if (keys.length !== 2 || !keys.every((key) => { return ActionKeys.includes(key); })) {
            this.throwError();
        }
        const { coverage, actor } = rawAction;
        if (Array.isArray(coverage)) {
            if (coverage.length !== 2) {
                throw new TypeError('When stock coverage is specified as an array, that array must contains exactly two elements: ' +
                    'coverage for the first and second parameters.');
            }
            this._coverage = coverage.map((item) => {
                return this.singleCoverageCheck(item);
            });
        }
        else {
            const finalCoverage = this.singleCoverageCheck(coverage);
            this._coverage = [finalCoverage, finalCoverage];
        }
        switch (typeof actor) {
            case 'function':
                this._actor = actor;
                break;
            case 'string':
                if (!PredefinedActorsSet.includes(actor)) {
                    throw new TypeError(`Unknown predefined actor "${actor}". Valid values are ${quotedListFromArray(PredefinedActorsSet)}`);
                }
                this._actor = PredefinedActorFunctions[actor];
                break;
            default:
                throw new TypeError(`Actor can't be a ${typeof actor}. It must be either a ` +
                    `function or a string representing one of the preset values.`);
        }
    }
    tryToRun(params) {
        const condition = params.bases.every((source, index) => { return this._coverage[index](source); });
        if (condition) {
            this._actor(params);
        }
        return !condition;
    }
    singleCoverageCheck(coverage) {
        switch (typeof coverage) {
            case 'function':
                return coverage;
            case 'string':
                if (!PredefActCoverSet.includes(coverage)) {
                    throw new TypeError(`Unknown action coverage value "${coverage}". Valid options are ` +
                        `${quotedListFromArray(PredefActCoverSet)}.`);
                }
                return TypeCheckers[coverage];
            default:
                throw new TypeError(`Action coverage can't be a ${typeof coverage}. It must be either ` +
                    `a function or a string representing one of the preset values.`);
        }
    }
    throwError() {
        throw new TypeError('Each item of options.actions array must be an object with exactly two properties: ' +
            quotedListFromArray(ActionKeys) +
            '.');
    }
}
exports.FinalAction = FinalAction;
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
    setAndGetResult(result) {
        this._result = result;
        return new Results(this);
    }
    getAndIncreaceLabel() {
        return this._label++;
    }
    setByLabel(label, rawData) {
        this.checkLabel(label);
        const node = this._allNodes.get(label);
        if (node.producedAs === 'root') {
            throw new TypeError("You can't change a root node value (the whole cloning result) with" +
                " setByLabel method! Instead, use new value directly in your code.");
        }
        const parentTarget = node.parentTarget.target;
        switch (node.producedAs) {
            case 'key':
                parentTarget.set(node.producedBy, rawData);
                break;
            case 'property':
                parentTarget[node.producedBy] = rawData;
                break;
            case 'value':
                parentTarget.delete(node.target);
                parentTarget.add(rawData);
                break;
        }
        node.target = rawData;
    }
    deleteByLabel(label) {
        this.checkLabel(label);
        const node = this._allNodes.get(label);
        if (node.producedAs === 'root') {
            throw new TypeError("You can't delete a root node (the whole cloning result)!");
        }
        const parentTarget = node.parentTarget.target;
        switch (node.producedAs) {
            case 'key':
                parentTarget.delete(node.producedBy);
                break;
            case 'property':
                delete parentTarget[node.producedBy];
                break;
            case 'value':
                parentTarget.delete(node.target);
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
        return this._result;
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
        node.target = node.isItAPrimitive
            ? node.value
            : Reflect.construct(node.value.constructor, params);
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
                    if (!OutputTypeSet.includes(optionValue)) {
                        throw new TypeError(`Invalid value of the optional ${operation}() option "output". ` +
                            `Possible values are ${quotedListFromArray(OutputTypeSet)}`);
                    }
                    finalOptions.output = optionValue;
                    break;
                case 'customizer':
                    if (typeof optionValue !== 'function') {
                        throw new TypeError(`If optional ${operation}() option "customizer" is present, it must be a function.`);
                    }
                    finalOptions.customizer = optionValue;
                    break;
                default:
                    if (optionName === 'actions' && operation === 'combine') {
                        if (!Array.isArray(optionValue)) {
                            throw new TypeError(`If optional ${operation}() option "actions" is present, it must be an array.`);
                        }
                        finalOptions.actions = optionValue.map((rawAction) => {
                            return new FinalAction(rawAction);
                        });
                    }
                    else {
                        throw new TypeError(`Unknown ${operation}() "${optionName}" option. Valid options are ${quotedListFromArray(Object.keys(operation === 'clone' ? DefaultCloneOptions : DefaultCombineOptions))}`);
                    }
            }
        }
        if (operation === 'combine') {
            finalOptions.actions.push(new FinalAction({ coverage: 'all', actor: PredefinedActorFunctions.replace }));
        }
        return finalOptions;
    }
    initRoots(rawData) {
        for (const [index, value] of rawData.entries()) {
            const node = Node.createRootNode({
                value,
                index,
                summary: this,
            });
            this._roots.push(node);
        }
    }
    checkLabel(label) {
        if (typeof label !== 'number') {
            throw new TypeError('Parameter of setByLabel/deleteByLabel functions must be a number.');
        }
        if (!this._allNodes.has(label)) {
            throw new TypeError('Invalid parameter of setByLabel/deleteByLabel functions (unknown label).');
        }
    }
}
exports.Summary = Summary;
class CustomizerParams {
    constructor(node) {
        this._node = node;
    }
    get value() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this._node.value;
    }
    get key() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this._node.producedBy;
    }
    get parent() {
        return this._node.parentNode
            ? new CustomizerParams(this._node.parentNode)
            : null;
    }
    get root() {
        return new CustomizerParams(this._node.root);
    }
    get index() {
        return this._node.index;
    }
    get level() {
        return this._node.level;
    }
    get label() {
        return this._node.label;
    }
    get isItAdouble() {
        return this._node.isItADouble;
    }
    get isItAPrimitive() {
        return this._node.isItAPrimitive;
    }
    get accumulator() {
        return this._node.summary.accumulator;
    }
    get options() {
        return this._node.summary.rawCloneOptions;
    }
}
exports.CustomizerParams = CustomizerParams;
class CombineSource extends CustomizerParams {
    constructor(node, combineParams) {
        super(node);
        this._combineParams = combineParams;
    }
    select() {
        this._combineParams.selectBase(this);
    }
    get _internalType() {
        return this._node.type;
    }
    get childKeys() {
        return this._node.childKeys;
    }
}
exports.CombineSource = CombineSource;
class Child {
    constructor(combineParams, index, producedBy, producedAs) {
        this._combineParams = combineParams;
        this._index = index;
        this._key = producedBy;
        this._producedAs = producedAs;
        this._label = this._combineParams.getNextLabel();
    }
    add() {
        this._combineParams.addChild(this);
        return this._label;
    }
    get index() {
        return this._index;
    }
    get key() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this._key;
    }
    get producedAs() {
        return this._producedAs;
    }
    get label() {
        return this._label;
    }
}
exports.Child = Child;
class CombineParams {
    constructor(summary, nodes) {
        this._summary = summary;
        this._nodes = nodes;
        // eslint-disable-next-line @typescript-eslint/no-this-alias, unicorn/no-this-assignment
        const combineParams = this;
        this._combineSources = nodes.map((node) => { return new CombineSource(node, combineParams); });
        this.buildSchemeAndResult();
    }
    addChild(child) {
        const resultTyped = this._result[child.producedAs];
        if (resultTyped.has(child.key)) {
            resultTyped.get(child.key).push(child);
        }
        else {
            resultTyped.set(child.key, [child]);
        }
        return child.label;
    }
    getNextLabel() {
        return this._summary.getAndIncreaceLabel();
    }
    selectBase(combineSource) {
        if (this._selectedBase) {
            throw new TypeError('You are trying to select a combine base twice, but ' +
                'you should only select a base once during each iteration.');
        }
        this._selectedBase = combineSource;
    }
    postCheck() {
        if (!this._selectedBase) {
            throw new TypeError(`The combine base hasn't been selected, but ` +
                'you should only select a base once during each iteration.');
        }
    }
    get bases() {
        return this._combineSources;
    }
    get selectedBase() {
        return this._selectedBase;
    }
    get result() {
        return this._result;
    }
    _createChild(child) {
        return this._nodes[child.index].createChild(child.key, child.producedAs, this._nodes[this.selectedBase.index]);
    }
    buildSchemeAndResult() {
        this._scheme = Node.emptyChildrenSet(() => {
            return new Map();
        });
        this._result = Node.emptyChildrenSet(() => {
            return new Map();
        });
        for (const keyType of general_types_1.ProducedAsIntSet) {
            const schemeTyped = this._scheme[keyType];
            for (const base of this._nodes) {
                for (const producedBy of base[keyType]) {
                    const child = new Child(this, base.index, producedBy, keyType);
                    if (schemeTyped.has(producedBy)) {
                        schemeTyped.get(producedBy).push(child);
                    }
                    else {
                        schemeTyped.set(producedBy, [child]);
                    }
                }
            }
        }
    }
}
exports.CombineParams = CombineParams;
