"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombineSource = void 0;
const customizer_params_1 = require("./customizer_params");
class CombineSource extends customizer_params_1.LenkaCustomizerParams {
    constructor(node, combineParams) {
        super(node);
        this._combineParams = combineParams;
    }
    select() {
        this._combineParams.selectBase(this);
    }
    getChildrenValues(valuesFromP, valuesFromK, keysPropsMix) {
        return this._node.getChildrenValues(valuesFromP, valuesFromK, keysPropsMix);
    }
    get childrenKeys() {
        return this._node.childrenKeys;
    }
    get _internalType() {
        return this._node.type;
    }
    get _isPrimitive() {
        return this._node.isItAPrimitive;
    }
}
exports.CombineSource = CombineSource;
