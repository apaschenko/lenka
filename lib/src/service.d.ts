import { ProducedAs, ProducedAsInt } from './lib/general_types';
import { ExtendedPieceType } from './lib/piece_types';
import { BY_DEFAULT } from './lib/symbols';
export declare type OperationType = 'combine' | 'clone';
declare const PredefActCoverSet: readonly ["array", "map", "object", "set", "vocabulary", "collection", "all", "*"];
declare type PredefActCoverTypes = typeof PredefActCoverSet[number];
declare const PredefinedActorsSet: readonly ["replace", "merge", "union", "diff"];
declare type PredefinedActors = typeof PredefinedActorsSet[number];
declare type AccumulatorType = Record<PropertyKey, any>;
declare const OutputTypeSet: readonly ["simple", "verbose"];
declare type OutputType = typeof OutputTypeSet[number];
export declare type Coverage = ActionCoverageSingle | ActionCoverageArr;
export declare type ActorFunction = (params: CombineParams) => typeof BY_DEFAULT;
export declare type Actor = ActorFunction | PredefinedActors;
export interface Action {
    coverage: Coverage;
    actor: Actor;
}
export interface FinalCloneOptions {
    accumulator: AccumulatorType;
    output: OutputType;
    descriptors: boolean;
    customizer: ((params: CustomizerParams) => unknown) | null;
}
interface FinalCombineOptions extends FinalCloneOptions {
    actions: FinalAction[];
}
export declare type CloneOptions = Partial<FinalCloneOptions>;
export interface CombineOptions extends Partial<Omit<FinalCombineOptions, 'actions'>> {
    actions?: Action[];
}
declare type RawOptions = CloneOptions | CombineOptions;
declare type ActionCoverageSingle = PredefActCoverTypes | TypeChecker;
declare type ActionCoverageArr = [ActionCoverageSingle, ActionCoverageSingle];
declare type TypeChecker = (combineSource: CombineSource) => boolean;
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
export declare class FinalAction {
    constructor(rawAction: Action);
    tryToRun(params: CombineParams): boolean;
    private singleCoverageCheck;
    private throwError;
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
    get rawCloneOptions(): Partial<FinalCloneOptions>;
    get rawCombineOptions(): CombineOptions;
    get finalCloneOptions(): FinalCloneOptions;
    get finalCombineOptions(): FinalCombineOptions;
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
    private _rawOptions;
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
    get options(): Partial<FinalCloneOptions>;
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
    postCheck(): void;
    get bases(): CombineSource[];
    get selectedBase(): CombineSource;
    get result(): CombineChildren;
    _createChild(child: Child): Node;
    private buildSchemeAndResult;
    private _nodes;
    private _combineSources;
    private _summary;
    private _selectedBase;
    private _scheme;
    private _result;
}
export {};
