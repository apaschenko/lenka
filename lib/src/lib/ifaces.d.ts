import { ExtendedPieceType } from './piece_types';
import { LProducedAs, LProducedAsInt, LAccumulatorType, LOutputType, DefaultActionParamsDiff } from './general_types';
export declare const PredefActCoverSet: readonly ["array", "map", "object", "set", "boolean", "undefined", "symbol", "string", "number", "bigint", "null", "collection", "primitive", "vocabulary", "keyholder", "all", "*"];
export declare type PredefActCoverTypes = typeof PredefActCoverSet[number];
export declare const PredefinedActorsSet: readonly ["replace", "merge", "diff"];
export declare type LPredefinedActors = typeof PredefinedActorsSet[number];
export declare type LCoverage = LActionCoverageSingle | LActionCoverageArr;
export declare type LActorFunction = (params: LCombineParams, actorParams: LActionParams) => void;
export declare type LActor = LActorFunction | LPredefinedActors;
export declare type LActionParams = Record<string, unknown>;
export declare type LActionParamsDiff = typeof DefaultActionParamsDiff;
interface LActionGeneral {
    coverage: LCoverage;
    params?: Record<string, never>;
}
export interface LActionMerge extends LActionGeneral {
    actor: 'merge';
}
export interface LActionReplace extends LActionGeneral {
    actor: 'replace';
}
export interface LActionDiff extends Omit<LActionGeneral, 'params'> {
    actor: 'diff';
    params?: Partial<LActionParamsDiff>;
}
export interface LActionCustom extends Omit<LActionGeneral, 'params'> {
    actor: LActorFunction;
    params?: LActionParams;
}
export declare type TypeChecker = (combineSource: LCombineSource) => boolean;
export declare type LAction = LActionMerge | LActionReplace | LActionDiff | LActionCustom;
export declare type LActionCoverageSingle = string | TypeChecker;
declare type LActionCoverageArr = [LActionCoverageSingle, LActionCoverageSingle];
export interface LFinalCloneOptions {
    accumulator: LAccumulatorType;
    output: LOutputType;
    descriptors: boolean;
    customizer: ((params: LCustomizerParams) => unknown) | null;
    creator: ((params: LCustomizerParams) => unknown) | null;
}
export interface LFinalCombineOptions extends LFinalCloneOptions {
    actions: LFinalAction[];
}
export declare type LCloneOptions = Partial<LFinalCloneOptions>;
export interface LCombineOptions extends Partial<Omit<LFinalCombineOptions, 'actions'>> {
    actions?: LAction[];
}
export declare type RawOptions = LCloneOptions | LCombineOptions;
export declare type FinalOptions = LFinalCloneOptions | LFinalCombineOptions;
export declare type ChildrenProducedBySet = Set<LNode['producedBy']>;
export declare type ChildrenList = Map<LNode['producedBy'], LChild[]>;
export declare type LChildren<T> = Record<LProducedAsInt, T>;
export declare type LChildrenKeys = LChildren<ChildrenProducedBySet>;
export declare type LChildrenValues = LChildren<Set<unknown>>;
export declare type CombineChildren = LChildren<ChildrenList>;
export interface LNode {
    getChildValue: (producedBy: LNode['producedBy'], producedAs: LProducedAs) => LNode['value'];
    createChild: (producedBy: LNode['producedBy'], producedAs: LProducedAs, parentTarget?: LNode) => LNode;
    addToNodesToLabels: () => void;
    setFlags: () => void;
    createInstance: () => void;
    linkTargetToParent: () => void;
    getChildrenValues: (valuesFromProps: boolean, valuesFromKeys: boolean, keysPropsMix: boolean) => LChildrenValues;
    value: any;
    type: ExtendedPieceType;
    parentNode: LNode;
    parentTarget: LNode;
    root: LNode;
    target: any;
    index: number;
    level: number;
    label: number;
    producedBy: any;
    producedAs: LProducedAs;
    isItADouble: boolean;
    isItAPrimitive: boolean;
    isItAnArray: boolean;
    isItMissed: boolean;
    isItProcessed: boolean;
    summary: LSummary;
    customizerParams: LCustomizerParams;
    childrenKeys: LChildrenKeys;
}
export interface LChild {
    add: () => LNode['label'];
    setKey: (keyOrPropName: unknown) => LChild;
    setProducedAs: (keyType: LProducedAsInt) => LChild;
    setValue: (value: unknown) => LChild;
    readonly index: LNode['index'];
    readonly key: LNode['producedBy'];
    readonly producedAs: LProducedAsInt;
    readonly value: LNode['value'];
    readonly label: LNode['label'];
}
export interface LSummary {
    addToAllNodes: (node: LNode) => void;
    addToNodesToLabels: (node: LNode) => void;
    hasValue: (rawData: unknown) => boolean;
    buildResult: () => any;
    getAndIncreaceLabel: () => LNode['label'];
    setByLabel: (label: LNode['label'], rawData: unknown) => void;
    deleteByLabel: (label: LNode['label']) => void;
    createTargetInstance: (node: LNode) => void;
    accumulator: LAccumulatorType;
    result: LNode['target'];
    selectedRoot: LNode;
    selectRootByIndex: (index: LNode['index']) => LNode;
    rawCloneOptions: LCloneOptions;
    rawCombineOptions: LCombineOptions;
    finalCloneOptions: LFinalCloneOptions;
    finalCombineOptions: LFinalCombineOptions;
    roots: LNode[];
}
export interface LCustomizerParams {
    value: LNode['value'];
    key: LNode['producedBy'];
    parent: LCustomizerParams;
    root: LCustomizerParams;
    index: LNode['index'];
    level: LNode['level'];
    label: LNode['label'];
    isItAdouble: LNode['isItADouble'];
    isItAPrimitive: LNode['isItAPrimitive'];
    accumulator: LSummary['accumulator'];
    options: LSummary['rawCloneOptions'];
}
export interface LCombineParams {
    addChild: (child: LChild, producedAs?: LProducedAs) => LChild['label'];
    getNextLabel: () => ReturnType<LSummary['getAndIncreaceLabel']>;
    selectBase: (combineSource: LCombineSource) => void;
    postCheck: () => void;
    bases: LCombineSource[];
    selectedBase: LCombineSource;
    result: CombineChildren;
    scheme: CombineChildren;
    _createChild: (child: LChild) => ReturnType<LNode['createChild']>;
}
export interface LCombineSource extends LCustomizerParams {
    select: () => void;
    getChildrenValues: (valuesFromP: boolean, valuesFromK: boolean, keysPropsMix: boolean) => ReturnType<LNode['getChildrenValues']>;
    childrenKeys: LChildrenKeys;
    _internalType: ExtendedPieceType;
    _isPrimitive: boolean;
}
export interface LFinalAction {
    tryToRun: (params: LCombineParams) => boolean;
}
export {};
