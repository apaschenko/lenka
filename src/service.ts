// eslint-disable-next-line prettier/prettier
type Extends<T, U extends T> = U;

export const BY_DEFAULT = Symbol('BY_DEFAULT');
export const MISSING = Symbol('MISSING');

const PrimitiveTypesSet = [
  'boolean',
  'undefined',
  'symbol',
  'string',
  'number',
  'bigint',
  'null',
] as const;

type PrimitiveType = typeof PrimitiveTypesSet[number];

const ReducedObjTypesSet = [
  'date',
  'regexp',
  'function',
  'dataview',
  'arraybuffer',
] as const;

const VocabulariesSet = ['array', 'map', 'object'] as const;

type VocabulariesTypes = typeof VocabulariesSet[number];

const CollectionsSet = [...VocabulariesSet, 'set'] as const; // Yes, all the vocabularies are collections too.

type CollectionsTypes = typeof CollectionsSet[number];

const Vocabulary = 'vocabulary' as const;

const Collection = 'collection' as const;

const All = 'all' as const;

const Asterisk = '*' as const;

const PredefActCoverSet = [...CollectionsSet, Vocabulary, Collection, All, Asterisk] as const;

type PredefActCoverTypes = typeof PredefActCoverSet[number];

const PredefinedActorsSet = ['replace', 'merge', 'union', 'diff'] as const;

export type PredefinedActors = typeof PredefinedActorsSet[number];

type ReducedObjType = typeof ReducedObjTypesSet[number];

type InternalExtendedObjType = typeof CollectionsSet[number];

const MetaTypeSet = ['vocabulary', 'collection', 'primitive'] as const;

export type MetaType = typeof MetaTypeSet[number];

type PieceType = PrimitiveType | ReducedObjType | InternalExtendedObjType;

type ExtendedPieceType = PieceType | typeof MISSING;

type AccumulatorType = Record<PropertyKey, any>;

const OutputTypeSet = ['simple', 'verbose'] as const;

type OutputType = typeof OutputTypeSet[number];

interface GeneralOptions {
  accumulator: AccumulatorType;
  output: OutputType;
  descriptors: boolean;
}

export interface FinalCloneOptions extends GeneralOptions {
  customizer: ((params: CustomizerParams) => unknown) | null;
}

export interface FinalCombineOptions extends GeneralOptions {
  actions: Action[];
}

export type CloneOptions = Partial<FinalCloneOptions>;

export type CombineOptions = Partial<FinalCombineOptions>;

type RawOptions = CloneOptions | CombineOptions;

type FinalOptions = FinalCloneOptions | FinalCombineOptions;

export type OperationType = 'combine' | 'clone';

export type TypeChecker = (combineSource: CombineSource) => boolean;

export type ActionCoverageSingle = PredefActCoverTypes | TypeChecker;

export type ActionCoverageArr = [ActionCoverageSingle, ActionCoverageSingle];

interface DCArrayBuffer extends ArrayBuffer {
  prototype: {
    slice: (start, end) => ArrayBuffer
  }
}

const TypeCheckers: Record<PredefActCoverTypes, TypeChecker> = {
  object: (combineSource: CombineSource) => { return combineSource._internalType === 'object'; },
  array: (combineSource: CombineSource) => { return combineSource._internalType === 'array'; },
  map: (combineSource: CombineSource) => { return combineSource._internalType === 'map'; },
  set: (combineSource: CombineSource) => { return combineSource._internalType === 'set'; },
  collection: (combineSource: CombineSource) => {
    return CollectionsSet.includes(combineSource._internalType as CollectionsTypes);
  },
  vocabulary: (combineSource: CombineSource) => {
    return VocabulariesSet.includes(combineSource._internalType as VocabulariesTypes);
  },
  [All]: () => { return true; },
  [Asterisk]: () => { return true; },
};

const PredefinedActorFunctions: Record<PredefinedActors, Actor> = {
  merge: () => { return BY_DEFAULT; },
  replace: () => { return BY_DEFAULT; },
  union: () => { return BY_DEFAULT; },
  diff: () => { return BY_DEFAULT; },
}

const DefaultCloneOptions: FinalCloneOptions = {
  accumulator: {},
  customizer: null,
  output: 'simple',
  descriptors: false,
};

const DefaultCombineOptions: FinalCombineOptions = {
  accumulator: {},
  actions: [],
  output: 'simple',
  descriptors: false,
};

export const ProducedAsIntSet = ['key', 'property', 'value'] as const;

type ProducedAsInt = typeof ProducedAsIntSet[number];
export type ProducedAs = ProducedAsInt | 'root';

type PieceTypeWithRP = Extends<PieceType, 'array' | 'arraybuffer' | 'dataview' | 'regexp'>;

const restrictedProperties: Record<PieceTypeWithRP, Set<string>> = {
  array: new Set(['length']),
  arraybuffer: new Set(['byteLength', 'maxByteLength', 'resizable']),
  dataview: new Set(['buffer', 'byteLength', 'byteOffset']),
  regexp: new Set([
    'dotAll', 'flags', 'global', 'hasIndices', 'ignoreCase', 'multiline', 'source', 'sticky', 'unicode'
  ]),
};

type ChildrenProducedByArr = Node['_producedBy'][];

type ChildrenList = Map<Node['_producedBy'], Child[]>;

type Children<T> = Record<ProducedAsInt, T>;

export type ChildrenKeys = Children<ChildrenProducedByArr>;

export type CombineChildren = Children<ChildrenList>;

function quotedListFromArray(array: readonly string[]) {
  return array.map((keyName) => { return '"' + keyName + '"' }).join(', ');
}

export class Node {
  constructor(value: Node['_value'], summary: Summary) {
    this._summary = summary;

    this.setValueAndType(value);

    this._isItCustomized = false;
    this._isItMissed = false;
    this._isItProcessed = false;
    this._isItADouble = summary.hasValue(value); 
  }

  static createRootNode(params: {
    value: Node['_value'];
    summary: Node['summary'];
    index: Node['_index'];
  }): Node {
    const { value, summary, index } = params;

    const node = new Node(value, summary);

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

  static emptyChildrenSet<T>(init: () => T): Children<T> {
    return ProducedAsIntSet.reduce((acc, keyType) => {
      acc[keyType] = init();
      return acc;
    }, {} as Children<T>);
  }

  addToNodesToLabels() {
    this._summary.addToNodesToLabels(this);
  }

  setFlags() {
    this._isItMissed = this._target === MISSING;
    this._isItADouble = this._summary.hasValue(this._value);

    this._isItCustomized = this.summary.cloneOptions.customizer
      && this.target !== BY_DEFAULT;

    this._isItProcessed = this._isItCustomized
      || this._isItAPrimitive
      || this._isItADouble
      || this._isItMissed;

    if (!this._isItCustomized && (this._isItAPrimitive || this._isItADouble)) {
      this._target = this._value;
    }
  }

  createChild(producedBy: unknown, producedAs: ProducedAs, parentTarget?: Node) {
    const summary = this._summary;
    let value;

    switch (producedAs) {
      case 'key':
        value = (this.value as Map<unknown, unknown>).get(producedBy);
        break;
      case 'property':
        value = (this.value as object)[producedBy as string];
        break;
      case 'value':
        value = producedBy;
        break;
      default:
        throw new TypeError(`Internal error S01`);
    }

    const child = new Node(value, summary);

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

  createInstance() {
    this._summary.createTargetInstance(this);
  }

  get value() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._value;
  }

  get type() {
    return this._type;
  }

  get childKeys() {
    const childKeys: ChildrenKeys = Node.emptyChildrenSet<ChildrenProducedByArr>(() => {
      return [];
    });

    if (this._isItAPrimitive) {
      return childKeys;
    }

    for (const producedBy of Reflect.ownKeys(this.value as object)) {
      if (!restrictedProperties[this._type as PieceTypeWithRP]?.has(producedBy as string)) {
        childKeys.property.push(producedBy);
      }
    }

    const isSet = this._type === 'set';

    if (isSet || this._type === 'map') {
      for (const producedBy of (this.value as Set<any>).keys()) {
        childKeys[isSet ? 'value' : 'key'].push(producedBy);
      }
    }

    return childKeys;
  }

  get parentNode() {
    return this._parentNode;
  }

  set parentNode(parent: Node) {
    this._parentNode = parent;
  }

  get parentTarget() {
    return this._parentTarget;
  }

  set parentTarget(parent: Node) {
    this._parentTarget = parent;
  }

  get root() {
    return this._root;
  }

  set root(root: Node) {
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
  }

  private _value: any;

  private _type: ExtendedPieceType;

  private _parentNode: Node;

  private _parentTarget: Node;

  private _root: Node;

  private _target: any;

  private _index: number;

  private _level: number;

  private _label: number;

  private _producedBy: any;

  private _producedAs: ProducedAs;

  private _summary: Summary;

  private _isItADouble: boolean;

  private _isItAPrimitive: boolean;

  private _isItCustomized: boolean;

  private _isItMissed: boolean;

  private _isItProcessed: boolean;
};

export class Results {
  constructor(summary: Summary) {
    this._summary = summary;
  }

  setByLabel: (label: number, value: any) => void = this._setByLabel.bind(this);

  deleteByLabel: (label: number) => void = this._deleteByLabel.bind(this);

  get accumulator() {
    return this._summary.accumulator;
  }

  // deprecated
  get options() {
    return this._summary.cloneOptions;
  }

  get cloneOptions() {
    return this._summary.cloneOptions;
  }

  get combineOptions() {
    return this._summary.combineOptions;
  }

  get result() {
    return this._summary.result;
  }

  private _deleteByLabel(label: number): void {
    return this._summary.deleteByLabel(label);
  }

  private _setByLabel(label: number, rawData: unknown): void {
    return this._summary.setByLabel(label, rawData);
  }

  private _summary: Summary;
}

export type Actor = (params: CombineParams) => typeof BY_DEFAULT;

export class Action {
  constructor(coverage: ActionCoverageSingle | ActionCoverageArr, actor: Actor | PredefinedActors) {
    if (Array.isArray(coverage)) {
      if (coverage.length !== 2) {
        throw new TypeError(
          'When stock coverage is specified as an array, that array must include exactly two elements: ' +
          'coverage for the first and second parameters.');
      }

      this._coverage = coverage.map((item) => {
        return this.singleCoverageCheck(item);
      });
    } else {
      const finalCoverage = this.singleCoverageCheck(coverage);
      this._coverage = [finalCoverage, finalCoverage];
    }

    switch (typeof actor) {
      case 'function':
        this._actor = actor;
        break;

      case 'string':
        if (!PredefinedActorsSet.includes(actor)) {
          throw new TypeError(
            `Unknown predefined actor "${actor}". Valid values are ${quotedListFromArray(PredefinedActorsSet)}`
          );
        }
        this._actor = PredefinedActorFunctions[actor];
        break;

      default:
        throw new TypeError(
          `Actor can't be a ${typeof actor}. It must be either a ` +
          `function or a string representing one of the preset values.`
        );
    }
  }

  tryToRun(params: CombineParams) {
    return params.bases.every((source, index) => { return this._coverage[index](source); })
      ? { skipped: false, result: this._actor(params), }
      : { skipped: true, result: null, };
  }

  private singleCoverageCheck(coverage: ActionCoverageSingle) {
    switch (typeof coverage) {
      case 'function':
        return coverage;

      case 'string':
        if (!PredefActCoverSet.includes(coverage)) {
          throw new TypeError(
            `Unknown action coverage value "${coverage}". Valid options are ` +
            `${quotedListFromArray(PredefActCoverSet)}.`
          );
        }
        return TypeCheckers[coverage];

      default:
        throw new TypeError(
          `Action coverage can't be a ${typeof coverage}. It must be either ` +
          `a function or a string representing one of the preset values.`
        );
    }
  }

  private _coverage: TypeChecker[];

  private _actor: Actor;
}

export class Summary {
  constructor(rawData: unknown[], operation: OperationType, rawOptions?: RawOptions) {
    this._valuesToLabels = new Map();
    this._allNodes = new Map();
    this._roots = [];
    this._label = 0;
    this._operation = operation;

    this._finalOptions = this.validateAndBuildOptions(operation, rawOptions);

    this.initRoots(rawData);
  }

  addToAllNodes(node: Node) {
    node.label = this.getAndIncreaceLabel();
    this._allNodes.set(node.label, node);
  }

  addToNodesToLabels(node: Node) {
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

  setAndGetResult(result: unknown) {
    this._result = result;
    return new Results(this);
  }

  getAndIncreaceLabel() {
    return this._label++;
  }

  setByLabel(label: number, rawData: unknown) {
    this.checkLabel(label);

    const node = this._allNodes.get(label);

    if (node.producedAs === 'root') {
      throw new TypeError(
        "You can't change a root node value (the whole cloning result) with" +
        " setByLabel method! Instead, use new value directly in your code."
      );
    }

    const parentTarget = node.parentTarget.target;

    switch (node.producedAs) {
      case 'key':
        (parentTarget as Map<unknown, unknown>).set(node.producedBy, rawData);
        break;

      case 'property':
        (parentTarget as object)[node.producedBy] = rawData;
        break;

      case 'value':
        (parentTarget as Set<unknown>).delete(node.target);
        (parentTarget as Set<unknown>).add(rawData);
        break;
    }

    node.target = rawData;
  }

  deleteByLabel(label: number): void {
    this.checkLabel(label);

    const node = this._allNodes.get(label);

    if (node.producedAs === 'root') {
      throw new TypeError("You can't delete a root node (the whole cloning result)!");
    }

    const parentTarget = node.parentTarget.target;

    switch (node.producedAs) {
      case 'key':
        (parentTarget as Map<unknown, unknown>).delete(node.producedBy);
        break;

      case 'property':
        delete (parentTarget as object)[node.producedBy];
        break;

      case 'value':
        (parentTarget as Set<unknown>).delete(node.target);
        break;
    }

    node.target = MISSING;
  }

  createTargetInstance(node: Node) {
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
    return this._result;
  }

  get cloneOptions() {
    return this._finalOptions as FinalCloneOptions;
  }

  get combineOptions() {
    return this._finalOptions as FinalCombineOptions;
  }

  get roots() {
    return this._roots;
  }

  private constructInstance(
    node: Node, 
    params: unknown[] = []
    ): void {
    node.target = node.isItAPrimitive
      ? node.value
      : Reflect.construct(node.value.constructor, params);
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
          if (!OutputTypeSet.includes(optionValue as OutputType)) {
            throw new TypeError(
              `Invalid value of the optional ${operation}() option "output". ` +
              `Possible values are ${quotedListFromArray(OutputTypeSet)}`
            );
          }
          finalOptions.output = optionValue as RawOptions['output'];
          break;

        default:
          if (optionName === 'customizer' && operation === 'clone') {
            if (typeof optionValue !== 'function') {
              throw new TypeError(
                `If optional ${operation}() option "customizer" is present, it must be a function.`
              );
            }
            (finalOptions as FinalCloneOptions).customizer = optionValue as FinalCloneOptions['customizer'];
          } else if (optionName === 'actions' && operation === 'combine') {
            if (!Array.isArray(optionValue)) {
              throw new TypeError(
                `If optional ${operation}() option "actions" is present, it must be an array.`
              );
            }

            for (const action of optionValue) {
              if (!(action instanceof Action)) {
                throw new TypeError(
                  `Each action in the "actions" array must be an Action() instance.`
                );
              }
            }

            (finalOptions as FinalCombineOptions).actions = optionValue;
          } else {
            throw new TypeError(
              `Unknown ${operation}() "${optionName}" option. Valid options are ${quotedListFromArray(
                Object.keys(operation === 'clone' ? DefaultCloneOptions : DefaultCombineOptions)
              )}`
            );
          }
      }
    }

    return finalOptions;
  }

  private initRoots(rawData: any[]): void {
    for (const [index, value] of rawData.entries()) {
      const node = Node.createRootNode({
        value,
        index,
        summary: this,
      });

      this._roots.push(node);
    }
  }

  private checkLabel(label: number): void {
    if (typeof label !== 'number') {
      throw new TypeError('Parameter of setByLabel/deleteByLabel functions must be a number.');
    }

    if (!this._allNodes.has(label)) {
      throw new TypeError('Invalid parameter of setByLabel/deleteByLabel functions (unknown label).');
    }
  }

  private _operation: OperationType;

  private _label: number;

  private _valuesToLabels: Map<unknown, number>;

  private _allNodes: Map<Node['_label'], Node>;

  private _roots: Node[];

  private _result: unknown;

  private _finalOptions: FinalOptions;
}

export class CustomizerParams {
  constructor(node: Node) {
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
      ? new CustomizerParams(this._node.parentNode)
      : null;
  }

  get root() {
    return new CustomizerParams(this._node.root);
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
    return this._node.summary.combineOptions;
  }

  protected _node: Node;
}

export class CombineSource extends CustomizerParams {
  constructor(node: Node, combineParams: CombineParams) {
    super(node);
    this._combineParams = combineParams;
  }

  select() {
    this._combineParams.selectBase(this);
  }

  get _internalType() {
    return this._node.type;
  }

  get childKeys() {
    return this._node.childKeys;
  }

  private _combineParams: CombineParams;
}

export class Child {
  constructor(
    combineParams: CombineParams,
    index: number,
    producedBy: Node['_producedBy'],
    producedAs: ProducedAsInt,
  ) {
    this._combineParams = combineParams;
    this._index = index;
    this._key = producedBy;
    this._producedAs = producedAs;
    this._label = this._combineParams.getNextLabel();
  }

  add() {
    this._combineParams.addChild(this);
    return this._label;
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

  get label() {
    return this._label;
  }

  private _combineParams: CombineParams;

  private _index: number;

  private _key: Node['_producedBy'];

  private _producedAs: ProducedAsInt;

  private _label: Node['_label'];
}

export class CombineParams {
  constructor(summary: Summary, nodes: Node[]) {
    this._summary = summary;
    this._nodes = nodes;
    // eslint-disable-next-line @typescript-eslint/no-this-alias, unicorn/no-this-assignment
    const combineParams = this;
    this._combineSources = nodes.map((node) => { return new CombineSource(node, combineParams); });
    this.buildSchemeAndResult();
  }

  addChild(child: Child) {
    const resultTyped = this._result[child.producedAs];

    if (resultTyped.has(child.key)) {
      resultTyped.get(child.key).push(child);
    } else {
      resultTyped.set(child.key, [child]);
    }

    return child.label;
  }

  getNextLabel() {
    return this._summary.getAndIncreaceLabel();
  }

  selectBase(combineSource: CombineSource) {
    this._selectedBase = combineSource;
  }

  get bases() {
    return this._combineSources;
  }

  private buildSchemeAndResult() {
    this._scheme = Node.emptyChildrenSet<ChildrenList>(() => {
      return new Map();
    });

    this._result = Node.emptyChildrenSet<ChildrenList>(() => {
      return new Map();
    });

    for (const keyType of ProducedAsIntSet) {
      const schemeTyped = this._scheme[keyType];

      for (const base of this._nodes) {
        for (const producedBy of base[keyType]) {
          const child = new Child(this, base.index, producedBy, keyType);

          if (schemeTyped.has(producedBy)) {
            schemeTyped.get(producedBy).push(child);
          } else {
            schemeTyped.set(producedBy, [child]);
          }
        }
      }
    }
  }

  private _nodes: Node[];

  private _combineSources: CombineSource[];

  private _summary: Summary;

  private _selectedBase: CombineSource;

  private _scheme: CombineChildren;

  private _result: CombineChildren;
}
