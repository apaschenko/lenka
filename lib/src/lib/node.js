"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LenkaNode = void 0;
const general_types_1 = require("./general_types");
const piece_types_1 = require("./piece_types");
const symbols_1 = require("./symbols");
const customizer_params_1 = require("./customizer_params");
const restrictedProperties = {
    array: new Set(['length']),
    arraybuffer: new Set(['byteLength', 'maxByteLength', 'resizable']),
    dataview: new Set(['buffer', 'byteLength', 'byteOffset']),
    regexp: new Set([
        'dotAll', 'flags', 'global', 'hasIndices', 'ignoreCase', 'multiline', 'source', 'sticky', 'unicode'
    ]),
};
class LenkaNode {
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
        const node = new LenkaNode(value, summary);
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
    getChildValue(producedBy, producedAs) {
        switch (producedAs) {
            case 'keys':
                return this.value.get(producedBy);
            case 'properties':
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return this.value[producedBy];
            case 'items':
                return this._isItAnArray ? this.value[producedBy] : producedBy;
            default:
                throw new TypeError(`Internal error S01`);
        }
    }
    createChild(producedBy, producedAs, parentTarget) {
        const summary = this._summary;
        const child = new LenkaNode(this.getChildValue(producedBy, producedAs), summary);
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
    createInstance() {
        this._summary.createTargetInstance(this);
    }
    linkTargetToParent() {
        switch (this.producedAs) {
            case 'properties':
                this.includeThisValueToParentTarget();
                break;
            case 'keys':
                this.parentTarget.target.set(this.producedBy, this.target);
                break;
            case 'items':
                if (this._parentTarget._isItAnArray) {
                    this.includeThisValueToParentTarget();
                }
                else {
                    this.parentTarget.target.add(this.target);
                }
                break;
            case 'root':
                break;
        }
    }
    // eslint-disable-next-line sonarjs/cognitive-complexity
    getChildrenValues(valuesFromP, valuesFromK, keysPropsMix) {
        const allowedTypes = new Set(['keys', 'items']);
        if (valuesFromP) {
            allowedTypes.add('properties');
        }
        if (valuesFromK) {
            allowedTypes.add('keys');
        }
        if (!this._childrenValues) {
            this._childrenValues = LenkaNode.emptyChildrenSet(() => {
                return new Set();
            });
            const childrenKeys = this.childrenKeys;
            if (this._isItAPrimitive) {
                for (const keyType of general_types_1.ProducedAsIntSet) {
                    this._childrenValues[keyType].add(this._value);
                }
            }
            else {
                for (const keyType of general_types_1.ProducedAsIntSet) {
                    if (allowedTypes.has(keyType)) {
                        for (const producedBy of childrenKeys[keyType].values()) {
                            this._childrenValues[keyType].add(this.getChildValue(producedBy, keyType));
                        }
                    }
                }
            }
            if (keysPropsMix) {
                for (const valuesByKeys of this._childrenValues.keys.values()) {
                    this._childrenValues.properties.add(valuesByKeys);
                }
                this._childrenValues.keys = this._childrenValues.properties;
            }
        }
        return this._childrenValues;
    }
    get value() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this._value;
    }
    get type() {
        return this._type;
    }
    // eslint-disable-next-line sonarjs/cognitive-complexity
    get childrenKeys() {
        var _a;
        if (!this._childrenKeys) {
            this._childrenKeys = LenkaNode.emptyChildrenSet(() => {
                return new Set();
            });
            if (!this._isItAPrimitive) {
                for (const producedBy of Reflect.ownKeys(this.value)) {
                    if (!((_a = restrictedProperties[this._type]) === null || _a === void 0 ? void 0 : _a.has(producedBy))) {
                        this._childrenKeys[
                        // eslint-disable-next-line unicorn/prefer-number-properties
                        (!this._isItAnArray) || isNaN(producedBy) ? 'properties' : 'items'].add(producedBy);
                    }
                }
                const isSet = this._type === 'set';
                if (isSet || this._type === 'map') {
                    for (const producedBy of this.value.keys()) {
                        this._childrenKeys[isSet ? 'items' : 'keys'].add(producedBy);
                    }
                }
            }
        }
        return this._childrenKeys;
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
    get isItAnArray() {
        return this._isItAnArray;
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
    get summary() {
        return this._summary;
    }
    get customizerParams() {
        if (!this._customizerParams) {
            this._customizerParams = new customizer_params_1.LenkaCustomizerParams(this);
        }
        return this._customizerParams;
    }
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
        this._isItAnArray = this._type === 'array';
    }
    includeThisValueToParentTarget() {
        if (this._summary.finalCloneOptions.descriptors) {
            const descr = Object.getOwnPropertyDescriptor(this._parentTarget._value, this._producedBy);
            if (!(descr.get || descr.set)) {
                descr.value = this._target;
            }
            Object.defineProperty(this._parentTarget._target, this._producedBy, Object.assign({}, descr));
        }
        else {
            this._parentTarget._target[this._producedBy] = this._target;
        }
    }
}
exports.LenkaNode = LenkaNode;
;
