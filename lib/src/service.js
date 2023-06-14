"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomizerParams = exports.Summary = exports.Results = exports.Source = exports.InternalActionsSet = exports.ParamsActionsSet = exports.MISSING = exports.BY_DEFAULT = void 0;
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
    exports.MISSING,
];
const ReducedObjTypesSet = [
    'date',
    'regexp',
    'function',
    'dataview',
    'arraybuffer',
];
const VocabularyTypesSet = ['array', 'map', 'object'];
// type Vocabularies = TypeFromReadonlyArray<typeof VocabularyTypesSet>;
const CollectionTypesSet = ['array', 'set', 'object']; // Yes, arrays are vocabularies and collections
// type Collections = TypeFromReadonlyArray<typeof CollectionTypesSet>;
const InternalExtendedObjTypesSet = [...VocabularyTypesSet, ...CollectionTypesSet];
const VocabularyType = 'vocabularies';
const CollectionType = 'collection';
const ParamsExtendedObjTypesSet = [...InternalExtendedObjTypesSet, VocabularyType, CollectionType];
exports.ParamsActionsSet = ['replace', 'merge', 'diff'];
exports.InternalActionsSet = [
    ...exports.ParamsActionsSet,
    'vocabulariesMerge',
    'collectionsMerge',
    'vocabulariesDiff',
    'collectionsDiff'
];
const MetaTypeSet = ['vocabulary', 'collection', 'primitive'];
const restrictedProperties = {
    array: new Set(['length']),
    arraybuffer: new Set(['byteLength', 'maxByteLength', 'resizable']),
    dataview: new Set(['buffer', 'byteLength', 'byteOffset']),
    regexp: new Set([
        'dotAll', 'flags', 'global', 'hasIndices', 'ignoreCase', 'multiline', 'source', 'sticky', 'unicode'
    ]),
};
class Source {
    constructor(value) {
        this.setValueAndType(value);
        this.buildChildrenPartial();
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
    createChild(producedBy, producedAs) {
        let value;
        if (this._isItAPrimitive) {
            value = exports.MISSING;
        }
        else {
            switch (producedAs) {
                case 'key':
                    value = this._value.get(producedBy);
                    break;
                case 'property':
                    value = this._value[producedBy];
                    break;
                case 'value':
                    value = producedBy;
                    break;
                default:
                    throw new TypeError(`Internal error S01`);
            }
        }
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
    addToSourcesToLabels() {
        this._summary.addToSourcesToLabels(this);
    }
    // changeResult(result: any): void {
    //   if (this._parentSource) {
    //     this._target = result;
    //     switch (this._producedAs) {
    //       case 'property':
    //         (this._parentSource as object)[this._producedBy] = result;
    //         break;
    //         case 'key':
    //         (this._parentSource as unknown as Map<unknown, unknown>).set(this._producedBy, result);
    //         break;
    //       case 'value':
    //         (this._parentSource as unknown as Set<unknown>).delete(this._target);
    //         (this._parentSource as unknown as Set<unknown>).add(result);
    //         break;
    //       default:
    //         throw new TypeError(`Internal error S02`);
    //     }
    //   }
    // }
    setFlags() {
        this._isItMissed = this._target === exports.MISSING;
        this._isItCustomized = this.summary.finalOptions.customizer
            && this.target !== exports.BY_DEFAULT;
        this._isItProcessed = this._isItCustomized
            || this._isItAPrimitive
            || this._isItADouble
            || this._isItMissed;
        if (!this._isItCustomized && (this._isItAPrimitive || this._isItADouble)) {
            this._target = this._value;
        }
    }
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
    get childrenPartial() {
        return this._childrenPartial;
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
    buildChildrenPartial() {
        var _a;
        this._childrenPartial = [];
        if (this._isItAPrimitive) {
            return;
        }
        for (const producedBy of Reflect.ownKeys(this.value)) {
            if (!((_a = restrictedProperties[this._type]) === null || _a === void 0 ? void 0 : _a.has(producedBy))) {
                this._childrenPartial.push({
                    producedBy,
                    value: this.value[producedBy],
                    producedAs: 'property',
                });
            }
        }
        const isSet = this._type === 'set';
        const isMap = this._type === 'map';
        if (isSet || isMap) {
            for (const [producedBy, value] of this.value.entries()) {
                this.childrenPartial.push({
                    producedBy,
                    value,
                    producedAs: isSet ? 'value' : 'key',
                });
            }
        }
    }
}
exports.Source = Source;
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
    get options() {
        return this._summary.rawOptions;
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
    constructor(rawData, rawOptions) {
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
        this._rawOptions = rawOptions;
        this.buildFinalOptions();
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
    get rawOptions() {
        return this._rawOptions;
    }
    get finalOptions() {
        return this._finalOptions;
    }
    get roots() {
        return this._roots;
    }
    buildFinalOptions() {
        var _a, _b, _c, _d;
        this._finalOptions = {
            customizer: (_a = this.rawOptions) === null || _a === void 0 ? void 0 : _a.customizer,
            accumulator: ((_b = this.rawOptions) === null || _b === void 0 ? void 0 : _b.accumulator) || {},
            output: ((_c = this.rawOptions) === null || _c === void 0 ? void 0 : _c.output) || 'simple',
            descriptors: ((_d = this.rawOptions) === null || _d === void 0 ? void 0 : _d.descriptors) || false,
        };
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
        return this._source.summary.rawOptions;
    }
}
exports.CustomizerParams = CustomizerParams;
