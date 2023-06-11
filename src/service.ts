// eslint-disable-next-line prettier/prettier
export type TypeFromReadonlyArray<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
// eslint-disable-next-line @typescript-eslint/no-shadow
infer TypeFromReadonlyArray
>
? TypeFromReadonlyArray
: never

export const BY_DEFAULT = Symbol('BY_DEFAULT');
export const MISSING = Symbol('MISSING');

export type MissingType = typeof MISSING;

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

export type PrimitiveType = TypeFromReadonlyArray<typeof PrimitiveTypesSet>;

const ReducedObjTypesSet = [
  'date',
  'regexp',
  'function',
  'dataview',
  'arraybuffer',
] as const;

const VocabularyTypesSet = ['array', 'map', 'object'] as const;

// type Vocabularies = TypeFromReadonlyArray<typeof VocabularyTypesSet>;

const CollectionTypesSet = ['array', 'set', 'object'] as const; // Yes, arrays are vocabularies and collections

// type Collections = TypeFromReadonlyArray<typeof CollectionTypesSet>;

const InternalExtendedObjTypesSet = [...VocabularyTypesSet, ...CollectionTypesSet] as const;

const VocabularyType = 'vocabularies';

const CollectionType = 'collection';

const ParamsExtendedObjTypesSet = [...InternalExtendedObjTypesSet, VocabularyType, CollectionType] as const;

export const ParamsActionsSet = ['replace', 'merge', 'diff'] as const;

export const InternalActionsSet = [
  ...ParamsActionsSet,
  'vocabulariesMerge',
  'collectionsMerge',
  'vocabulariesDiff',
  'collectionsDiff'
] as const;

export type ReducedObjType = TypeFromReadonlyArray<typeof ReducedObjTypesSet>;

export type ParamsExtendedObjType = TypeFromReadonlyArray<typeof ParamsExtendedObjTypesSet>;

export type InternalExtendedObjType = TypeFromReadonlyArray<typeof InternalExtendedObjTypesSet>;

const MetaTypeSet = ['vocabulary', 'collection', 'primitive'] as const;

export type MetaType = TypeFromReadonlyArray<typeof MetaTypeSet>;

export type ParamsAction = TypeFromReadonlyArray<typeof ParamsActionsSet>;

export type InternalAction = TypeFromReadonlyArray<typeof InternalActionsSet>;

export type ParamsActions = {
  [type in ParamsExtendedObjType]?: ParamsAction;
}

export type InternalActions = {
  [type in InternalExtendedObjType]?: InternalAction;
}

export type PieceType = PrimitiveType | ReducedObjType | InternalExtendedObjType;

export interface FinalCloneOptions {
  customizer?: (params: CustomizerParams) => unknown;
  accumulator: Record<PropertyKey, any>;
  output: 'simple' | 'verbose';
  descriptors: boolean;
}

export type RawCloneOptions = Partial<FinalCloneOptions>;

export type CloneOptions = RawCloneOptions;

export interface AllCloneOptions {
  final: FinalCloneOptions,
  raw: RawCloneOptions,
}

export type ProducedAs = 'key' | 'property' | 'value' | 'root';

export class Source {
  constructor(summary: Summary) {
    this._summary = summary;
    this._producedAs = 'root';
  }

  createChild(producedBy: unknown, producedAs: ProducedAs): Source {
    let childRawData: unknown;

    if (this._isItAPrimitive) {
        childRawData = MISSING;
    } else {
      switch (producedAs) {
        case 'key':
          childRawData = (this._value as Map<unknown, unknown>).get(producedBy);
          break;
        case 'property':
          childRawData = (this._value as object)[producedBy as string];
          break;
        case 'value':
          childRawData = producedBy;
          break;
        default:
          throw new TypeError(`Internal error S01`);
      }
    }

    const prevTarget = this._summary.getTargetBySource(childRawData);
    const isItADouble = !!prevTarget;

    const child = new Source(this._summary);

    child.setValueAndType.call(child, childRawData);
    child._parentSource = this;
    child._root = this._root;
    child._index = this._index;
    child._level = this._level + 1;
    child._producedBy = producedBy;
    child._producedAs = producedAs;
    child._isItADouble = isItADouble;

    this._summary.addToAllSources(child);

    return child;
  }

  addToSourcesToLabels(): void {
    this._summary.addToSourcesToLabels(this);
  }

  // changeResult(result: any): void {
  //   if (this._parentSource) {
  //     this._target = result;

  //     switch (this._producedAs) {
  //       case 'property':
  //         (this._parentSource as object)[this._producedBy] = result;
  //         break;

  //         case 'key':
  //         (this._parentSource as unknown as Map<unknown, unknown>).set(this._producedBy, result);
  //         break;

  //       case 'value':
  //         (this._parentSource as unknown as Set<unknown>).delete(this._target);
  //         (this._parentSource as unknown as Set<unknown>).add(result);
  //         break;

  //       default:
  //         throw new TypeError(`Internal error S02`);
  //     }
  //   }
  // }

  setFlags(): void {
    this._isItMissed = this._target === MISSING;

    this._isItCustomized = this.summary.finalOptions.customizer
      && this.target !== BY_DEFAULT;

    this._isItProcessed = this._isItCustomized
      || this._isItAPrimitive
      || this._isItADouble
      || this._isItMissed;

    if (!this._isItCustomized && (this._isItAPrimitive || this._isItADouble)) {
      this._target = this._value;
    }
  }

  setValueAndType(value: unknown) {
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

  get value(): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._value;
  }

  get type(): PieceType {
    return this._type;
  }

  get parentSource(): Source {
    return this._parentSource;
  }

  set parentSource(parent: Source) {
    this._parentSource = parent;
  }

  get root(): Source {
    return this._root;
  }

  set root(root: Source) {
    this._root = root;
  }

  get target(): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._target;
  }

  set target(targetValue: unknown) {
    this._target = targetValue;
  }

  get index(): number {
    return this._index;
  }

  set index(index: number) {
    this._index = index;
  }

  get level(): number {
    return this._level;
  }

  set level(level: number) {
    this._level = 0;
  }

  get label(): number {
    return this._label;
  }

  set label(label: number) {
    this._label = label;
  }

  get producedBy(): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._producedBy;
  }

  get producedAs(): ProducedAs {
    return this._producedAs;
  }

  get isItADouble(): boolean {
    return this._isItADouble;
  }

  set isItADouble(isDouble: boolean) {
    this._isItADouble = isDouble;
  }

  get isItAPrimitive(): boolean {
    return this._isItAPrimitive;
  }

  // get isItCustomized(): boolean {
  //   return this._isItCustomized;
  // }

  get isItMissed(): boolean {
    return this._isItMissed;
  }

  get isItProcessed(): boolean {
    return this._isItProcessed;
  }

  // set isItProcessed(isProcessed: boolean) {
  //   this._isItProcessed = isProcessed;
  // }

  get summary(): Summary {
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

  private _value: any;

  private _type: PieceType;

  private _parentSource: Source;

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

  get accumulator(): FinalCloneOptions['accumulator'] {
    return this._summary.accumulator;
  }

  get options(): RawCloneOptions {
    return this._summary.rawOptions;
  }

  get result(): any {
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
  constructor(rawData: unknown[], rawOptions?: RawCloneOptions) {
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

    this._rawOptions = rawOptions;

    this.buildFinalOptions();

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

  get result(): unknown {
    return this._result;
  }

  get rawOptions(): RawCloneOptions {
    return this._rawOptions;
  }

  get finalOptions(): FinalCloneOptions {
    return this._finalOptions;
  }

  get roots() {
    return this._roots;
  }

  private buildFinalOptions(): void {
    this._finalOptions = {
      customizer: this.rawOptions?.customizer,
      accumulator: this.rawOptions?.accumulator || {},
      output: this.rawOptions?.output || 'simple',
      descriptors: this.rawOptions?.descriptors || false,
    }
  }

  private initRoots(rawData: any[]): void {
    for (const [index, raw] of rawData.entries()) {
      const source = new Source(this);
      source.setValueAndType(raw);
      source.parentSource = null;
      source.root = source;
      source.index = index;
      source.level = 0;
      source.isItADouble = false;

      this._roots.push(source);
      this.addToAllSources(source);
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

  private _rawOptions: RawCloneOptions;

  private _finalOptions: FinalCloneOptions;
}

export class CustomizerParams {
  constructor(source: Source) {
    this._source = source;
  }

  get value(): Source['value'] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._source.value;
  }

  get key(): Source['producedBy'] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._source.producedBy;
  }

  get parent(): CustomizerParams {
    return this._source.parentSource 
      ? new CustomizerParams(this._source.parentSource)
      : null;
  }

  get root(): CustomizerParams {
    return new CustomizerParams(this._source.root);
  }

  get index(): Source['index'] {
    return this._source.index;
  }

  get level(): Source['level'] {
    return this._source.level;
  }

  get label(): Source['label'] {
    return this._source.label;
  }

  get isItAdouble(): boolean {
    return this._source.isItADouble;
  }

  get isItAPrimitive(): boolean {
    return this._source.isItAPrimitive;
  }

  get accumulator(): FinalCloneOptions['accumulator'] {
    return this._source.summary.accumulator;
  }

  get options(): RawCloneOptions {
    return this._source.summary.rawOptions;
  }

  private _source: Source;
}
