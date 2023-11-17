import { LCustomizerParams, LNode } from './ifaces';

export class LenkaCustomizerParams implements LCustomizerParams {
  constructor(node: LNode) {
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
      ? new LenkaCustomizerParams(this._node.parentNode)
      : null;
  }

  get root() {
    return new LenkaCustomizerParams(this._node.root);
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

  protected _node: LNode;
}
