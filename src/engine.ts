import {
  MISSING,
  Source,
  Summary,
  Results,
  CustomizerParams,
  RawCloneOptions,
  FinalCloneOptions,
} from './service';

type LenkaArray = any[]
type LenkaSet = Set<any>
type LenkaMap = Map<any, any>

interface DCArrayBuffer extends ArrayBuffer {
  prototype: {
    slice: (start, end) => ArrayBuffer
  }
}

function customCopy(source: Source): void {
  const finalOptions = source.summary.finalOptions;

  if (finalOptions.customizer) {
    source.target = finalOptions.customizer(new CustomizerParams(source));
  }

  source.setFlags();
  source.addToSourcesToLabels();
}

function createAndRegister(
  source: Source, 
  params: unknown[] = []
  ): void {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const target: any = Reflect.construct(source.value.constructor, params);
  source.target = target;
}

function copyProperty(parent: Source, child: Source): void {
  const key = <PropertyKey>child.producedBy;

  if (child.summary.finalOptions.descriptors) {
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

function copyProperties(
  source: Source,
  restrictedProperties: PropertyKey[],
): void {
  const value: object = <object>source.value;
  const target: object = <object>source.target;

  for (const key of Reflect.ownKeys(value)) {
    if (
      restrictedProperties.includes(key) 
      || Object.hasOwnProperty.call(target, key) && value[key] === target[key]
    ) {
      continue;
    }

    const child = source.createChild(key, 'property');
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    root(child);

    if (!child.isItMissed) {
      copyProperty(source, child);
    }
  }
}

function cloneSet(source: Source): void {
  createAndRegister(source);

  for (const parentKey of (source.value as LenkaSet).values()) {
    const child = source.createChild(parentKey, 'value');
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    root(child);

    if (child.target !== MISSING) {
      (source.target as Set<any>).add(child.target);
    }
  }
}

function cloneMap(source: Source): void {
  createAndRegister(source);

  for (const parentKey of (source.value as LenkaMap).keys()) {
    const child = source.createChild(parentKey, 'key');
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    root(child);

    if (child.target !== MISSING) {
      (source.target as Map<any, any>).set(parentKey, child.target);
    }
  }
}

function cloneArrayBuffer(source: Source): void {
  if (typeof (source.value as DCArrayBuffer).slice === 'function') {
    // eslint-disable-next-line unicorn/prefer-spread
    source.target = (source.value as DCArrayBuffer).slice(0);
  } else {
    const originalUnit8Array = new Uint8Array(source.value as DCArrayBuffer);
    createAndRegister(source, [originalUnit8Array.length]);
    const copyUnit8Array = new Uint8Array(<DCArrayBuffer>source.target);

    for (const [index, value] of originalUnit8Array.entries()) {
      copyUnit8Array[index] = value;
    }
  }
}

function root(source: Source): void {
  customCopy(source);

  if (source.isItProcessed) {
    return;
  }

  const restrictedProperties: string[] = []

  switch (source.type) {
    case 'object':
      createAndRegister(source);
      break;

    case 'array':
      createAndRegister(source, [(source.value as LenkaArray).length]);
      restrictedProperties.push('length');
      break;

    case 'set':
      cloneSet(source);
      break;
    
    case 'map':
      cloneMap(source);
      break

    case 'arraybuffer':
      cloneArrayBuffer(source);
      break

    case 'date':
      createAndRegister(source, [+source.value]);
      break;

    case 'dataview':
      createAndRegister(source, [(source.value as DataView).buffer]);
      break;

    case 'regexp':
      createAndRegister(source, [(source.value as RegExp).source, (source.value as RegExp).flags]);
      break;
  }

  copyProperties(source, restrictedProperties);
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
  SOURCE, OPT extends RawCloneOptions
>(original: SOURCE, rawOptions?: OPT): CloneReturnType<SOURCE,OPT> {
  const summary = new Summary([original], rawOptions);
  const source = summary.roots[0];

  root(source);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return rawOptions?.output === 'verbose'
    ? summary.setAndGetResult(source.target)
    : source.target;
}
