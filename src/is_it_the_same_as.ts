/* eslint-disable @typescript-eslint/no-use-before-define */
// eslint-disable-next-line prettier/prettier
const modes = ['soft', 'moderate', 'strict', 'draconian'] as const;

type Mode = typeof modes[number];

export interface IsSameOptions {
  mode: Mode
}

function objectPropertiesCheck(original: any, toCompare: any, modeIndex: number): boolean {
  return modeIndex > 2 // if 'draconian'
    ? Object.isExtensible(original) === Object.isExtensible(toCompare)
      && Object.isFrozen(original) === Object.isFrozen(toCompare)
      && Object.isSealed(original) === Object.isSealed(toCompare)
    : true
}

function isDescriptorsDifferent(first: PropertyDescriptor, second: PropertyDescriptor): boolean {
  return first.enumerable !== second.enumerable
         || first.writable !== second.writable
         || first.configurable !== second.configurable
         || first.get !== second.get && first.get?.toString() !== second.get?.toString()
         || first.set !== second.set && first.set?.toString() === second.set?.toString()
}

function isSameSet(original: any, toCompare: any, modeIndex: number, processedNodes: Array<object>): boolean {
  if (!(toCompare instanceof Set) || modeIndex > 1 && original.constructor !== toCompare.constructor) {
    return false;
  }

  return sameInternal([...original], [...toCompare], modeIndex, processedNodes);
}

function isSameMap(original: any, toCompare: any, modeIndex: number, processedNodes: Array<object>): boolean {
  if (
    !(toCompare instanceof Map) 
    || modeIndex > 1 && original.constructor !== toCompare.constructor
    || original.size !== toCompare.size
  ) {
    return false;
  }

  for (const [key, value] of ((original as Map<any, any>).entries())) {
    if (!sameInternal(value, toCompare.get(key), modeIndex, processedNodes)) {
      return false;
    }
  }

  return true;
}

function isSameArray(original: any, toCompare: any, modeIndex: number, processedNodes: Array<object>): boolean {
  if (original === toCompare || processedNodes.includes(original as object)) {
    return true;
  }

  processedNodes.push(original as object);

  if (modeIndex > 1 && original.constructor !== toCompare.constructor) {
    return false;
  }

  if (original.length !== toCompare.length) {
    return false;
  }

  for (const [index, origItem] of (original as any[]).entries()) {
    if (!sameInternal(origItem, toCompare[index], modeIndex, processedNodes)) {
      return false;
    }
  }

  return objectPropertiesCheck(original, toCompare, modeIndex)
}

function isSameObject(original: any, toCompare: any, modeIndex: number, processedNodes: Array<object>): boolean {
  if (original === toCompare || processedNodes.includes(original as object)) {
    return true;
  }

  processedNodes.push(original as object);

  if (modeIndex > 1 && original.constructor !== toCompare.constructor) {
    return false;
  }

  const origKeys = Reflect.ownKeys(original as object);
  const toCompKeys = Reflect.ownKeys(toCompare as object);

  if (origKeys.length !== toCompKeys.length) {
    return false;
  }

  for (const keyName of origKeys) {
    if (
      modeIndex === 3 && isDescriptorsDifferent(
          Object.getOwnPropertyDescriptor(original, keyName),
          Object.getOwnPropertyDescriptor(toCompare, keyName)
        )
    ) {
      return false;
    }

    if (!sameInternal(original[keyName], toCompare[keyName], modeIndex, processedNodes)) {
      return false;
    }
  }

  return objectPropertiesCheck(original, toCompare, modeIndex);
}

/* eslint-enable @typescript-eslint/no-use-before-define */

function sameInternal(original: any, toCompare: any, modeIndex: number, processedNodes: Array<object>): boolean {
  if (original instanceof Set) {
    return isSameSet(original, toCompare, modeIndex, processedNodes);
  }

  if (original instanceof Map) {
    return isSameMap(original, toCompare, modeIndex, processedNodes);
  }

  if (Array.isArray(original) && Array.isArray(toCompare)) {
    return isSameArray(original, toCompare, modeIndex, processedNodes);
  }

  if (typeof original === 'object' && typeof toCompare === 'object') {
    return isSameObject(original, toCompare, modeIndex, processedNodes);
  }

  if (typeof original === 'function' && typeof toCompare === 'function') {
    return original === toCompare || 
      (original as () => void).toString() === (toCompare as () => void).toString();
  }

  return modeIndex > 0 ? original === toCompare : original == toCompare;
}

export function isItTheSameAs(original: any, toCompare: any, options?: IsSameOptions): boolean {
  if (options?.mode && !modes.includes(options.mode)) {
    throw new Error(`Unknown mode: "${options.mode}". Valid values are ${
      modes.map((item) => '"' + item + '"').join(', ')
    }`);
  }

  const modeIndex = modes.indexOf(options.mode);
  return sameInternal(original, toCompare, modeIndex, []);
}
