import {
  Source,
  Summary,
  Results,
  CustomizerParams,
  RawCloneOptions,
  FinalCloneOptions,
} from './service';

interface DCArrayBuffer extends ArrayBuffer {
  prototype: {
    slice: (start, end) => ArrayBuffer
  }
}

function customCopy(source: Source): void {
  const finalOptions = source.summary.finalCloneOptions;

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

  if (child.summary.finalCloneOptions.descriptors) {
    const descr = Object.getOwnPropertyDescriptor(parent.value, key);

    if (!(descr.get || descr.set)) {
      descr.value = child.target;
    }

    Object.defineProperty(parent.target, key, { ...descr })
  } else {
    parent.target[key] = child.target;
  }
}

function copyKeysAndProperties(source: Source): void {
  const value: object = <object>source.value;
  const target: object = <object>source.target;

  for (const { producedBy, producedAs } of source.childrenPartial) {
    if (Object.hasOwnProperty.call(target, producedBy) && value[producedBy] === target[producedBy]
    ) {
      continue;
    }

    const child = source.createChild(producedBy, producedAs);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    root(child);

    if (!child.isItMissed) {
      switch (producedAs) {
        case 'property':
          copyProperty(source, child);
          break;
        
        case 'key':
          (source.target as Map<any, any>).set(producedBy, child.target);
          break;

        case 'value':
          (source.target as Set<any>).add(child.target);
          break;
      }
      
    }
  }
}

function root(source: Source): void {
  customCopy(source);

  if (source.isItProcessed) {
    return;
  }

  switch (source.type) {
    case 'array':
      createAndRegister(source, [(source.value as any[]).length]);
      break;

    case 'arraybuffer':
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
      break;

    case 'date':
      createAndRegister(source, [+source.value]);
      break;

    case 'dataview':
      createAndRegister(source, [(source.value as DataView).buffer]);
      break;

    case 'regexp':
      createAndRegister(source, [(source.value as RegExp).source, (source.value as RegExp).flags]);
      break;

    default:
      createAndRegister(source);
      break;
  }

  copyKeysAndProperties(source);
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
  const summary = new Summary([original], 'clone', rawOptions);
  const source = summary.roots[0];

  root(source);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return rawOptions?.output === 'verbose'
    ? summary.setAndGetResult(source.target)
    : source.target;
}
