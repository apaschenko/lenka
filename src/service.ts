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
  MISSING,
] as const;

type PrimitiveType = typeof PrimitiveTypesSet[number];

const ReducedObjTypesSet = [
  'date',
  'regexp',
  'function',
  'dataview',
  'arraybuffer',
] as const;

const VocabularyTypesSet = ['array', 'map', 'object'] as const;

type InternalVocabularies = typeof VocabularyTypesSet[number];

const CollectionTypesSet = [...VocabularyTypesSet, 'set'] as const; // Yes, all the vocabularies are collections too.

type InternalCollections = typeof CollectionTypesSet[number];

const VocabularyType = 'vocabulary' as const;

const CollectionType = 'collection' as const;

type ParamsVocabularies = InternalVocabularies | typeof VocabularyType;

type ParamsCollections = InternalCollections | typeof CollectionType;

//const ParamsExtendedObjTypesSet = [...CollectionTypesSet, VocabularyType, CollectionType] as const;

const ParamsCollectionActionsSet = ['replace', 'union', 'diff'] as const;

const ParamsVocabularyActionSet = [...ParamsCollectionActionsSet, 'stack'] as const;

const InternalCollectionActionsSet = [
  ...ParamsCollectionActionsSet,
  'collectionsMerge',
  'collectionsDiff'
] as const;

const InternalVocabularyActionsSet = [
  ...InternalCollectionActionsSet,
  'vocabulariesMerge',
  'vocabulariesDiff'
] as const;

type ReducedObjType = typeof ReducedObjTypesSet[number];

export type InternalExtendedObjType = typeof CollectionTypesSet[number];

const MetaTypeSet = ['vocabulary', 'collection', 'primitive'] as const;

export type MetaType = typeof MetaTypeSet[number];

export type ParamsCollectionAction = typeof ParamsCollectionActionsSet[number];

export type ParamsVocabularyAction = typeof ParamsVocabularyActionSet[number];

type InternalCollectionAction = typeof InternalCollectionActionsSet[number];

type InternalVocabularyAction = typeof InternalVocabularyActionsSet[number];

type ParamsCollectionsActions = {
  [type in ParamsCollections]: ParamsCollectionAction; 
}

type ParamsVocabulariesActions = {
  [type in ParamsVocabularies]: ParamsVocabularyAction;
}

type ParamsActions = ParamsCollectionsActions | ParamsVocabulariesActions;

type InternalCollectionsActions = {
  [type in InternalCollections]: InternalCollectionAction;
}

type InternalVocabulariesActions = {
  [type in InternalVocabularies]: InternalVocabularyAction;
}

type InternalActions = InternalCollectionsActions | InternalVocabulariesActions;

type PieceType = PrimitiveType | ReducedObjType | InternalExtendedObjType;

export interface FinalCloneOptions {
  customizer?: (params: CustomizerParams) => unknown;
  accumulator: Record<PropertyKey, any>;
  output: 'simple' | 'verbose';
  descriptors: boolean;
}

export type RawCloneOptions = Partial<FinalCloneOptions>;

export type CloneOptions = RawCloneOptions;

interface GeneralCombineOptions {
  accumulator: FinalCloneOptions['accumulator'];
}
interface FinalCombineOptions extends GeneralCombineOptions {
  actions: InternalActions;
}

interface RawCombineOptions extends GeneralCombineOptions {
  actions: ParamsActions;
}

type ProducedAs = 'key' | 'property' | 'value' | 'root';

type SourceChildPart = Pick<Source, 'producedBy' | 'producedAs' | 'value' | 'index'>;

type PieceTypeWithRP = Extends<PieceType, 'array' | 'arraybuffer' | 'dataview' | 'regexp'>;

const restrictedProperties: Record<PieceTypeWithRP, Set<string>> = {
  array: new Set(['length']),
  arraybuffer: new Set(['byteLength', 'maxByteLength', 'resizable']),
  dataview: new Set(['buffer', 'byteLength', 'byteOffset']),
  regexp: new Set([
    'dotAll', 'flags', 'global', 'hasIndices', 'ignoreCase', 'multiline', 'source', 'sticky', 'unicode'
  ]),
};

export class Source {
  constructor(value: Source['_value']) {
    this.setValueAndType(value);
    this.buildChildrenPartial();

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

  createChild(producedBy: unknown, producedAs: ProducedAs): Source {
    let value: unknown;

    if (this._isItAPrimitive) {
        value = MISSING;
    } else {
      switch (producedAs) {
        case 'key':
          value = (this._value as Map<unknown, unknown>).get(producedBy);
          break;
        case 'property':
          value = (this._value as object)[producedBy as string];
          break;
        case 'value':
          value = producedBy;
          break;
        default:
          throw new TypeError(`Internal error S01`);
      }
    }
  
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

  get childrenPartial() {
    return this._childrenPartial;
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

  private buildChildrenPartial(): void {
    this._childrenPartial = [];

    if (this._isItAPrimitive) {
      return;
    }

    for (const producedBy of Reflect.ownKeys(this.value as object)) {
      if (!restrictedProperties[this._type as PieceTypeWithRP]?.has(producedBy as string)) {
        this._childrenPartial.push({
          producedBy,
          value: this._value[producedBy],
          producedAs: 'property',
          index: this._index,
        })
      }
    }

    const isSet = this._type === 'set';
    const isMap = this._type === 'map';

    if (isSet || isMap) {
      for (const [producedBy, value] of (this.value as Set<any>).entries()) {
        this.childrenPartial.push({
          producedBy,
          value,
          producedAs: isSet ? 'value' : 'key',
          index: this._index,
        })
      }
    }
  }

  private _value: any;

  private _type: PieceType;

  private _parentSource: Source;

  private _childrenPartial: SourceChildPart[];

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

  get accumulator() {
    return this._summary.accumulator;
  }

  get options() {
    return this._summary.rawCloneOptions;
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

  private

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
