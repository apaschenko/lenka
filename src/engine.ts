import { LNode, LFinalCloneOptions, LCloneOptions, LCombineOptions, LChildrenKeys, LCustomizerParams } from './lib/ifaces';
import { Summary } from './lib/summary';
import { CombineParams } from './lib/combine_params';
import { ProducedAsIntSet } from './lib/general_types';
import { LResults } from './lib/results';

export { BY_DEFAULT, MISSING } from './lib/symbols';
export { LCustomizerParams, LCloneOptions, LResults };

function copyKeysAndProperties(parentNode: LNode, children: LChildrenKeys, parentTarget?: LNode): void {
  const value: object = <object>parentNode.value;
  const target: object = <object>parentNode.target;

  for (const producedAs of ProducedAsIntSet) {
    for (const producedBy of children[producedAs].values()) {
      if (!(Object.hasOwnProperty.call(target, producedBy) && value[producedBy] === target[producedBy])) {
        const child = parentNode.createChild(producedBy, producedAs, parentTarget);

        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        cloneInternal(child);
      
        if (!child.isItMissed) {
          child.linkTargetToParent();
        }
      }
    }
  }
}

function cloneInternal(node: LNode): void {
  const finalOptions = node.summary.finalCloneOptions;

  if (finalOptions.customizer) {
    node.target = finalOptions.customizer(node.customizerParams);
  }

  node.setFlags();
  node.addToNodesToLabels();

  if (!node.isItProcessed) {
    node.createInstance();
    copyKeysAndProperties(node, node.childrenKeys);
  }
}

function combineInternal(summary: Summary, nodes: LNode[]) {
  const actions = summary.finalCombineOptions.actions;

  const combineParams = new CombineParams(summary, nodes);

  actions.every((action) => { return action.tryToRun(combineParams); });
  combineParams.postCheck();

  for (const keyType of ProducedAsIntSet) {
    for (const childrenByKey of combineParams.result[keyType].values()) {
      const childNodes = childrenByKey.map((child) => {
        return combineParams._createChild(child);
      });

      switch (childNodes.length) {
        case 1:
          cloneInternal(childNodes[0]);
          childNodes[0].linkTargetToParent();
          break;

        case 2:
          combineInternal(summary, childNodes);
          break;

        default:
          throw new TypeError('E02: Internal error');
      }
    };
  }
}

export interface CustParamsAccSoft<ACC> extends LCustomizerParams {
  accumulator: ACC & { [key: PropertyKey]: unknown }
}

export interface CustParamsAccStrict<ACC> extends LCustomizerParams {
  accumulator: ACC
}

type CloneAccumulator<OPT> = OPT extends { accumulator: LResults['accumulator']}
  ? OPT['accumulator'] & { [key: PropertyKey]: unknown }
  : LResults['accumulator'];

type CloneResult<SOURCE, OPT> = OPT extends { customizer: LFinalCloneOptions['customizer'] } ? any : SOURCE;

interface CloneVerboseReturnType<SOURCE,OPT> extends LResults {
  result: CloneResult<SOURCE, OPT>,
  accumulator: CloneAccumulator<OPT>,
}

export type CloneReturnType<SOURCE, OPT> = OPT extends { output: 'verbose' }
  ? CloneVerboseReturnType<SOURCE,OPT>
  : SOURCE;

export function clone<
  SOURCE, OPT extends LCloneOptions
>(original: SOURCE, rawOptions?: OPT): CloneReturnType<SOURCE,OPT> {
  const summary = new Summary([original], 'clone', rawOptions);
  const node = summary.selectedRoot;

  cloneInternal(node);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return summary.buildResult();
}

type CombineReturnType<OPT> = OPT extends { output: 'verbose' }
  ? LResults : LNode['target']

export function combine<
  OPT extends LCombineOptions
>(firstSource: unknown, secondSource: unknown, rawOptions?: OPT): CombineReturnType<OPT> {
  const summary = new Summary([firstSource, secondSource], 'combine', rawOptions);
  combineInternal(summary, summary.roots);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return summary.buildResult();
}
