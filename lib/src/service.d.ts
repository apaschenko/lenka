export declare const BY_DEFAULT: unique symbol;
export declare const MISSING: unique symbol;
declare const PrimitiveTypesSet: readonly ["boolean", "undefined", "symbol", "string", "number", "bigint", "null"];
declare type PrimitiveType = typeof PrimitiveTypesSet[number];
declare const ReducedObjTypesSet: readonly ["date", "regexp", "function", "dataview", "arraybuffer"];
declare const CollectionsSet: readonly ["array", "map", "object", "set"];
declare const PredefActCoverSet: readonly ["array", "map", "object", "set", "vocabulary", "collection", "all", "*"];
declare type PredefActCoverTypes = typeof PredefActCoverSet[number];
declare const PredefinedActorsSet: readonly ["replace", "merge", "union", "diff"];
export declare type PredefinedActors = typeof PredefinedActorsSet[number];
declare type ReducedObjType = typeof ReducedObjTypesSet[number];
declare type InternalExtendedObjType = typeof CollectionsSet[number];
declare const MetaTypeSet: readonly ["vocabulary", "collection", "primitive"];
export declare type MetaType = typeof MetaTypeSet[number];
declare type PieceType = PrimitiveType | ReducedObjType | InternalExtendedObjType;
declare type ExtendedPieceType = PieceType | typeof MISSING;
declare type AccumulatorType = Record<PropertyKey, any>;
declare const OutputTypeSet: readonly ["simple", "verbose"];
declare type OutputType = typeof OutputTypeSet[number];
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
export declare type CloneOptions = Partial<FinalCloneOptions>;
export declare type CombineOptions = Partial<FinalCombineOptions>;
declare type RawOptions = CloneOptions | CombineOptions;
export declare type OperationType = 'combine' | 'clone';
export declare type TypeChecker = (combineSource: CombineSource) => boolean;
export declare type ActionCoverageSingle = PredefActCoverTypes | TypeChecker;
export declare type ActionCoverageArr = [ActionCoverageSingle, ActionCoverageSingle];
export declare const ProducedAsIntSet: readonly ["key", "property", "value"];
declare type ProducedAsInt = typeof ProducedAsIntSet[number];
export declare type ProducedAs = ProducedAsInt | 'root';
declare type ChildrenProducedByArr = Node['_producedBy'][];
declare type ChildrenList = Map<Node['_producedBy'], Child[]>;
declare type Children<T> = Record<ProducedAsInt, T>;
export declare type ChildrenKeys = Children<ChildrenProducedByArr>;
export declare type CombineChildren = Children<ChildrenList>;
export declare class Node {
    constructor(value: Node['_value'], summary: Summary);
    static createRootNode(params: {
        value: Node['_value'];
        summary: Node['summary'];
        index: Node['_index'];
    }): Node;
    static emptyChildrenSet<T>(init: () => T): Children<T>;
    addToNodesToLabels(): void;
    setFlags(): void;
    createChild(producedBy: unknown, producedAs: ProducedAs, parentTarget?: Node): Node;
    createInstance(): void;
    get value(): any;
    get type(): ExtendedPieceType;
    get childKeys(): ChildrenKeys;
    get parentNode(): Node;
    set parentNode(parent: Node);
    get parentTarget(): Node;
    set parentTarget(parent: Node);
    get root(): Node;
    set root(root: Node);
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
    private _parentNode;
    private _parentTarget;
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
    get options(): FinalCloneOptions;
    get cloneOptions(): FinalCloneOptions;
    get combineOptions(): FinalCombineOptions;
    get result(): unknown;
    private _deleteByLabel;
    private _setByLabel;
    private _summary;
}
export declare type Actor = (params: CombineParams) => typeof BY_DEFAULT;
export declare class Action {
    constructor(coverage: ActionCoverageSingle | ActionCoverageArr, actor: Actor | PredefinedActors);
    tryToRun(params: CombineParams): {
        skipped: boolean;
        result: symbol;
    };
    private singleCoverageCheck;
    private _coverage;
    private _actor;
}
export declare class Summary {
    constructor(rawData: unknown[], operation: OperationType, rawOptions?: RawOptions);
    addToAllNodes(node: Node): void;
    addToNodesToLabels(node: Node): void;
    hasValue(rawData: unknown): boolean;
    setAndGetResult(result: unknown): Results;
    getAndIncreaceLabel(): number;
    setByLabel(label: number, rawData: unknown): void;
    deleteByLabel(label: number): void;
    createTargetInstance(node: Node): void;
    get accumulator(): AccumulatorType;
    get result(): unknown;
    get cloneOptions(): FinalCloneOptions;
    get combineOptions(): FinalCombineOptions;
    get roots(): Node[];
    private constructInstance;
    private validateAndBuildOptions;
    private initRoots;
    private checkLabel;
    private _operation;
    private _label;
    private _valuesToLabels;
    private _allNodes;
    private _roots;
    private _result;
    private _finalOptions;
}
export declare class CustomizerParams {
    constructor(node: Node);
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
    get options(): FinalCombineOptions;
    protected _node: Node;
}
export declare class CombineSource extends CustomizerParams {
    constructor(node: Node, combineParams: CombineParams);
    select(): void;
    get _internalType(): ExtendedPieceType;
    get childKeys(): ChildrenKeys;
    private _combineParams;
}
export declare class Child {
    constructor(combineParams: CombineParams, index: number, producedBy: Node['_producedBy'], producedAs: ProducedAsInt);
    add(): number;
    get index(): number;
    get key(): any;
    get producedAs(): "key" | "property" | "value";
    get label(): number;
    private _combineParams;
    private _index;
    private _key;
    private _producedAs;
    private _label;
}
export declare class CombineParams {
    constructor(summary: Summary, nodes: Node[]);
    addChild(child: Child): number;
    getNextLabel(): number;
    selectBase(combineSource: CombineSource): void;
    get bases(): CombineSource[];
    private buildSchemeAndResult;
    private _nodes;
    private _combineSources;
    private _summary;
    private _selectedBase;
    private _scheme;
    private _result;
}
export {};
