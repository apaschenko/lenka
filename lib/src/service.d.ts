export declare const BY_DEFAULT: unique symbol;
export declare const MISSING: unique symbol;
declare const PrimitiveTypesSet: readonly ["boolean", "undefined", "symbol", "string", "number", "bigint", "null"];
declare type PrimitiveType = typeof PrimitiveTypesSet[number];
declare const ReducedObjTypesSet: readonly ["date", "regexp", "function", "dataview", "arraybuffer"];
declare const FinalVocabulariesSet: readonly ["array", "map", "object"];
declare type FinalVocabularies = typeof FinalVocabulariesSet[number];
declare const FinalCollectionsSet: readonly ["array", "map", "object", "set"];
declare type FinalCollections = typeof FinalCollectionsSet[number];
declare const Vocabulary: "vocabulary";
declare const Collection: "collection";
declare type RawVocabularies = FinalVocabularies | typeof Vocabulary;
declare type RawCollections = FinalCollections | typeof Collection;
declare const ActionCollectionSet: readonly ["replace", "union", "diff"];
declare const ActionVocabularySet: readonly ["replace", "union", "diff", "stack"];
declare type ActionCollection = typeof ActionCollectionSet[number];
declare type ActionVocabulary = typeof ActionVocabularySet[number];
declare type ReducedObjType = typeof ReducedObjTypesSet[number];
export declare type InternalExtendedObjType = typeof FinalCollectionsSet[number];
declare const MetaTypeSet: readonly ["vocabulary", "collection", "primitive"];
export declare type MetaType = typeof MetaTypeSet[number];
declare type RawCollectionsActionsByType = {
    [type in RawCollections]: ActionCollection;
};
declare type RawVocabulariesActionsByType = {
    [type in RawVocabularies]: ActionVocabulary;
};
declare type RawActionsByType = RawCollectionsActionsByType | RawVocabulariesActionsByType;
declare type FinalCollectionsActionsByType = {
    [type in FinalCollections]: ActionCollection;
};
declare type FinalVocabulariesActionsByType = {
    [type in FinalVocabularies]: ActionVocabulary;
};
declare type FinalActionsByType = FinalCollectionsActionsByType | FinalVocabulariesActionsByType;
declare type PieceType = PrimitiveType | ReducedObjType | InternalExtendedObjType;
declare type ExtendedPieceType = PieceType | typeof MISSING;
declare type AccumulatorType = Record<PropertyKey, any>;
export interface FinalCloneOptions {
    customizer?: (params: CustomizerParams) => unknown;
    accumulator: AccumulatorType;
    output: 'simple' | 'verbose';
    descriptors: boolean;
}
export declare type RawCloneOptions = Partial<FinalCloneOptions>;
export declare type CloneOptions = RawCloneOptions;
interface GeneralCombineOptions {
    accumulator: FinalCloneOptions['accumulator'];
}
export interface RawCombineOptions extends GeneralCombineOptions {
    actions: RawActionsByType;
}
declare type ProducedAs = 'key' | 'property' | 'value' | 'root';
export declare class Source {
    constructor(value: Source['_value'], summary: Summary);
    static createRootSource(params: {
        value: Source['_value'];
        summary: Source['summary'];
        index: Source['_index'];
    }): Source;
    addToSourcesToLabels(): void;
    setFlags(): void;
    get value(): any;
    get type(): ExtendedPieceType;
    get parentSource(): Source;
    set parentSource(parent: Source);
    get root(): Source;
    set root(root: Source);
    get children(): Source[];
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
    private createChildren;
    private createChild;
    private _value;
    private _type;
    private _parentSource;
    private _children;
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
    setByLabel: (label: number, value: any) => void;
    deleteByLabel: (label: number) => void;
    get accumulator(): AccumulatorType;
    get options(): Partial<FinalCloneOptions>;
    get cloneOptions(): Partial<FinalCloneOptions>;
    get combineOptions(): RawCombineOptions;
    get result(): unknown;
    private _deleteByLabel;
    private _setByLabel;
    private _summary;
}
export declare class Summary {
    constructor(rawData: unknown[], operation: 'clone' | 'combine', rawOptions?: RawCloneOptions | RawCombineOptions);
    addToAllSources(source: Source): void;
    addToSourcesToLabels(source: Source): void;
    getTargetByValue(rawData: unknown): unknown;
    hasValue(rawData: unknown): boolean;
    setAndGetResult(result: unknown): Results;
    setByLabel(label: number, rawData: unknown): void;
    deleteByLabel(label: number): void;
    get accumulator(): AccumulatorType;
    get result(): unknown;
    get rawCloneOptions(): Partial<FinalCloneOptions>;
    get finalCloneOptions(): FinalCloneOptions;
    get rawCombineOptions(): RawCombineOptions;
    get finalCombineOptions(): {
        accumulator: AccumulatorType;
        actions: FinalActionsByType;
    };
    get roots(): Source[];
    private buildCloneFinalOptions;
    private buildCombineFinalOptions;
    private buildCombineFinalActions;
    private replaceMetaAction;
    private checkAction;
    private initRoots;
    private checkLabel;
    private _accumulator;
    private _valuesToLabels;
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
    get accumulator(): AccumulatorType;
    get options(): Partial<FinalCloneOptions>;
    private _source;
}
export {};
