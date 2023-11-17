"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LenkaChild = void 0;
class LenkaChild {
    constructor(params) {
        const { combineParams, producedBy, producedAs, parentNode } = params;
        this._combineParams = combineParams;
        this._index = parentNode.index;
        this._key = producedBy;
        this._producedAs = producedAs;
        this._label = this._combineParams.getNextLabel();
        this._parentNode = parentNode;
        this._value = parentNode.getChildValue(producedBy, producedAs);
    }
    add() {
        this._combineParams.addChild(this);
        return this._label;
    }
    setKey(keyOrPropName) {
        this._key = keyOrPropName;
        return this;
    }
    setProducedAs(keyType) {
        this._producedAs = keyType;
        return this;
    }
    setValue(value) {
        this._value = value;
        return this;
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
    get value() {
        return this._value;
    }
    get label() {
        return this._label;
    }
}
exports.LenkaChild = LenkaChild;
