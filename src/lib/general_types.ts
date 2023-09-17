export const ProducedAsIntSet = ['key', 'property', 'value'] as const;
export type ProducedAsInt = typeof ProducedAsIntSet[number];
export type ProducedAs = ProducedAsInt | 'root';
