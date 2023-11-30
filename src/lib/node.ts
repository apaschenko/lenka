import { LNode, LSummary, LChildren, LChildrenKeys, ChildrenProducedBySet, LChildrenValues } from './ifaces';
import { LProducedAs, LProducedAsInt, ProducedAsIntSet } from './general_types';
import { PieceTypeWithRP, ExtendedPieceType, PrimitiveType, PrimitiveTypesSet } from './piece_types';
import { MISSING, BY_DEFAULT } from './symbols';
import { LenkaCustomizerParams } from './customizer_params';

const restrictedProperties: Record<PieceTypeWithRP, Set<string>> = {
  array: new Set(['length']),
  arraybuffer: new Set(['byteLength', 'maxByteLength', 'resizable']),
  dataview: new Set(['buffer', 'byteLength', 'byteOffset']),
  regexp: new Set([
    'dotAll', 'flags', 'global', 'hasIndices', 'ignoreCase', 'multiline', 'source', 'sticky', 'unicode'
  ]),
};

export class LenkaNode implements LNode {
  constructor(value: LenkaNode['_value'], summary: LSummary) {
    this._summary = summary;

    this.setValueAndType(value);

    this._isItCustomized = false;
    this._isItMissed = false;
    this._isItProcessed = false;
    this._isItADouble = summary.hasValue(value); 
  }

  static createRootNode(params: {
    value: LenkaNode['_value'];
    summary: LenkaNode['summary'];
    index: LenkaNode['_index'];
  }): LenkaNode {
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

  static emptyChildrenSet<T>(init: () => T): LChildren<T> {
    return ProducedAsIntSet.reduce((acc, keyType) => {
      acc[keyType] = init();
      return acc;
    }, {} as LChildren<T>);
  }

  getChildValue(producedBy: unknown, producedAs: LProducedAs): any {
    switch (producedAs) {
      case 'keys':
        return (this.value as Map<unknown, unknown>).get(producedBy);

      case 'properties':
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return (this.value as object)[producedBy as string];

      case 'items':
        return this._isItAnArray ? (this.value as object)[producedBy as string] : producedBy;

      default:
        throw new TypeError(`Internal error S01`);
    }
  }

  createChild(producedBy: unknown, producedAs: LProducedAs, parentTarget?: LenkaNode) {
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
    this._isItMissed = this._target === MISSING;
    this._isItADouble = this._summary.hasValue(this._value);

    this._isItCustomized = this.summary.finalCloneOptions.customizer
      && this.target !== BY_DEFAULT;

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

  linkTargetToParent(): void {
    switch (this.producedAs) {
      case 'properties':
        this.includeThisValueToParentTarget();
        break;
  
      case 'keys':
        (this.parentTarget.target as Map<any, any>).set(this.producedBy, this.target);
        break;
  
      case 'items':
        if (this._parentTarget._isItAnArray) {
          this.includeThisValueToParentTarget();
        } else {
          (this.parentTarget.target as Set<any>).add(this.target);
        }
        break;
  
      case 'root':
        break;
    }
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  getChildrenValues(valuesFromP: boolean, valuesFromK: boolean, keysPropsMix: boolean) {
    const allowedTypes = new Set<LProducedAsInt>(['keys', 'items']);
    if (valuesFromP) {
      allowedTypes.add('properties');
    }
    if (valuesFromK) {
      allowedTypes.add('keys');
    }

    if (!this._childrenValues) {
      this._childrenValues = LenkaNode.emptyChildrenSet<Set<unknown>>(() => {
        return new Set<unknown>();
      });

      const childrenKeys = this.childrenKeys;

      if (this._isItAPrimitive) {
        for (const keyType of ProducedAsIntSet) {
          this._childrenValues[keyType].add(this._value);
        }
      } else {
        for (const keyType of ProducedAsIntSet) {
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
    if (!this._childrenKeys) {
      this._childrenKeys = LenkaNode.emptyChildrenSet<ChildrenProducedBySet>(() => {
        return new Set();
      });
  
      if (!this._isItAPrimitive) {
        for (const producedBy of Reflect.ownKeys(this.value as object)) {
          if (!restrictedProperties[this._type as PieceTypeWithRP]?.has(producedBy as string)) {
            this._childrenKeys[
              // eslint-disable-next-line unicorn/prefer-number-properties
              (!this._isItAnArray) || isNaN(producedBy as unknown as number) ? 'properties' : 'items'
            ].add(producedBy);
          }
        }
    
        const isSet = this._type === 'set';
    
        if (isSet || this._type === 'map') {
          for (const producedBy of (this.value as Set<any>).keys()) {
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

  set parentNode(parent: LenkaNode) {
    this._parentNode = parent;
  }

  get parentTarget() {
    return this._parentTarget;
  }

  set parentTarget(parent: LenkaNode) {
    this._parentTarget = parent;
  }

  get root() {
    return this._root;
  }

  set root(root: LenkaNode) {
    this._root = root;
  }

  get target(): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._target;
  }

  set target(targetValue: unknown) {
    this._target = targetValue;
  }

  get index() {
    return this._index;
  }

  set index(index: number) {
    this._index = index;
  }

  get level() {
    return this._level;
  }

  set level(level: number) {
    this._level = level;
  }

  get label() {
    return this._label;
  }

  set label(label: number) {
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

  set isItADouble(isDouble: boolean) {
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
      this._customizerParams = new LenkaCustomizerParams(this);
    }

    return this._customizerParams;
  }

  private setValueAndType(value: unknown) {
    this._value = value;

    if (value === MISSING) {
      this._type = MISSING
    } else if (Array.isArray(value)) {
      this._type = 'array';
    } else if (value instanceof Set) {
      this._type = 'set';
    } else if (value instanceof Map) {
      this._type = 'map';
    } else if (value instanceof ArrayBuffer) {
      this._type = 'arraybuffer';
    } else if (value instanceof DataView) {
      this._type = 'dataview';
    } else if (value instanceof RegExp) {
      this._type = 'regexp';
    } else if (value instanceof Date) {
      this._type = 'date';
    } else if (typeof value === 'object') {
      this._type = value === null ? 'null' : 'object';
    } else {
      this._type = typeof this._value;
    }

    this._isItAPrimitive = PrimitiveTypesSet.includes(this._type as PrimitiveType);
    this._isItAnArray = this._type === 'array';
  }

  private includeThisValueToParentTarget() {
    if (this._summary.finalCloneOptions.descriptors) {
      const descr = Object.getOwnPropertyDescriptor(this._parentTarget._value, <PropertyKey>this._producedBy);
  
      if (!(descr.get || descr.set)) {
        descr.value = this._target;
      }
  
      Object.defineProperty(this._parentTarget._target, <PropertyKey>this._producedBy, { ...descr })
    } else {
      this._parentTarget._target[<PropertyKey>this._producedBy] = this._target;
    }
  }

  private _value: any;

  private _type: ExtendedPieceType;

  private _parentNode: LenkaNode;

  private _parentTarget: LenkaNode;

  private _root: LenkaNode;

  private _target: any;

  private _index: number;

  private _level: number;

  private _label: number;

  private _producedBy: any;

  private _producedAs: LProducedAs;

  private _summary: LSummary;

  private _childrenKeys: LChildrenKeys;

  private _childrenValues: LChildrenValues;

  private _isItADouble: boolean;

  private _isItAPrimitive: boolean;

  private _isItAnArray: boolean;

  private _isItCustomized: boolean;

  private _isItMissed: boolean;

  private _isItProcessed: boolean;

  private _customizerParams: LenkaCustomizerParams;
};
