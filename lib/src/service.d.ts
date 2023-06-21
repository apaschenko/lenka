export declare const BY_DEFAULT: unique symbol;
export declare const MISSING: unique symbol;
declare const PrimitiveTypesSet: readonly ["boolean", "undefined", "symbol", "string", "number", "bigint", "null"];
declare type PrimitiveType = typeof PrimitiveTypesSet[number];
declare const ReducedObjTypesSet: readonly ["date", "regexp", "function", "dataview", "arraybuffer"];
declare const FinalVocabulariesSet: readonly ["array", "map", "object"];
declare type FinalVocabularies = typeof FinalVocabulariesSet[number];
declare const FinalCollectionsSet: readonly ["array", "map", "object", "set"];
declare type InternalCollections = typeof FinalCollectionsSet[number];
declare const Vocabulary: "vocabulary";
declare const Collection: "collection";
declare type RawVocabularies = FinalVocabularies | typeof Vocabulary;
declare type RawCollections = InternalCollections | typeof Collection;
declare const RawActCollectionSet: readonly ["replace", "union", "diff"];
declare const RawActVocabularySet: readonly ["replace", "union", "diff", "stack"];
declare const FinalCollActionsSet: readonly ["replace", "union", "diff", "collectionReplace", "collectionUnion", "collectionDiff"];
declare const FinalVocActionsSet: readonly ["replace", "union", "diff", "collectionReplace", "collectionUnion", "collectionDiff", "vocabularyStack"];
declare type ReducedObjType = typeof ReducedObjTypesSet[number];
export declare type InternalExtendedObjType = typeof FinalCollectionsSet[number];
declare const MetaTypeSet: readonly ["vocabulary", "collection", "primitive"];
export declare type MetaType = typeof MetaTypeSet[number];
export declare type RawCollectionAction = typeof RawActCollectionSet[number];
export declare type RawVocabularyAction = typeof RawActVocabularySet[number];
declare type FinalCollectionAction = typeof FinalCollActionsSet[number];
declare type FinalVocabularyAction = typeof FinalVocActionsSet[number];
declare type ParamsCollectionsActions = {
    [type in RawCollections]: RawCollectionAction;
};
declare type ParamsVocabulariesActions = {
    [type in RawVocabularies]: RawVocabularyAction;
};
declare type ParamsActions = ParamsCollectionsActions | ParamsVocabulariesActions;
declare type InternalCollectionsActions = {
    [type in InternalCollections]?: FinalCollectionAction;
};
declare type InternalVocabulariesActions = {
    [type in FinalVocabularies]?: FinalVocabularyAction;
};
declare type InternalActions = InternalCollectionsActions | InternalVocabulariesActions;
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
    actions: ParamsActions;
}
declare type ProducedAs = 'key' | 'property' | 'value' | 'root';
export declare class Source {
    constructor(value: Source['_value']);
    static createRootSource(params: {
        value: Source['_value'];
        summary: Source['summary'];
        index: Source['_index'];
    }): Source;
    createChildrenPart(): void;
    addToSourcesToLabels(): void;
    setFlags(): void;
    createChildByChildPart(value: Source['_value'], producedBy: unknown, producedAs: ProducedAs): Source;
    get value(): any;
    get type(): ExtendedPieceType;
    get parentSource(): Source;
    set parentSource(parent: Source);
    get root(): Source;
    set root(root: Source);
    get children(): ChildPart[];
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
export declare class ChildPart {
    constructor(parent: Source, producedBy: Source['_producedBy'], producedAs: Source['_producedAs']);
    createSource(): Source;
    get producedBy(): any;
    get value(): any;
    get producedAs(): ProducedAs;
    get parent(): Source;
    private _value;
    private _producedBy;
    private _producedAs;
    private _parent;
}
export declare class Results {
    constructor(summary: Summary);
    get accumulator(): AccumulatorType;
    get options(): Partial<FinalCloneOptions>;
    get cloneOptions(): Partial<FinalCloneOptions>;
    get combineOptions(): RawCombineOptions;
    get result(): unknown;
    setByLabel: (label: number, value: any) => void;
    deleteByLabel: (label: number) => void;
    private _deleteByLabel;
    private _setByLabel;
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
    get accumulator(): AccumulatorType;
    get result(): unknown;
    get rawCloneOptions(): Partial<FinalCloneOptions>;
    get finalCloneOptions(): FinalCloneOptions;
    get rawCombineOptions(): RawCombineOptions;
    get finalCombineOptions(): {
        accumulator: AccumulatorType;
        actions: InternalActions;
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
    get accumulator(): AccumulatorType;
    get options(): Partial<FinalCloneOptions>;
    private _source;
}
export {};
