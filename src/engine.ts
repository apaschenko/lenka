import {
  Source,
  Summary,
  Results,
  CustomizerParams,
  CloneOptions,
  FinalCloneOptions,
  ProducedAs,
  ProducedAsIntSet,
  ChildrenKeys,
} from './service';

function cloneProperty(parent: Source, child: Source): void {
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

const cloneKaPProcessors: Record<ProducedAs, (source: Source, child: Source) => void> = {
  property: (source: Source, child: Source) => { cloneProperty(source, child); },
  key: (source: Source, child: Source) => { (source.target as Map<any, any>).set(child.producedBy, child.target); },
  value: (source: Source, child: Source) => { (source.target as Set<any>).add(child.target); },
  root: (_source: Source, _child: Source) => { throw new TypeError(`Internal error E01.`) },
} as const;

function copyKaPInternal(params: {
  parentSource: Source,
  producedBy: Source['_producedBy'],
  producedAs: Source['_producedAs'],
  value: object,
  target: object,
  parentTarget?: Source,
}) {
  const { parentSource, parentTarget, producedBy, producedAs, value, target } = params;

  if (Object.hasOwnProperty.call(target, producedBy) && value[producedBy] === target[producedBy]) {
    return;
  }

  const child = parentSource.createChild(producedBy, producedAs, parentTarget);

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  cloneInternal(child);

  if (!child.isItMissed) {
    cloneKaPProcessors[producedAs](parentSource, child);
  }
}

function copyKeysAndProperties(parentSource: Source, children: ChildrenKeys, parentTarget?: Source): void {
  const value: object = <object>parentSource.value;
  const target: object = <object>parentSource.target;

  for (const producedAs of ProducedAsIntSet) {
    for (const producedBy of children[producedAs]) {
      copyKaPInternal({ parentSource, parentTarget, producedBy, producedAs, value, target });
    }
  }
}


function cloneInternal(source: Source): void {
  const finalOptions = source.summary.cloneOptions;

  if (finalOptions.customizer) {
    source.target = finalOptions.customizer(new CustomizerParams(source));
  }

  source.setFlags();
  source.addToSourcesToLabels();

  if (!source.isItProcessed) {
    source.createInstance();
    copyKeysAndProperties(source, source.childKeys);
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
  const source = summary.roots[0];

  cloneInternal(source);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return rawOptions?.output === 'verbose'
    ? summary.setAndGetResult(source.target)
    : source.target;
}

type CombineReturnType<OPT> = OPT extends { output: 'verbose' }
  ? Results : Source['target']

// export function combine<OPT extends RawCombineOptions>(
//   originals: Source['value'][],
//   rawOptions?: OPT,
// ): CombineReturnType<OPT> {
//   if (!Array.isArray(originals)) {
//     throw new TypeError('First argument of combine() must be an array of originals.');
//   }

//   const summary = new Summary(originals, 'combine', rawOptions);
// }
