import { ExtendedPieceType, PrimitiveTypesSet, CollectionsSet } from './piece_types';
import {
  ProducedAs,
  ProducedAsInt,
  AccumulatorType,
  OutputType,
  DefaultActionParamsDiff,
} from './general_types';


export const PredefActCoverSet = [
  ...CollectionsSet, ...PrimitiveTypesSet, 'collection', 'primitive', 'vocabulary', 'keyholder', 'all', '*'
] as const;
export type PredefActCoverTypes = typeof PredefActCoverSet[number];

export const PredefinedActorsSet = ['replace', 'merge', 'diff'] as const;
export type PredefinedActors = typeof PredefinedActorsSet[number];
export type Coverage = ActionCoverageSingle | ActionCoverageArr;

export type ActorFunction = (params: LCombineParams, actorParams: ActionParams) => void;
export type Actor = ActorFunction | PredefinedActors;

export type ActionParams = Record<string, unknown>;

export type ActionParamsDiff = typeof DefaultActionParamsDiff;

interface ActionGeneral {
  coverage: Coverage;
  params?: Record<string, never>;
}

export interface ActionMerge extends ActionGeneral {
  actor: 'merge';
}

export interface ActionReplace extends ActionGeneral {
  actor: 'replace';
}

export interface ActionDiff extends Omit<ActionGeneral, 'params'> {
  actor: 'diff';
  params?: Partial<ActionParamsDiff>;
}

export interface ActionCustom extends Omit<ActionGeneral, 'params'> {
  actor: ActorFunction;
  params?: ActionParams;
}

export type TypeChecker = (combineSource: LCombineSource) => boolean;

export type Action = ActionMerge | ActionReplace | ActionDiff | ActionCustom; 

export type ActionCoverageSingle = string | TypeChecker;

type ActionCoverageArr = [ActionCoverageSingle, ActionCoverageSingle];
export interface FinalCloneOptions {
  accumulator: AccumulatorType;
  output: OutputType;
  descriptors: boolean;
  customizer: ((params: LCustomizerParams) => unknown) | null;
  creator: ((params: LCustomizerParams) => unknown) | null;
}

export interface FinalCombineOptions extends FinalCloneOptions {
  actions: LFinalAction[];
}

export type LCloneOptions = Partial<FinalCloneOptions>;

export interface CombineOptions
  extends Partial<Omit<FinalCombineOptions, 'actions'>> {
  actions?: Action[];
}

export type RawOptions = LCloneOptions | CombineOptions;

export type FinalOptions = FinalCloneOptions | FinalCombineOptions;

export type ChildrenProducedBySet = Set<LNode['producedBy']>;

export type ChildrenList = Map<LNode['producedBy'], LChild[]>;

export type Children<T> = Record<ProducedAsInt, T>;

export type ChildrenKeys = Children<ChildrenProducedBySet>;

export type ChildrenValues = Children<Set<unknown>>;

export type CombineChildren = Children<ChildrenList>;

export interface LNode {
  getChildValue: (
    producedBy: LNode['producedBy'],
    producedAs: ProducedAs
  ) => LNode['value'];
  createChild: (
    producedBy: LNode['producedBy'],
    producedAs: ProducedAs,
    parentTarget?: LNode
  ) => LNode;
  addToNodesToLabels: () => void;
  setFlags: () => void;
  createInstance: () => void;
  linkTargetToParent: () => void;
  getChildrenValues: (valuesFromProps: boolean, valuesFromKeys: boolean, keysPropsMix: boolean) => ChildrenValues;
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
  producedAs: ProducedAs;
  isItADouble: boolean;
  isItAPrimitive: boolean;
  isItMissed: boolean;
  isItProcessed: boolean;
  summary: LSummary;
  customizerParams: LCustomizerParams;
  childrenKeys: ChildrenKeys;
}

export interface LChild {
  add: () => LNode['label'];
  setKey: (keyOrPropName: unknown) => LChild;
  setProducedAs: (keyType: ProducedAsInt) => LChild;
  setValue: (value: unknown) => LChild;
  readonly index: LNode['index'];
  readonly key: LNode['producedBy'];
  readonly producedAs: ProducedAsInt;
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
  accumulator: AccumulatorType;
  result: LNode['target'];
  selectedRoot: LNode;
  selectRootByIndex: (index: LNode['index']) => LNode;
  rawCloneOptions: LCloneOptions;
  rawCombineOptions: CombineOptions;
  finalCloneOptions: FinalCloneOptions;
  finalCombineOptions: FinalCombineOptions;
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
  addChild: (child: LChild, producedAs?: ProducedAs) => LChild['label'];
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
  getChildrenValues: (valuesFromP: boolean, valuesFromK: boolean, keysPropsMix: boolean) => 
    ReturnType<LNode['getChildrenValues']>;
  childrenKeys: ChildrenKeys;
  _internalType: ExtendedPieceType;
  _isPrimitive: boolean;
}

export interface LFinalAction {
  tryToRun: (params: LCombineParams) => boolean;
}
