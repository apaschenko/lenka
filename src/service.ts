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

const FinalVocabulariesSet = ['array', 'map', 'object'] as const;

type FinalVocabularies = typeof FinalVocabulariesSet[number];

const FinalCollectionsSet = [...FinalVocabulariesSet, 'set'] as const; // Yes, all the vocabularies are collections too.

type InternalCollections = typeof FinalCollectionsSet[number];

const Vocabulary = 'vocabulary' as const;

const Collection = 'collection' as const;

type MetaSetsTypes = typeof Vocabulary | typeof Collection;

type RawVocabularies = FinalVocabularies | typeof Vocabulary;

type RawCollections = InternalCollections | typeof Collection;

const RawExtendedObjTypesSet = [...FinalCollectionsSet, Vocabulary, Collection] as const;

type RawExtendedObjType = typeof RawExtendedObjTypesSet[number];

const RawActCollectionSet = ['replace', 'union', 'diff'] as const;

const MetaCollActionsSet = ['collectionReplace', 'collectionUnion', 'collectionDiff'] as const;

const RawActVocabularySet = [...RawActCollectionSet, 'stack'] as const;

const MetaVocActionsSet = ['vocabularyStack'] as const;

const FinalCollActionsSet = [
  ...RawActCollectionSet,
  ...MetaCollActionsSet,
] as const;

const FinalVocActionsSet = [
  ...FinalCollActionsSet,
  ...MetaVocActionsSet,
] as const;

type ReducedObjType = typeof ReducedObjTypesSet[number];

export type InternalExtendedObjType = typeof FinalCollectionsSet[number];

const MetaTypeSet = ['vocabulary', 'collection', 'primitive'] as const;

export type MetaType = typeof MetaTypeSet[number];

export type RawCollectionAction = typeof RawActCollectionSet[number];

export type RawVocabularyAction = typeof RawActVocabularySet[number];

type FinalCollectionAction = typeof FinalCollActionsSet[number];

type FinalVocabularyAction = typeof FinalVocActionsSet[number];

type ParamsCollectionsActions = {
  [type in RawCollections]: RawCollectionAction; 
}

type ParamsVocabulariesActions = {
  [type in RawVocabularies]: RawVocabularyAction;
}

type ParamsActions = ParamsCollectionsActions | ParamsVocabulariesActions;

type InternalCollectionsActions = {
  [type in InternalCollections]?: FinalCollectionAction;
}

type InternalVocabulariesActions = {
  [type in FinalVocabularies]?: FinalVocabularyAction;
}

type InternalActions = InternalCollectionsActions | InternalVocabulariesActions;

const ActionsReplacer: Record<RawVocabularyAction, FinalVocabularyAction> = {
  replace: 'collectionReplace',
  union: 'collectionUnion',
  diff: 'collectionDiff',
  stack: 'vocabularyStack',
};

type PieceType = PrimitiveType | ReducedObjType | InternalExtendedObjType;

type ExtendedPieceType = PieceType | typeof MISSING;

type AccumulatorType = Record<PropertyKey, any>;

export interface FinalCloneOptions {
  customizer?: (params: CustomizerParams) => unknown;
  accumulator: AccumulatorType;
  output: 'simple' | 'verbose';
  descriptors: boolean;
}

export type RawCloneOptions = Partial<FinalCloneOptions>;

export type CloneOptions = RawCloneOptions;

const FinalCmbOptsDefaults: {
  accumulator: AccumulatorType;
  actions: InternalActions;
} = {
  accumulator: {},
  actions: {},
} as const;

const ValidRawCombineKeys = Object.keys(FinalCmbOptsDefaults);

interface GeneralCombineOptions {
  accumulator: FinalCloneOptions['accumulator'];
}

type FinalCombineOptions = typeof FinalCmbOptsDefaults;

export interface RawCombineOptions extends GeneralCombineOptions {
  actions: ParamsActions;
}

type ProducedAs = 'key' | 'property' | 'value' | 'root';

type PieceTypeWithRP = Extends<PieceType, 'array' | 'arraybuffer' | 'dataview' | 'regexp'>;

const restrictedProperties: Record<PieceTypeWithRP, Set<string>> = {
  array: new Set(['length']),
  arraybuffer: new Set(['byteLength', 'maxByteLength', 'resizable']),
  dataview: new Set(['buffer', 'byteLength', 'byteOffset']),
  regexp: new Set([
    'dotAll', 'flags', 'global', 'hasIndices', 'ignoreCase', 'multiline', 'source', 'sticky', 'unicode'
  ]),
};

function quotedListFromArray(array: readonly string[]) {
  return array.map((keyName) => { return '"' + keyName + '"' }).join(', ');
}

export class Source {
  constructor(value: Source['_value']) {
    this.setValueAndType(value);

    this._children = [];
    this._isItCustomized = false;
    this._isItMissed = false;
    this._isItProcessed = false;
  }

  static createRootSource(params: {
    value: Source['_value'];
    summary: Source['summary'];
    index: Source['_index'];
  }): Source {
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

  createChildrenPart(): void {
    if (this._isItAPrimitive) {
     return;
   }

   for (const producedBy of Reflect.ownKeys(this.value as object)) {
     if (!restrictedProperties[this._type as PieceTypeWithRP]?.has(producedBy as string)) {
       // eslint-disable-next-line @typescript-eslint/no-use-before-define
       this._children.push(new ChildPart(this, producedBy, 'property'));
     }
   }

   const isSet = this._type === 'set';
   const isMap = this._type === 'map';

   if (isSet || isMap) {
     for (const producedBy of (this.value as Set<any>).keys()) {
       // eslint-disable-next-line @typescript-eslint/no-use-before-define
       this._children.push(new ChildPart(this, producedBy, isSet ? 'value' : 'key'));
     }
   }
 }

  addToSourcesToLabels(): void {
    this._summary.addToSourcesToLabels(this);
  }

  setFlags(): void {
    this._isItMissed = this._target === MISSING;

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

  createChildByChildPart(value: Source['_value'], producedBy: unknown, producedAs: ProducedAs): Source {
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

  set parentSource(parent: Source) {
    this._parentSource = parent;
  }

  get root() {
    return this._root;
  }

  set root(root: Source) {
    this._root = root;
  }

  get children() {
    return this._children;
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

  private _parentSource: Source;

  private _children: ChildPart[];

  private _root: Source;

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

export class ChildPart {
  constructor(parent: Source, producedBy: Source['_producedBy'], producedAs: Source['_producedAs']) {
    this._parent = parent;
    this._producedBy = producedBy;
    this._producedAs = producedAs;

    switch (producedAs) {
      case 'key':
        this._value = (parent.value as Map<unknown, unknown>).get(producedBy);
        break;
      case 'property':
        this._value = (parent.value as object)[producedBy as string];
        break;
      case 'value':
        this._value = producedBy;
        break;
      default:
        throw new TypeError(`Internal error S01`);
    }
  }

  createSource() {
    return this._parent.createChildByChildPart(this._value, this._producedBy, this._producedAs);
  }

  get producedBy(): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._producedBy;
  }

  get value() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._value;
  }

  get producedAs() {
    return this._producedAs;
  }

  get parent() {
    return this._parent;
  }

  private _value: Source['_value'];

  private _producedBy: Source['_producedBy'];

  private _producedAs: Source['_producedAs'];

  private _parent: Source;
}

export class Results {
  constructor(summary: Summary) {
    this._summary = summary;
  }

  get accumulator() {
    return this._summary.accumulator;
  }

  // deprecated
  get options() {
    return this._summary.rawCloneOptions;
  }

  get cloneOptions() {
    return this._summary.rawCloneOptions;
  }

  get combineOptions() {
    return this._summary.rawCombineOptions;
  }

  get result() {
    return this._summary.result;
  }

  setByLabel: (label: number, value: any) => void = this._setByLabel.bind(this);

  deleteByLabel: (label: number) => void = this._deleteByLabel.bind(this);

  private _deleteByLabel(label: number): void {
    return this._summary.deleteByLabel(label);
  }

  private _setByLabel(label: number, rawData: unknown): void {
    return this._summary.setByLabel(label, rawData);
  }

  private _summary: Summary;
}

export class Summary {
  constructor(rawData: unknown[], operation: 'clone' | 'combine', rawOptions?: RawCloneOptions | RawCombineOptions) {
    this._sourcesToLabels = new Map();
    this._allSources = [];
    this._roots = [];

    if (rawOptions?.accumulator instanceof Object) {
      this._accumulator = rawOptions.accumulator;
    } else {
      if ('undefined' === typeof rawOptions?.accumulator) {
        this._accumulator = {};
      } else {
        throw new TypeError('The accumulator must not be a primitive type.');
      }
    }

    if (operation === 'clone') {
      this._rawCloneOptions = rawOptions;
      this.buildCloneFinalOptions();
    } else {
      this._rawCombineOptions = rawOptions as RawCombineOptions;
      this.buildCombineFinalOptions();
    }

    this.initRoots(rawData);
  }

  addToAllSources(source: Source): void {
    source.label = this._allSources.length;
    this._allSources.push(source);
  }

  addToSourcesToLabels(source: Source): void {
    if (!(
      this._sourcesToLabels.has(source.value)
        || source.isItAPrimitive
        || source.isItMissed
      )) {
      this._sourcesToLabels.set(source.value, source.label);
    }
  }

  getTargetBySource(source: unknown): unknown {
    return this._sourcesToLabels.has(source)
      ? this._allSources[this._sourcesToLabels.get(source)].target
      : null;
  }

  setAndGetResult(result: unknown): Results {
    this._result = result;
    return new Results(this);
  }

  setByLabel(label: number, rawData: unknown): void {
    this.checkLabel(label);

    const source = this._allSources[label];

    if (source.producedAs === 'root') {
      throw new TypeError(
        "You can't change a root node value (the whole cloning result) with" +
        " setByLabel method! Instead, use new value directly in your code."
      );
    }

    const parentTarget = source.parentSource.target;

    switch (source.producedAs) {
      case 'key':
        (parentTarget as Map<unknown, unknown>).set(source.producedBy, rawData);
        break;

      case 'property':
        (parentTarget as object)[source.producedBy] = rawData;
        break;

      case 'value':
        (parentTarget as Set<unknown>).delete(source.target);
        (parentTarget as Set<unknown>).add(rawData);
        break;
    }

    source.target = rawData;
  }

  deleteByLabel(label: number): void {
    this.checkLabel(label);

    const source = this._allSources[label];

    if (source.producedAs === 'root') {
      throw new TypeError("You can't delete a root node (the whole cloning result)!");
    }

    const parentTarget = source.parentSource.target;

    switch (source.producedAs) {
      case 'key':
        (parentTarget as Map<unknown, unknown>).delete(source.producedBy);
        break;

      case 'property':
        delete (parentTarget as object)[source.producedBy];
        break;

      case 'value':
        (parentTarget as Set<unknown>).delete(source.target);
        break;
    }

    source.target = MISSING;
  }

  get accumulator() {
    return this._accumulator;
  }

  get result() {
    return this._result;
  }

  get rawCloneOptions() {
    return this._rawCloneOptions;
  }

  get finalCloneOptions() {
    return this._finalCloneOptions;
  }

  get rawCombineOptions() {
    return this._rawCombineOptions;
  }

  get finalCombineOptions() {
    return this._finalCombineOptions;
  }

  get roots() {
    return this._roots;
  }

  private buildCloneFinalOptions(): void {
    this._finalCloneOptions = {
      customizer: this._rawCloneOptions?.customizer,
      accumulator: this._rawCloneOptions?.accumulator || {},
      output: this._rawCloneOptions?.output || 'simple',
      descriptors: this._rawCloneOptions?.descriptors || false,
    }
  }

  private buildCombineFinalOptions(): void {
    this._finalCombineOptions = { ...FinalCmbOptsDefaults };

    if (!this._rawCombineOptions) {
      return;
    }

    if (typeof this._rawCombineOptions !== 'object') {
      throw new TypeError('combine() optional "options" parameter must be an object. Please see the docs.');
    }

    const rawKeys = Object.keys(this._rawCombineOptions) as unknown as (keyof RawCombineOptions)[];

    for (const key of rawKeys) {
      if (!ValidRawCombineKeys.includes(key)) {
        throw new TypeError(`Unknown combine() option. Valid options are: ${
          quotedListFromArray(ValidRawCombineKeys)
        }.`)
      }

      if (key === 'actions') {
        this.buildCombineFinalActions();
      } else {
        this._finalCombineOptions[key] = this._rawCombineOptions[key];
      }
    }
  }

  private buildCombineFinalActions(): void {
    const rawActions = this._rawCombineOptions.actions;

    if (typeof rawActions !== 'object') {
      throw new TypeError('combine() optional options.actions parameter must be an object. Please see the docs.');
    }

    const actionsKeys = Object.keys(rawActions) as RawExtendedObjType[];
    const keyCollector: Partial<FinalCombineOptions> = {};

    const refinedKeys = actionsKeys.reduce((kc, key) => {
      const action = rawActions[key];

      this.checkAction(key, action);
      if (key === 'collection' || key === 'vocabulary') {
        this.replaceMetaAction(key, action);
      } else {
        kc[key] = action;
      }

      return kc;
    }, keyCollector);

    this._finalCombineOptions.actions = { ...this._finalCombineOptions.actions, ...refinedKeys };
  }  

  private replaceMetaAction(key: MetaSetsTypes, action: RawVocabularyAction) {
    const metaSet = key === 'collection' ? FinalCollectionsSet : FinalVocabulariesSet;
    const finalActions = this._finalCombineOptions.actions;

    for (const type of metaSet) {
      finalActions[type] = ActionsReplacer[action];
    }
  }

  private checkAction(type: RawExtendedObjType, action: RawVocabularyAction): void {
    if (!FinalCollectionsSet.includes(type as InternalCollections)) {
      throw new TypeError(`Invalid key "${type}" in combine() options.ations keys. Valid keys are: ${
        quotedListFromArray(FinalCollectionsSet)
      }.`)
    }

    if (!RawActVocabularySet.includes(action)) {
      throw new TypeError(`Invalid action value "${action}" in combine() options.actions. Valid values are: ${
        quotedListFromArray(RawActVocabularySet)
      }.`)
    }

    if (!FinalVocabulariesSet.includes(type as FinalVocabularies) && 
      !RawActCollectionSet.includes(action as RawCollectionAction)) {
      throw new TypeError(`Action "${action}" is only allowed for vocabularies, but ${type} is not a vocabulary.`);
    }
  }

  private initRoots(rawData: any[]): void {
    for (const [index, value] of rawData.entries()) {
      const source = Source.createRootSource({
        value,
        index,
        summary: this,
      });

      this._roots.push(source);
    }
  }

  private checkLabel(label: number): void {
    if (typeof label !== 'number') {
      throw new TypeError('Parameter of setByLabel/deleteLabel functions must be a number.');
    }

    if (label > this._allSources.length || label < 0) {
      throw new TypeError('Invalid parameter of setByLabel/deleteLabel functions (out of range).');
    }
  }

  private _accumulator: FinalCloneOptions['accumulator'];

  private _sourcesToLabels: Map<unknown, number>;

  private _allSources: Source[];

  private _roots: Source[];

  private _result: unknown;

  private _rawCloneOptions: RawCloneOptions;

  private _finalCloneOptions: FinalCloneOptions;

  private _rawCombineOptions: RawCombineOptions;

  private _finalCombineOptions: FinalCombineOptions;
}

export class CustomizerParams {
  constructor(source: Source) {
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
    return this._source.summary.rawCloneOptions;
  }

  private _source: Source;
}
