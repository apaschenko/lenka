// import {
//   KeyType,
//   MISSING,
//   BY_DEFAULT,
//   StrategySet,
//   Strategy,
//   ResultStrategy,
//   Path,
// } from './general';
// import {
//   getType,
//   PieceType,
//   ExtPieceType,
//   isPrimitiveType,
//   isNonMergeableType,
//   isInvalidParamPieceType,
//   ParamPieceType,
//   PieceTypeSet,
//   ExtPieceTypeSet,
// } from './internal';

// export interface AssignCustParams {
//   accumulator: Record<string, any>,
//   currentTarget: any,
//   currentSource: any,
//   parentTarget: object,
//   parentSource: object,
//   parentTargetType: ExtPieceType,
//   parentSourceType: ExtPieceType,
//   path: Path,
//   targetRoot: any,
//   sourceRoot: any,
//   level: number,
//   isItACycle: boolean,
// }

// type ObjectStrategy = Record<ParamPieceType, Strategy>

// export interface AssignOptions {
//   customizer?: (params: AssignCustParams) => any,
//   accumulator?: AssignCustParams['accumulator'],
//   strategy?: Strategy | ObjectStrategy
// };

// interface FinalOptions {
//  customizer: AssignOptions['customizer'],
//  accumulator: AssignOptions['accumulator'],
//  strategy: Record<PieceType, ResultStrategy>,
// }

// interface InternalData {
//   targetRoot: any,
//   sourceRoot: any,
//   targetType: ExtPieceType
//   sourceType: ExtPieceType
//   originalItems: Set<any>,
//   sourceToTarget: Map<any, any>,
//   circulars: {
//     parentOriginalObject: any,
//     parentKey: KeyType,
//     original: any,
//   }[],
// };

// function getExtendedType(wtf: any, key: KeyType): ExtPieceType {
//   const wtfType = getType(wtf);
//   return (isPrimitiveType(wtfType) || !(key in wtf)) ? MISSING : wtfType;
// }

// function assignInternal(target: any, source: any, options: FinalOptions, internalData: InternalData): any {
//   const { sourceType, targetType } = internalData;
//   const { strategy } = options;

//   if (sourceType === MISSING) {
//     return ;
//   }

//   switch (sourceType) {
//     case 'primitive':
//       return strategy['primitive'] === '' source;
//   }
// };

// function checkStrategy(strategy: Strategy, pieceType: ParamPieceType): void {
//   if (!StrategySet.includes(strategy)) {
//     throw new Error(
//       `Invalid option: Unknown strategy (${strategy}) for the "${pieceType}" type. Valid values are: `
//         + StrategySet.map((item) => `"${item}"`).join(', ')
//         + ' (case insensitive).',
//     );
//   }
// }

// function checkPieceType(type: ExtPieceType): void {
//   if (!ExtPieceTypeSet.includes(type)) {
//     throw new Error(
//       `Unknown Piece Type (${String(type)}) in options.strategy params. Valid values are: `
//         + PieceTypeSet.map((item) => `"${item}"`).join(', ')
//         + ' (case insensitive).',
//     )
//   }
// }

// export function assign(target: any, source: any, options?: AssignOptions) {
//   const internalData: InternalData = {
//     targetRoot: target,
//     sourceRoot: source,
//     targetType: getType(target),
//     sourceType: getType(source),
//     originalItems: new Set(),
//     sourceToTarget: new Map(),
//     circulars: [],
//   };

//   const objectOptions = options || {}

//   const defaultStrategy: Strategy = typeof objectOptions.strategy === 'string';
//     ? options.strategy as Strategy
//     : (options?.strategy?.['*'] as Strategy) || 'default';

//   checkStrategy(defaultStrategy, '*');

//   const objectStrategy: Partial<ObjectStrategy>
//     = typeof options?.strategy === 'object' ? options.strategy as ObjectStrategy : {};

//   Object.keys(objectStrategy).forEach(checkPieceType);

//   const finalOptions: FinalOptions = {
//     customizer: objectOptions.customizer,
//     accumulator: 'accumulator' in objectOptions ? objectOptions.accumulator : {},
//     strategy: PieceTypeSet.reduce(
//       (resultStrategy, pieceType) => {
//         const currentStrategy = objectStrategy[pieceType] || defaultStrategy;

//         checkStrategy(currentStrategy, pieceType);
//         if (currentStrategy === 'default') {
//           resultStrategy[pieceType] = isNonMergeableType(pieceType) ? 'assign' : 'merge';
//         } else {
//           resultStrategy[pieceType] = currentStrategy;
//         }
//         return resultStrategy;
//       },
//       {} as FinalOptions['strategy'],
//     ),
//   }

//   return assignInternal(target, source, finalOptions, internalData);
// };
