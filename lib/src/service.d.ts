export declare type TypeFromReadonlyArray<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<infer TypeFromReadonlyArray> ? TypeFromReadonlyArray : never;
export declare const BY_DEFAULT: unique symbol;
export declare const MISSING: unique symbol;
export declare type MissingType = typeof MISSING;
declare const PrimitiveTypesSet: readonly ["boolean", "undefined", "symbol", "string", "number", "bigint", "null", typeof MISSING];
export declare type PrimitiveType = TypeFromReadonlyArray<typeof PrimitiveTypesSet>;
declare const ReducedObjTypesSet: readonly ["date", "regexp", "function", "dataview", "arraybuffer"];
declare const InternalExtendedObjTypesSet: readonly ["array", "map", "object", "array", "set", "object"];
declare const ParamsExtendedObjTypesSet: readonly ["array", "map", "object", "array", "set", "object", "vocabularies", "collection"];
export declare const ParamsActionsSet: readonly ["replace", "merge", "diff"];
export declare const InternalActionsSet: readonly ["replace", "merge", "diff", "vocabulariesMerge", "collectionsMerge", "vocabulariesDiff", "collectionsDiff"];
export declare type ReducedObjType = TypeFromReadonlyArray<typeof ReducedObjTypesSet>;
export declare type ParamsExtendedObjType = TypeFromReadonlyArray<typeof ParamsExtendedObjTypesSet>;
export declare type InternalExtendedObjType = TypeFromReadonlyArray<typeof InternalExtendedObjTypesSet>;
declare const MetaTypeSet: readonly ["vocabulary", "collection", "primitive"];
export declare type MetaType = TypeFromReadonlyArray<typeof MetaTypeSet>;
export declare type ParamsAction = TypeFromReadonlyArray<typeof ParamsActionsSet>;
export declare type InternalAction = TypeFromReadonlyArray<typeof InternalActionsSet>;
export declare type ParamsActions = {
    [type in ParamsExtendedObjType]?: ParamsAction;
};
export declare type InternalActions = {
    [type in InternalExtendedObjType]?: InternalAction;
};
export declare type PieceType = PrimitiveType | ReducedObjType | InternalExtendedObjType;
export interface FinalCloneOptions {
    customizer?: (params: CustomizerParams) => unknown;
    accumulator: Record<PropertyKey, any>;
    output: 'simple' | 'verbose';
    descriptors: boolean;
}
export declare type RawCloneOptions = Partial<FinalCloneOptions>;
export declare type CloneOptions = RawCloneOptions;
export interface AllCloneOptions {
    final: FinalCloneOptions;
    raw: RawCloneOptions;
}
export declare type ProducedAs = 'key' | 'property' | 'value' | 'root';
interface SourceChildPart {
    producedBy: Source['_producedBy'];
    producedAs: Source['_producedAs'];
    value: Source['_value'];
}
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
    setValueAndType(value: unknown): void;
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
    get accumulator(): FinalCloneOptions['accumulator'];
    get options(): RawCloneOptions;
    get result(): any;
    setByLabel: (label: number, value: any) => void;
    deleteByLabel: (label: number) => void;
    private _deleteByLabel;
    private _setByLabel;
    private: any;
    private _summary;
}
export declare class Summary {
    constructor(rawData: unknown[], rawOptions?: RawCloneOptions);
    addToAllSources(source: Source): void;
    addToSourcesToLabels(source: Source): void;
    getTargetBySource(source: unknown): unknown;
    setAndGetResult(result: unknown): Results;
    setByLabel(label: number, rawData: unknown): void;
    deleteByLabel(label: number): void;
    get accumulator(): Record<PropertyKey, any>;
    get result(): unknown;
    get rawOptions(): RawCloneOptions;
    get finalOptions(): FinalCloneOptions;
    get roots(): Source[];
    private buildFinalOptions;
    private initRoots;
    private checkLabel;
    private _accumulator;
    private _sourcesToLabels;
    private _allSources;
    private _roots;
    private _result;
    private _rawOptions;
    private _finalOptions;
}
export declare class CustomizerParams {
    constructor(source: Source);
    get value(): Source['value'];
    get key(): Source['producedBy'];
    get parent(): CustomizerParams;
    get root(): CustomizerParams;
    get index(): Source['index'];
    get level(): Source['level'];
    get label(): Source['label'];
    get isItAdouble(): boolean;
    get isItAPrimitive(): boolean;
    get accumulator(): FinalCloneOptions['accumulator'];
    get options(): RawCloneOptions;
    private _source;
}
export {};
