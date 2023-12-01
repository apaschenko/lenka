import { LSummary, LNode, LAction, RawOptions, FinalOptions, LCloneOptions, LCombineOptions, LFinalCloneOptions, LFinalCombineOptions } from './ifaces';
import { LResults } from './results';
import { LenkaNode } from './node';
import { FinalAction } from './action';
import { OperationType, LOutputType, OutputTypeSet, DCArrayBuffer } from './general_types';
import { MISSING, BY_DEFAULT } from './symbols';
import { quotedListFromArray } from './utils';

const DefaultCloneOptions: LFinalCloneOptions = {
  accumulator: {},
  customizer: null,
  creator: null,
  output: 'simple',
  descriptors: false,
};

const DefaultCombineOptions: LFinalCombineOptions = {
  ...DefaultCloneOptions,
  actions: [],
};

export class Summary implements LSummary {
  constructor(rawData: unknown[], operation: OperationType, rawOptions?: RawOptions) {
    this._valuesToLabels = new Map();
    this._allNodes = new Map();
    this._roots = [];
    this._label = 0;
    this._operation = operation;
    this._rawOptions = rawOptions || {};
    this._finalOptions = this.validateAndBuildOptions(operation, rawOptions);

    this.initRoots(rawData);
  }

  addToAllNodes(node: LNode) {
    node.label = this.getAndIncreaceLabel();
    this._allNodes.set(node.label, node);
  }

  addToNodesToLabels(node: LNode) {
    if (!(
      this._valuesToLabels.has(node.value)
        || node.isItAPrimitive
        || node.isItMissed
      )) {
      this._valuesToLabels.set(node.value, node.label);
    }
  }

  hasValue(rawData: unknown) {
    return this._valuesToLabels.has(rawData);
  }

  buildResult() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._finalOptions.output === 'simple' 
      ? this._selectedRoot.target 
      : new LResults(this);
  }

  getAndIncreaceLabel() {
    return this._label++;
  }

  setByLabel(label: number, rawData: unknown) {
    const node = this.getNodeByLabel(label);

    if (node.producedAs === 'root') {
      throw new TypeError(
        "You can't change a root node value (the cloning or combine result entirely) with" +
        " setByLabel method! Instead, use new value directly in your code."
      );
    }

    const { target } = node.parentTarget;

    switch (node.producedAs) {
      case 'keys':
        (target as Map<unknown, unknown>).set(node.producedBy, rawData);
        break;

      case 'properties':
        (target as object)[node.producedBy] = rawData;
        break;

      case 'items':
        if (Array.isArray(target)) {
          (target as object)[node.producedBy] = rawData;
        } else {
          (target as Set<unknown>).delete(node.target);
          (target as Set<unknown>).add(rawData);  
        }
        break;
    }

    node.target = rawData;
  }

  deleteByLabel(label: number): void {
    const node = this.getNodeByLabel(label);

    if (node.producedAs === 'root') {
      throw new TypeError("You can't delete a root node (the cloning or combine result entirely)!");
    }

    const { target } = node.parentTarget;

    switch (node.producedAs) {
      case 'keys':
        (target as Map<unknown, unknown>).delete(node.producedBy);
        break;

      case 'properties':
        delete (target as object)[node.producedBy];
        break;

      case 'items':
        if (Array.isArray(target)) {
          delete (target as object)[node.producedBy];
        } else {
          (target as Set<unknown>).delete(node.target);
        }
        break;
    }

    node.target = MISSING;
  }

  createTargetInstance(node: LNode) {
    switch (node.type) {
      case 'array':
        this.constructInstance(node, [(node.value as any[]).length]);
        break;
  
      case 'arraybuffer':
        if (typeof (node.value as DCArrayBuffer).slice === 'function') {
          // eslint-disable-next-line unicorn/prefer-spread
          node.target = (node.value as DCArrayBuffer).slice(0);
        } else {
          const originalUnit8Array = new Uint8Array(node.value as DCArrayBuffer);
          this.constructInstance(node, [originalUnit8Array.length]);
          const copyUnit8Array = new Uint8Array(<DCArrayBuffer>node.target);
      
          for (const [index, value] of originalUnit8Array.entries()) {
            copyUnit8Array[index] = value;
          }
        }
        break;
  
      case 'date':
        this.constructInstance(node, [+node.value]);
        break;
  
      case 'dataview':
        this.constructInstance(node, [(node.value as DataView).buffer]);
        break;
  
      case 'regexp':
        this.constructInstance(node, [(node.value as RegExp).source, (node.value as RegExp).flags]);
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._selectedRoot.target;
  }

  get selectedRoot() {
    return this._selectedRoot;
  }

  selectRootByIndex(index: number) {
    this._selectedRoot = this._roots[index];
    return this._selectedRoot;
  }

  get rawCloneOptions() {
    return this._rawOptions as LCloneOptions;
  }

  get rawCombineOptions() {
    return this._rawOptions as LCombineOptions;
  }

  get finalCloneOptions() {
    return this._finalOptions as LFinalCloneOptions;
  }

  get finalCombineOptions() {
    return this._finalOptions as LFinalCombineOptions;
  }

  get roots() {
    return this._roots;
  }

  private constructInstance(
    node: LNode, 
    params: unknown[] = []
    ): void {
    const { summary: { finalCloneOptions }, isItAPrimitive, value, customizerParams } = node;

    const result = finalCloneOptions.creator ? finalCloneOptions.creator(customizerParams) : BY_DEFAULT;

    if (result === BY_DEFAULT) {
      node.target = isItAPrimitive ? value : Reflect.construct(value.constructor, params);
    } else {
      node.target = result;
    }
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  private validateAndBuildOptions(operation: OperationType, rawOptions: RawOptions = {},) {
    const optionsType = typeof rawOptions;

    if (!['undefined', 'object'].includes(optionsType)) {
      throw new TypeError(`The ${operation}() options must be an object.`);
    }

    const finalOptions = operation === 'clone' ? { ...DefaultCloneOptions } : { ...DefaultCombineOptions };

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
          if (!OutputTypeSet.includes(optionValue as LOutputType)) {
            throw new TypeError(
              `Invalid value of the optional ${operation}() option "output". ` +
              `Possible values are ${quotedListFromArray(OutputTypeSet)}.`
            );
          }
          finalOptions.output = optionValue as RawOptions['output'];
          break;

        case 'customizer':
        case 'creator':
          if (typeof optionValue !== 'function') {
            throw new TypeError(
              `If optional ${operation}() option "${optionName}" is present, it must be a function.`
            );
          }
          finalOptions[optionName] = optionValue as LFinalCloneOptions['customizer'];
          break;

        default:
          if (optionName === 'actions' && operation === 'combine') {
            if (!Array.isArray(optionValue)) {
              throw new TypeError(
                `If optional ${operation}() option "actions" is present, it must be an array.`
              );
            }

            (finalOptions as LFinalCombineOptions).actions = optionValue.map((rawAction) => {
              return new FinalAction(rawAction as LAction) 
            });
          } else {
            throw new TypeError(
              `Unknown ${operation}() "${optionName}" option. Valid options are ${quotedListFromArray(
                Object.keys(operation === 'clone' ? DefaultCloneOptions : DefaultCombineOptions)
              )}.`
            );
          }
      }
    }

    if (operation === 'combine') {
      (finalOptions as LFinalCombineOptions).actions.push(
        new FinalAction({ coverage: 'all', actor: 'merge' })
      );
    }

    return finalOptions;
  }

  private initRoots(rawData: any[]): void {
    for (const [index, value] of rawData.entries()) {
      const node = LenkaNode.createRootNode({
        value,
        index,
        summary: this,
      });

      this._roots.push(node);
    }

    if (rawData.length === 1) {
      this._selectedRoot = this._roots[0];
    }
  }

  private getNodeByLabel(label: number) {
    if (typeof label !== 'number') {
      throw new TypeError('Parameter of setByLabel/deleteByLabel functions must be a number.');
    }

    if (!this._allNodes.has(label)) {
      throw new TypeError('Invalid parameter of setByLabel/deleteByLabel functions (unknown label).');
    }

    return this._allNodes.get(label);
  }

  private _operation: OperationType;

  private _label: number;

  private _valuesToLabels: Map<unknown, number>;

  private _allNodes: Map<LNode['label'], LNode>;

  private _roots: LNode[];

  private _selectedRoot: LNode;

  private _rawOptions: RawOptions;

  private _finalOptions: FinalOptions;
}
