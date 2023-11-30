export type LAccumulatorType = Record<PropertyKey, any>;

export const OutputTypeSet = ['simple', 'verbose'] as const;
export type LOutputType = typeof OutputTypeSet[number];

export const ProducedAsIntSet = ['keys', 'properties', 'items'] as const;
export type LProducedAsInt = typeof ProducedAsIntSet[number];
export type LProducedAs = LProducedAsInt | 'root';

export type OperationType = 'combine' | 'clone';

export const DefaultActionParamsDiff = {
  byProperties: true,
  byKeys: false,
  byValues: false,
  byArrayKeys: false,
  namesItemsToProps: false,
  namesKeysToProps: false,
  
  valuesFromProps: false,
  valuesFromKeys: false,
};

export interface DCArrayBuffer extends ArrayBuffer {
  prototype: {
    slice: (start, end) => ArrayBuffer
  }
}

