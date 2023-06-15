export declare const BY_DEFAULT: unique symbol;
export declare const MISSING: unique symbol;
declare const PrimitiveTypesSet: readonly ["boolean", "undefined", "symbol", "string", "number", "bigint", "null", typeof MISSING];
declare type PrimitiveType = typeof PrimitiveTypesSet[number];
declare const ReducedObjTypesSet: readonly ["date", "regexp", "function", "dataview", "arraybuffer"];
declare const VocabularyTypesSet: readonly ["array", "map", "object"];
declare type InternalVocabularies = typeof VocabularyTypesSet[number];
declare const CollectionTypesSet: readonly ["array", "map", "object", "set"];
declare type InternalCollections = typeof CollectionTypesSet[number];
declare const VocabularyType: "vocabulary";
declare const CollectionType: "collection";
declare type ParamsVocabularies = InternalVocabularies | typeof VocabularyType;
declare type ParamsCollections = InternalCollections | typeof CollectionType;
declare const ParamsCollectionActionsSet: readonly ["replace", "union", "diff"];
declare const ParamsVocabularyActionSet: readonly ["replace", "union", "diff", "stack"];
declare type ReducedObjType = typeof ReducedObjTypesSet[number];
export declare type InternalExtendedObjType = typeof CollectionTypesSet[number];
declare const MetaTypeSet: readonly ["vocabulary", "collection", "primitive"];
export declare type MetaType = typeof MetaTypeSet[number];
export declare type ParamsCollectionAction = typeof ParamsCollectionActionsSet[number];
export declare type ParamsVocabularyAction = typeof ParamsVocabularyActionSet[number];
declare type ParamsCollectionsActions = {
    [type in ParamsCollections]: ParamsCollectionAction;
};
declare type ParamsVocabulariesActions = {
    [type in ParamsVocabularies]: ParamsVocabularyAction;
};
declare type ParamsActions = ParamsCollectionsActions | ParamsVocabulariesActions;
declare type PieceType = PrimitiveType | ReducedObjType | InternalExtendedObjType;
export interface FinalCloneOptions {
    customizer?: (params: CustomizerParams) => unknown;
    accumulator: Record<PropertyKey, any>;
    output: 'simple' | 'verbose';
    descriptors: boolean;
}
export declare type RawCloneOptions = Partial<FinalCloneOptions>;
export declare type CloneOptions = RawCloneOptions;
interface GeneralCombineOptions {
    accumulator: FinalCloneOptions['accumulator'];
}
interface RawCombineOptions extends GeneralCombineOptions {
    actions: ParamsActions;
}
declare type ProducedAs = 'key' | 'property' | 'value' | 'root';
declare type SourceChildPart = Pick<Source, 'producedBy' | 'producedAs' | 'value' | 'index'>;
export declare class Source {
    constructor(value: Source['_value']);
    static createRootSource(params: {
        value: Source['_value'];
        summary: Source['summary'];
        index: Source['_index'];
    }): Source;
    createChild(producedBy: unknown, producedAs: ProducedAs): Source;
    addToSourcesToLabels(): void;
    setFlags(): void;
    get value(): any;
    get type(): PieceType;
    get parentSource(): Source;
    set parentSource(parent: Source);
    get root(): Source;
    set root(root: Source);
    get childrenPartial(): SourceChildPart[];
    get target(): any;
    set target(targetValue: unknown);
    get index(): number;
    set index(index: number);
    get level(): number;
    set level(level: number);
    get label(): number;
    set label(label: number);
    get producedBy(): any;
    get producedAs(): ProducedAs;
    get isItADouble(): boolean;
    set isItADouble(isDouble: boolean);
    get isItAPrimitive(): boolean;
    get isItMissed(): boolean;
    get isItProcessed(): boolean;
    get summary(): Summary;
    private setValueAndType;
    private buildChildrenPartial;
    private _value;
    private _type;
    private _parentSource;
    private _childrenPartial;
    private _root;
    private _target;
    private _index;
    private _level;
    private _label;
    private _producedBy;
    private _producedAs;
    private _summary;
    private _isItADouble;
    private _isItAPrimitive;
    private _isItCustomized;
    private _isItMissed;
    private _isItProcessed;
}
export declare class Results {
    constructor(summary: Summary);
    get accumulator(): Record<PropertyKey, any>;
    get options(): Partial<FinalCloneOptions>;
    get result(): unknown;
    setByLabel: (label: number, value: any) => void;
    deleteByLabel: (label: number) => void;
    private _deleteByLabel;
    private _setByLabel;
    private: any;
    private _summary;
}
export declare class Summary {
    constructor(rawData: unknown[], operation: 'clone' | 'combine', rawOptions?: RawCloneOptions | RawCombineOptions);
    addToAllSources(source: Source): void;
    addToSourcesToLabels(source: Source): void;
    getTargetBySource(source: unknown): unknown;
    setAndGetResult(result: unknown): Results;
    setByLabel(label: number, rawData: unknown): void;
    deleteByLabel(label: number): void;
    get accumulator(): Record<PropertyKey, any>;
    get result(): unknown;
    get rawCloneOptions(): Partial<FinalCloneOptions>;
    get finalCloneOptions(): FinalCloneOptions;
    get roots(): Source[];
    private buildCloneFinalOptions;
    private buildCombineFinalOptions;
    private initRoots;
    private checkLabel;
    private _accumulator;
    private _sourcesToLabels;
    private _allSources;
    private _roots;
    private _result;
    private _rawCloneOptions;
    private _finalCloneOptions;
    private _rawCombineOptions;
    private _finalCombineOptions;
}
export declare class CustomizerParams {
    constructor(source: Source);
    get value(): any;
    get key(): any;
    get parent(): CustomizerParams;
    get root(): CustomizerParams;
    get index(): number;
    get level(): number;
    get label(): number;
    get isItAdouble(): boolean;
    get isItAPrimitive(): boolean;
    get accumulator(): Record<PropertyKey, any>;
    get options(): Partial<FinalCloneOptions>;
    private _source;
}
export {};
