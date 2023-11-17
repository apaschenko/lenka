import { LCombineSource, LCombineParams, LNode } from './ifaces';
import { LenkaCustomizerParams } from './customizer_params';

export class CombineSource extends LenkaCustomizerParams implements LCombineSource {
  constructor(node: LNode, combineParams: LCombineParams) {
    super(node);
    this._combineParams = combineParams;
  }

  select() {
    this._combineParams.selectBase(this);
  }

  getChildrenValues(valuesFromP: boolean, valuesFromK: boolean, keysPropsMix: boolean) {
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

  private _combineParams: LCombineParams;
}
