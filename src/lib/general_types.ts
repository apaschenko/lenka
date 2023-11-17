export type AccumulatorType = Record<PropertyKey, any>;

export const OutputTypeSet = ['simple', 'verbose'] as const;
export type OutputType = typeof OutputTypeSet[number];

export const ProducedAsIntSet = ['key', 'property', 'setItem', 'arrayItem'] as const;
export type ProducedAsInt = typeof ProducedAsIntSet[number];
export type ProducedAs = ProducedAsInt | 'root';

export type OperationType = 'combine' | 'clone';

export const DefaultActionParamsDiff = {
  byProperties: true,
  byKeys: false,
  byValues: false,
  byArrayItems: false,
  keysPropsMix: false,
  propsKeysMix: false,
  valuesFromProps: false,
  valuesFromKeys: false,
};

export interface DCArrayBuffer extends ArrayBuffer {
  prototype: {
    slice: (start, end) => ArrayBuffer
  }
}

