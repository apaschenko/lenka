import { LChild, LCombineParams, LNode } from './ifaces';
import { LProducedAsInt } from './general_types';

export class LenkaChild implements LChild {
  constructor(params: {
    combineParams: LCombineParams,
    producedBy: LNode['producedBy'],
    producedAs: LProducedAsInt,
    parentNode: LNode,
  }) {
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

  setKey(keyOrPropName: unknown) {
    this._key = keyOrPropName;
    return this;
  }

  setProducedAs(keyType: LProducedAsInt) {
    this._producedAs = keyType;
    return this;
  }

  setValue(value: unknown) {
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

  private _combineParams: LCombineParams;

  private _index: number;

  private _key: LNode['producedBy'];

  private _producedAs: LProducedAsInt;

  private _label: LNode['label'];

  private _value: LNode['value'];

  private _parentNode: LNode;
}
