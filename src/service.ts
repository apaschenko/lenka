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

type FinalCollections = typeof FinalCollectionsSet[number];

const Vocabulary = 'vocabulary' as const;

const Collection = 'collection' as const;

type MetaSetsTypes = typeof Vocabulary | typeof Collection;

type RawVocabularies = FinalVocabularies | typeof Vocabulary;

type RawCollections = FinalCollections | typeof Collection;

const RawExtendedObjTypesSet = [...FinalCollectionsSet, Vocabulary, Collection] as const;

type RawExtendedObjType = typeof RawExtendedObjTypesSet[number];

const ActionCollectionSet = ['replace', 'union', 'diff'] as const;

const ActionVocabularySet = [...ActionCollectionSet, 'stack'] as const;

type ActionCollection = typeof ActionCollectionSet[number];

type ActionVocabulary = typeof ActionVocabularySet[number];

type ReducedObjType = typeof ReducedObjTypesSet[number];

export type InternalExtendedObjType = typeof FinalCollectionsSet[number];

const MetaTypeSet = ['vocabulary', 'collection', 'primitive'] as const;

export type MetaType = typeof MetaTypeSet[number];

type RawCollectionsActionsByType = {
  [type in RawCollections]: ActionCollection; 
}

type RawVocabulariesActionsByType = {
  [type in RawVocabularies]: ActionVocabulary;
}

type RawActionsByType = RawCollectionsActionsByType | RawVocabulariesActionsByType;

type FinalCollectionsActionsByType = {
  [type in FinalCollections]: ActionCollection;
}

type FinalVocabulariesActionsByType = {
  [type in FinalVocabularies]: ActionVocabulary;
}

type FinalActionsByType = FinalCollectionsActionsByType | FinalVocabulariesActionsByType;

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
  actions: FinalActionsByType;
} = {
  accumulator: {},
  // eslint-disable-next-line unicorn/prefer-object-from-entries
  actions: FinalCollectionsSet.reduce((acc, type) => {
    acc[type] = 'replace';
    return acc;
  }, {}) as FinalActionsByType,
} as const;

const ValidRawCombineKeys = Object.keys(FinalCmbOptsDefaults);

interface GeneralCombineOptions {
  accumulator: FinalCloneOptions['accumulator'];
}

type FinalCombineOptions = typeof FinalCmbOptsDefaults;

export interface RawCombineOptions extends GeneralCombineOptions {
  actions: RawActionsByType;
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
  constructor(value: Source['_value'], summary: Summary) {
    this._summary = summary;

    this.setValueAndType(value);

    this._isItCustomized = false;
    this._isItMissed = false;
    this._isItProcessed = false;
    this._isItADouble = summary.hasValue(value); 
  }

  static createRootSource(params: {
    value: Source['_value'];
    summary: Source['summary'];
    index: Source['_index'];
  }): Source {
    const { value, summary, index } = params;

    const source = new Source(value, summary);

    source._parentSource = null;
    source._root = source;
    source._index = index;
    source._level = 0;
    source._producedAs = 'root';
    source._summary = summary;
    source._isItADouble = summary.hasValue(value);
    summary.addToAllSources(source);

    return source;
  }

  addToSourcesToLabels() {
    this._summary.addToSourcesToLabels(this);
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
    if (!this._children) {
      this.createChildren();
    }

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

  private createChildren(): void {
    this._children = [];

    if (this._isItAPrimitive) {
      return;
    }

    for (const producedBy of Reflect.ownKeys(this.value as object)) {
      if (!restrictedProperties[this._type as PieceTypeWithRP]?.has(producedBy as string)) {
        this._children.push(this.createChild(producedBy, 'property'));
      }
    }

    const isSet = this._type === 'set';
    const isMap = this._type === 'map';

    if (isSet || isMap) {
      for (const producedBy of (this.value as Set<any>).keys()) {
        this._children.push(this.createChild(producedBy, isSet ? 'value' : 'key'));
      }
    }
  }

  private createChild(producedBy: unknown, producedAs: ProducedAs) {
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

    const child = new Source(value, summary);

    child._parentSource = this;
    child._root = this._root;
    child._index = this._index;
    child._level = this._level + 1;
    child._producedBy = producedBy;
    child._producedAs = producedAs;
    summary.addToAllSources(child);

    return child;
  }

  private _value: any;

  private _type: ExtendedPieceType;

  private _parentSource: Source;

  private _children: Source[];

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
    this._valuesToLabels = new Map();
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

  addToAllSources(source: Source) {
    source.label = this._allSources.length;
    this._allSources.push(source);
  }

  addToSourcesToLabels(source: Source) {
    if (!(
      this._valuesToLabels.has(source.value)
        || source.isItAPrimitive
        || source.isItMissed
      )) {
      this._valuesToLabels.set(source.value, source.label);
    }
  }

  getTargetByValue(rawData: unknown): unknown {
    return this._valuesToLabels.has(rawData)
      ? this._allSources[this._valuesToLabels.get(rawData)].target
      : null;
  }

  hasValue(rawData: unknown) {
    return this._valuesToLabels.has(rawData);
  }

  setAndGetResult(result: unknown) {
    this._result = result;
    return new Results(this);
  }

  setByLabel(label: number, rawData: unknown) {
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
      const action = rawActions[key] as ActionVocabulary;

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

  private replaceMetaAction(key: MetaSetsTypes, action: ActionVocabulary) {
    const metaSet = key === 'collection' ? FinalCollectionsSet : FinalVocabulariesSet;
    const finalActions = this._finalCombineOptions.actions;

    for (const type of metaSet) {
      finalActions[type] = action;
    }
  }

  private checkAction(type: RawExtendedObjType, action: ActionVocabulary): void {
    if (!FinalCollectionsSet.includes(type as FinalCollections)) {
      throw new TypeError(`Invalid key "${type}" in combine() options.ations keys. Valid keys are: ${
        quotedListFromArray(FinalCollectionsSet)
      }.`)
    }

    if (!ActionVocabularySet.includes(action)) {
      throw new TypeError(`Invalid action value "${action}" in combine() options.actions. Valid values are: ${
        quotedListFromArray(ActionVocabularySet)
      }.`)
    }

    if (!FinalVocabulariesSet.includes(type as FinalVocabularies) && 
      !ActionCollectionSet.includes(action as ActionCollection)) {
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

  private _valuesToLabels: Map<unknown, number>;

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
