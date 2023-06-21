"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomizerParams = exports.Summary = exports.Results = exports.ChildPart = exports.Source = exports.MISSING = exports.BY_DEFAULT = void 0;
exports.BY_DEFAULT = Symbol('BY_DEFAULT');
exports.MISSING = Symbol('MISSING');
const PrimitiveTypesSet = [
    'boolean',
    'undefined',
    'symbol',
    'string',
    'number',
    'bigint',
    'null',
];
const ReducedObjTypesSet = [
    'date',
    'regexp',
    'function',
    'dataview',
    'arraybuffer',
];
const FinalVocabulariesSet = ['array', 'map', 'object'];
const FinalCollectionsSet = [...FinalVocabulariesSet, 'set']; // Yes, all the vocabularies are collections too.
const Vocabulary = 'vocabulary';
const Collection = 'collection';
const RawExtendedObjTypesSet = [...FinalCollectionsSet, Vocabulary, Collection];
const RawActCollectionSet = ['replace', 'union', 'diff'];
const MetaCollActionsSet = ['collectionReplace', 'collectionUnion', 'collectionDiff'];
const RawActVocabularySet = [...RawActCollectionSet, 'stack'];
const MetaVocActionsSet = ['vocabularyStack'];
const FinalCollActionsSet = [
    ...RawActCollectionSet,
    ...MetaCollActionsSet,
];
const FinalVocActionsSet = [
    ...FinalCollActionsSet,
    ...MetaVocActionsSet,
];
const MetaTypeSet = ['vocabulary', 'collection', 'primitive'];
const ActionsReplacer = {
    replace: 'collectionReplace',
    union: 'collectionUnion',
    diff: 'collectionDiff',
    stack: 'vocabularyStack',
};
const FinalCmbOptsDefaults = {
    accumulator: {},
    actions: {},
};
const ValidRawCombineKeys = Object.keys(FinalCmbOptsDefaults);
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
class Source {
    constructor(value) {
        this.setValueAndType(value);
        this._children = [];
        this._isItCustomized = false;
        this._isItMissed = false;
        this._isItProcessed = false;
    }
    static createRootSource(params) {
        const { value, summary, index } = params;
        const source = new Source(value);
        source._parentSource = null;
        source._root = source;
        source._index = index;
        source._level = 0;
        source._producedAs = 'root';
        source._summary = summary;
        source._isItADouble = !!summary.getTargetBySource(value);
        summary.addToAllSources(source);
        return source;
    }
    createChildrenPart() {
        var _a;
        if (this._isItAPrimitive) {
            return;
        }
        for (const producedBy of Reflect.ownKeys(this.value)) {
            if (!((_a = restrictedProperties[this._type]) === null || _a === void 0 ? void 0 : _a.has(producedBy))) {
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                this._children.push(new ChildPart(this, producedBy, 'property'));
            }
        }
        const isSet = this._type === 'set';
        const isMap = this._type === 'map';
        if (isSet || isMap) {
            for (const producedBy of this.value.keys()) {
                // eslint-disable-next-line @typescript-eslint/no-use-before-define
                this._children.push(new ChildPart(this, producedBy, isSet ? 'value' : 'key'));
            }
        }
    }
    addToSourcesToLabels() {
        this._summary.addToSourcesToLabels(this);
    }
    setFlags() {
        this._isItMissed = this._target === exports.MISSING;
        this._isItCustomized = this.summary.finalCloneOptions.customizer
            && this.target !== exports.BY_DEFAULT;
        this._isItProcessed = this._isItCustomized
            || this._isItAPrimitive
            || this._isItADouble
            || this._isItMissed;
        if (!this._isItCustomized && (this._isItAPrimitive || this._isItADouble)) {
            this._target = this._value;
        }
    }
    createChildByChildPart(value, producedBy, producedAs) {
        const summary = this._summary;
        const child = new Source(value);
        child._parentSource = this;
        child._root = this._root;
        child._index = this._index;
        child._level = this._level + 1;
        child._producedBy = producedBy;
        child._producedAs = producedAs;
        child._summary = summary;
        child._isItADouble = !!summary.getTargetBySource(value);
        summary.addToAllSources(child);
        return child;
    }
    get value() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this._value;
    }
    get type() {
        return this._type;
    }
    get parentSource() {
        return this._parentSource;
    }
    set parentSource(parent) {
        this._parentSource = parent;
    }
    get root() {
        return this._root;
    }
    set root(root) {
        this._root = root;
    }
    get children() {
        return this._children;
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
        if (value === exports.MISSING) {
            this._type = exports.MISSING;
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
        this._isItAPrimitive = PrimitiveTypesSet.includes(this._type);
    }
}
exports.Source = Source;
;
class ChildPart {
    constructor(parent, producedBy, producedAs) {
        this._parent = parent;
        this._producedBy = producedBy;
        this._producedAs = producedAs;
        switch (producedAs) {
            case 'key':
                this._value = parent.value.get(producedBy);
                break;
            case 'property':
                this._value = parent.value[producedBy];
                break;
            case 'value':
                this._value = producedBy;
                break;
            default:
                throw new TypeError(`Internal error S01`);
        }
    }
    createSource() {
        return this._parent.createChildByChildPart(this._value, this._producedBy, this._producedAs);
    }
    get producedBy() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this._producedBy;
    }
    get value() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this._value;
    }
    get producedAs() {
        return this._producedAs;
    }
    get parent() {
        return this._parent;
    }
}
exports.ChildPart = ChildPart;
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
        return this._summary.rawCloneOptions;
    }
    get cloneOptions() {
        return this._summary.rawCloneOptions;
    }
    get combineOptions() {
        return this._summary.rawCombineOptions;
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
class Summary {
    constructor(rawData, operation, rawOptions) {
        this._sourcesToLabels = new Map();
        this._allSources = [];
        this._roots = [];
        if ((rawOptions === null || rawOptions === void 0 ? void 0 : rawOptions.accumulator) instanceof Object) {
            this._accumulator = rawOptions.accumulator;
        }
        else {
            if ('undefined' === typeof (rawOptions === null || rawOptions === void 0 ? void 0 : rawOptions.accumulator)) {
                this._accumulator = {};
            }
            else {
                throw new TypeError('The accumulator must not be a primitive type.');
            }
        }
        if (operation === 'clone') {
            this._rawCloneOptions = rawOptions;
            this.buildCloneFinalOptions();
        }
        else {
            this._rawCombineOptions = rawOptions;
            this.buildCombineFinalOptions();
        }
        this.initRoots(rawData);
    }
    addToAllSources(source) {
        source.label = this._allSources.length;
        this._allSources.push(source);
    }
    addToSourcesToLabels(source) {
        if (!(this._sourcesToLabels.has(source.value)
            || source.isItAPrimitive
            || source.isItMissed)) {
            this._sourcesToLabels.set(source.value, source.label);
        }
    }
    getTargetBySource(source) {
        return this._sourcesToLabels.has(source)
            ? this._allSources[this._sourcesToLabels.get(source)].target
            : null;
    }
    setAndGetResult(result) {
        this._result = result;
        return new Results(this);
    }
    setByLabel(label, rawData) {
        this.checkLabel(label);
        const source = this._allSources[label];
        if (source.producedAs === 'root') {
            throw new TypeError("You can't change a root node value (the whole cloning result) with" +
                " setByLabel method! Instead, use new value directly in your code.");
        }
        const parentTarget = source.parentSource.target;
        switch (source.producedAs) {
            case 'key':
                parentTarget.set(source.producedBy, rawData);
                break;
            case 'property':
                parentTarget[source.producedBy] = rawData;
                break;
            case 'value':
                parentTarget.delete(source.target);
                parentTarget.add(rawData);
                break;
        }
        source.target = rawData;
    }
    deleteByLabel(label) {
        this.checkLabel(label);
        const source = this._allSources[label];
        if (source.producedAs === 'root') {
            throw new TypeError("You can't delete a root node (the whole cloning result)!");
        }
        const parentTarget = source.parentSource.target;
        switch (source.producedAs) {
            case 'key':
                parentTarget.delete(source.producedBy);
                break;
            case 'property':
                delete parentTarget[source.producedBy];
                break;
            case 'value':
                parentTarget.delete(source.target);
                break;
        }
        source.target = exports.MISSING;
    }
    get accumulator() {
        return this._accumulator;
    }
    get result() {
        return this._result;
    }
    get rawCloneOptions() {
        return this._rawCloneOptions;
    }
    get finalCloneOptions() {
        return this._finalCloneOptions;
    }
    get rawCombineOptions() {
        return this._rawCombineOptions;
    }
    get finalCombineOptions() {
        return this._finalCombineOptions;
    }
    get roots() {
        return this._roots;
    }
    buildCloneFinalOptions() {
        var _a, _b, _c, _d;
        this._finalCloneOptions = {
            customizer: (_a = this._rawCloneOptions) === null || _a === void 0 ? void 0 : _a.customizer,
            accumulator: ((_b = this._rawCloneOptions) === null || _b === void 0 ? void 0 : _b.accumulator) || {},
            output: ((_c = this._rawCloneOptions) === null || _c === void 0 ? void 0 : _c.output) || 'simple',
            descriptors: ((_d = this._rawCloneOptions) === null || _d === void 0 ? void 0 : _d.descriptors) || false,
        };
    }
    buildCombineFinalOptions() {
        this._finalCombineOptions = Object.assign({}, FinalCmbOptsDefaults);
        if (!this._rawCombineOptions) {
            return;
        }
        if (typeof this._rawCombineOptions !== 'object') {
            throw new TypeError('combine() optional "options" parameter must be an object. Please see the docs.');
        }
        const rawKeys = Object.keys(this._rawCombineOptions);
        for (const key of rawKeys) {
            if (!ValidRawCombineKeys.includes(key)) {
                throw new TypeError(`Unknown combine() option. Valid options are: ${quotedListFromArray(ValidRawCombineKeys)}.`);
            }
            if (key === 'actions') {
                this.buildCombineFinalActions();
            }
            else {
                this._finalCombineOptions[key] = this._rawCombineOptions[key];
            }
        }
    }
    buildCombineFinalActions() {
        const rawActions = this._rawCombineOptions.actions;
        if (typeof rawActions !== 'object') {
            throw new TypeError('combine() optional options.actions parameter must be an object. Please see the docs.');
        }
        const actionsKeys = Object.keys(rawActions);
        const keyCollector = {};
        const refinedKeys = actionsKeys.reduce((kc, key) => {
            const action = rawActions[key];
            this.checkAction(key, action);
            if (key === 'collection' || key === 'vocabulary') {
                this.replaceMetaAction(key, action);
            }
            else {
                kc[key] = action;
            }
            return kc;
        }, keyCollector);
        this._finalCombineOptions.actions = Object.assign(Object.assign({}, this._finalCombineOptions.actions), refinedKeys);
    }
    replaceMetaAction(key, action) {
        const metaSet = key === 'collection' ? FinalCollectionsSet : FinalVocabulariesSet;
        const finalActions = this._finalCombineOptions.actions;
        for (const type of metaSet) {
            finalActions[type] = ActionsReplacer[action];
        }
    }
    checkAction(type, action) {
        if (!FinalCollectionsSet.includes(type)) {
            throw new TypeError(`Invalid key "${type}" in combine() options.ations keys. Valid keys are: ${quotedListFromArray(FinalCollectionsSet)}.`);
        }
        if (!RawActVocabularySet.includes(action)) {
            throw new TypeError(`Invalid action value "${action}" in combine() options.actions. Valid values are: ${quotedListFromArray(RawActVocabularySet)}.`);
        }
        if (!FinalVocabulariesSet.includes(type) &&
            !RawActCollectionSet.includes(action)) {
            throw new TypeError(`Action "${action}" is only allowed for vocabularies, but ${type} is not a vocabulary.`);
        }
    }
    initRoots(rawData) {
        for (const [index, value] of rawData.entries()) {
            const source = Source.createRootSource({
                value,
                index,
                summary: this,
            });
            this._roots.push(source);
        }
    }
    checkLabel(label) {
        if (typeof label !== 'number') {
            throw new TypeError('Parameter of setByLabel/deleteLabel functions must be a number.');
        }
        if (label > this._allSources.length || label < 0) {
            throw new TypeError('Invalid parameter of setByLabel/deleteLabel functions (out of range).');
        }
    }
}
exports.Summary = Summary;
class CustomizerParams {
    constructor(source) {
        this._source = source;
    }
    get value() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this._source.value;
    }
    get key() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this._source.producedBy;
    }
    get parent() {
        return this._source.parentSource
            ? new CustomizerParams(this._source.parentSource)
            : null;
    }
    get root() {
        return new CustomizerParams(this._source.root);
    }
    get index() {
        return this._source.index;
    }
    get level() {
        return this._source.level;
    }
    get label() {
        return this._source.label;
    }
    get isItAdouble() {
        return this._source.isItADouble;
    }
    get isItAPrimitive() {
        return this._source.isItAPrimitive;
    }
    get accumulator() {
        return this._source.summary.accumulator;
    }
    get options() {
        return this._source.summary.rawCloneOptions;
    }
}
exports.CustomizerParams = CustomizerParams;
