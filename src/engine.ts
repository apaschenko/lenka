import {
  Node,
  Summary,
  Results,
  CustomizerParams,
  CloneOptions,
  FinalCloneOptions,
  ProducedAs,
  ProducedAsIntSet,
  ChildrenKeys,
} from './service';

function cloneProperty(parent: Node, child: Node): void {
  const key = <PropertyKey>child.producedBy;

  if (child.summary.cloneOptions.descriptors) {
    // eslint-disable-next-line prettier/prettier
    const descr = Object.getOwnPropertyDescriptor(parent.value, key);

    if (!(descr.get || descr.set)) {
      descr.value = child.target;
    }

    Object.defineProperty(parent.target, key, { ...descr })
  } else {
    parent.target[key] = child.target;
  }
}

const cloneKaPProcessors: Record<ProducedAs, (node: Node, child: Node) => void> = {
  property: (node: Node, child: Node) => { cloneProperty(node, child); },
  key: (node: Node, child: Node) => { (node.target as Map<any, any>).set(child.producedBy, child.target); },
  value: (node: Node, child: Node) => { (node.target as Set<any>).add(child.target); },
  root: (_node: Node, _child: Node) => { throw new TypeError(`Internal error E01.`) },
} as const;

function copyKaPInternal(params: {
  parentNode: Node,
  producedBy: Node['_producedBy'],
  producedAs: Node['_producedAs'],
  value: object,
  target: object,
  parentTarget?: Node,
}) {
  const { parentNode, parentTarget, producedBy, producedAs, value, target } = params;

  if (Object.hasOwnProperty.call(target, producedBy) && value[producedBy] === target[producedBy]) {
    return;
  }

  const child = parentNode.createChild(producedBy, producedAs, parentTarget);

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  cloneInternal(child);

  if (!child.isItMissed) {
    cloneKaPProcessors[producedAs](parentNode, child);
  }
}

function copyKeysAndProperties(parentNode: Node, children: ChildrenKeys, parentTarget?: Node): void {
  const value: object = <object>parentNode.value;
  const target: object = <object>parentNode.target;

  for (const producedAs of ProducedAsIntSet) {
    for (const producedBy of children[producedAs]) {
      copyKaPInternal({ parentNode, parentTarget, producedBy, producedAs, value, target });
    }
  }
}


function cloneInternal(node: Node): void {
  const finalOptions = node.summary.cloneOptions;

  if (finalOptions.customizer) {
    node.target = finalOptions.customizer(new CustomizerParams(node));
  }

  node.setFlags();
  node.addToNodesToLabels();

  if (!node.isItProcessed) {
    node.createInstance();
    copyKeysAndProperties(node, node.childKeys);
  }
}

export interface CustParamsAccSoft<ACC> extends CustomizerParams {
  accumulator: ACC & { [key: PropertyKey]: unknown }
}

export interface CustParamsAccStrict<ACC> extends CustomizerParams {
  accumulator: ACC
}

type CloneAccumulator<OPT> = OPT extends { accumulator: Results['accumulator']}
  ? OPT['accumulator'] & { [key: PropertyKey]: unknown }
  : Results['accumulator'];

type CloneResult<SOURCE, OPT> = OPT extends { customizer: FinalCloneOptions['customizer'] } ? any : SOURCE;

interface CloneVerboseReturnType<SOURCE,OPT> extends Results {
  result: CloneResult<SOURCE, OPT>,
  accumulator: CloneAccumulator<OPT>,
}

export type CloneReturnType<SOURCE, OPT> = OPT extends { output: 'verbose' }
  ? CloneVerboseReturnType<SOURCE,OPT>
  : SOURCE;

export function clone<
  SOURCE, OPT extends CloneOptions
>(original: SOURCE, rawOptions?: OPT): CloneReturnType<SOURCE,OPT> {
  const summary = new Summary([original], 'clone', rawOptions);
  const node = summary.roots[0];

  cloneInternal(node);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return rawOptions?.output === 'verbose'
    ? summary.setAndGetResult(node.target)
    : node.target;
}

type CombineReturnType<OPT> = OPT extends { output: 'verbose' }
  ? Results : Node['target']

// export function combine<OPT extends RawCombineOptions>(
//   originals: node['value'][],
//   rawOptions?: OPT,
// ): CombineReturnType<OPT> {
//   if (!Array.isArray(originals)) {
//     throw new TypeError('First argument of combine() must be an array of originals.');
//   }

//   const summary = new Summary(originals, 'combine', rawOptions);
// }
