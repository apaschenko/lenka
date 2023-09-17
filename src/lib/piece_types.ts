import { MISSING } from './symbols';

// eslint-disable-next-line prettier/prettier
type Extends<T, U extends T> = U;

export const PrimitiveTypesSet = [
  'boolean',
  'undefined',
  'symbol',
  'string',
  'number',
  'bigint',
  'null',
] as const;

export type PrimitiveType = typeof PrimitiveTypesSet[number];

export const ReducedObjTypesSet = [
  'date',
  'regexp',
  'function',
  'dataview',
  'arraybuffer',
] as const;

export const VocabulariesSet = ['array', 'map', 'object'] as const;

export type VocabulariesTypes = typeof VocabulariesSet[number];

export const CollectionsSet = [...VocabulariesSet, 'set'] as const; // Yes, all the vocabularies are collections too.

export type CollectionsTypes = typeof CollectionsSet[number];

export const Vocabulary = 'vocabulary' as const;

export const Collection = 'collection' as const;

export type ReducedObjType = typeof ReducedObjTypesSet[number];

export type InternalExtendedObjType = typeof CollectionsSet[number];

export type PieceType = PrimitiveType | ReducedObjType | InternalExtendedObjType;

export type ExtendedPieceType = PieceType | typeof MISSING;

export type PieceTypeWithRP = Extends<PieceType, 'array' | 'arraybuffer' | 'dataview' | 'regexp'>;
