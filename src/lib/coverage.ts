import { CombineSource } from './combine_source';
import { TypeChecker, LCombineSource, LActionCoverageSingle, PredefinedActorsSet, LAction } from './ifaces';
import { quotedListFromArray } from './utils';

const notVocabulary = '!vocabulary';
const notPrimitive = '!primitive';

export const PredefActCoverSet = [
  'array', '!array', 'map', '!map', 'object', '!object', 'set', '!set',
  'boolean', '!boolean', 'undefined', '!undefined', 'symbol', '!symbol', 'string', '!string', 'number', '!number',
  'bigint', '!bigint', 'null', '!null',
  'collection', '!collection', 'primitive', notPrimitive, 'vocabulary', notVocabulary, 'all', '*',
];

export type PredefActCoverTypes = typeof PredefActCoverSet[number];

export type FinalCoverSet = Set<PredefActCoverTypes>;

export interface CoverageErrorData { 
  paramsName: string,
  paramsType: string,
  place: string, 
}

const primitiveTypeChecker = (combineSource: LCombineSource) => combineSource._isPrimitive;
const vocabularyTypeChecker = (combineSource: LCombineSource) => !combineSource._isPrimitive;

export class LCoverage {
  constructor() {
    this._typeCheckers = {
      all: () => true,
      '*': () => true,
      primitive: primitiveTypeChecker,
      [notPrimitive]: vocabularyTypeChecker,
      vocabulary: vocabularyTypeChecker,
      [notVocabulary]: primitiveTypeChecker,
    };

    this.buildExtendedCoverage();
    this.buildTypeCheckers();
  }

  buildCoverage(
    coverage: LAction['coverage'],
    maximalCoverage: [FinalCoverSet, FinalCoverSet],
    errorData: Partial<CoverageErrorData>,
  ) {
    const firstSource = 'first source';
    const secondSource = 'second source';

    if (Array.isArray(coverage)) {
      if (coverage.length !== 2) {
        throw new TypeError(
          `Invalid "${errorData.paramsName}" ${errorData.paramsType} description. ` +
          `When ${errorData.paramsType}'s coverage is specified as an array, that array must contains exactly ` +
          'two elements: coverages for the first and second parameters.');
      }

      return coverage.map((item, index) => {
        return this.validateAndBuildCoverConds(
          item,
          maximalCoverage[index],
          { ...errorData, place: index === 0 ? firstSource : secondSource }
        );
      }) as [TypeChecker[], TypeChecker[]];
    } else {
      return [
        this.validateAndBuildCoverConds(
          coverage,
          maximalCoverage[0],
          { ...errorData, place: firstSource }
        ),
        this.validateAndBuildCoverConds(
          coverage,
          maximalCoverage[1],
          { ...errorData, place: secondSource }
        ),
      ] as [TypeChecker[], TypeChecker[]];
    }
  }

  validateAndBuildCoverConds(
    actionCoverage: LActionCoverageSingle,
    allowedTypes: FinalCoverSet,
    errorData: Partial<CoverageErrorData>,
  ): TypeChecker[] {
    const resultTypeCheckers: TypeChecker[] = [];

    switch (typeof actionCoverage) {
      case 'function':
        resultTypeCheckers.push(actionCoverage);
        break;

      case 'string':
        // eslint-disable-next-line no-case-declarations
        const resultCoverageArr = actionCoverage.replace(/[\t\n\v\r ]/g, '')
          .toLowerCase()
          .split(',')
          .filter((item) => item.length > 0);

        if (resultCoverageArr.length === 0) {
          throw new TypeError(
            `Coverage declaration for the "${errorData.place}" of "${errorData.paramsName}" ` +
              `${errorData.paramsType} does not contain any types.`
          );
        }

        for (const type of resultCoverageArr) {
          if (this._extendedCoverage[type]) {
            if (allowedTypes.has(type)) {
              resultTypeCheckers.push(this._typeCheckers[type]);
            } else {
              this.buildAndThrowError(
                `"${errorData.paramsName}" ${errorData.paramsType} is not defined for the "${type}" type ` +
                  `as ${errorData.place}. `,
                allowedTypes
              );
            }
          } else {
            this.buildAndThrowError(
              `Unknown type "${type}" as ${errorData.place} of "${errorData.paramsName}" ${errorData.paramsType}. `,
              allowedTypes
            );
          }
        }

        break;

      default:
        throw new TypeError(
          `Invalid "${errorData.paramsName}" ${errorData.paramsType} description. The coverage can't be a ` +
          `${typeof actionCoverage}. It must be either a function or a string representing one of the preset values (${
            quotedListFromArray(PredefinedActorsSet)
          }).`
        );
    }

    return resultTypeCheckers;
  }

  getExtendedListToErrorDescr(types: FinalCoverSet) {
    const result = new Set(...types);

    for (const [typeName, extendedSet] of Object.entries(this._extendedCoverage)) {
      if ([...extendedSet].every((type) => types.has(type))) {
        result.add(typeName);
      }
    }

    return [...result];
  }

  checkType(combineSource: CombineSource, type: PredefActCoverTypes) {
    return this._typeCheckers[type](combineSource);
  }

  extendType(type: PredefActCoverTypes) {
    return this._extendedCoverage[type];
  }

  private buildAndThrowError(error: string, allowedTypes: FinalCoverSet) {
    throw new TypeError(
      error + `Possible values for this parameter are function or string which contains comma separated list of ${
        quotedListFromArray(this.getExtendedListToErrorDescr(allowedTypes))
      } in any combinations.`
    );
  }

  private buildExtendedCoverage() {
    const extendCollection = new Set<PredefActCoverTypes>(['set', 'array', 'collection']);
    const extendPrimitive = new Set<PredefActCoverTypes>([
      'boolean', 'undefined', 'symbol', 'string', 'number', 'bigint', 'null', notVocabulary
    ]);
    const extendAll = new Set(PredefActCoverSet);

    this._extendedCoverage = {
      collection: extendCollection,
      primitive: extendPrimitive,
      all: extendAll,
      '*': extendAll,
    };

    this._extendedCoverage['!collection'] = this.inverseCoverageExtender(extendCollection);
    this._extendedCoverage[notPrimitive] = this.inverseCoverageExtender(extendPrimitive);
    this._extendedCoverage.vocabulary = this._extendedCoverage[notPrimitive];
    this._extendedCoverage[notVocabulary] = this._extendedCoverage.primitive;

    for (const type of PredefActCoverSet) {
      if (!this._extendedCoverage[type]) {
        this._extendedCoverage[type] = new Set<PredefActCoverTypes>([type]);
      }
    }
  }

  private buildTypeCheckers() {
    for (const inputType of PredefActCoverSet) {
      const resultDirectType = this._extendedCoverage[inputType];

      if (!this._typeCheckers[inputType]) {
        this._typeCheckers[inputType] = inputType.startsWith('!') 
          ? this.standardTypeChecker.bind(this, this.inverseCoverageExtender(resultDirectType))
          : this.standardTypeChecker.bind(this, resultDirectType);
      }
    }
  }

  private inverseCoverageExtender(types: FinalCoverSet) {
    const result = new Set<PredefActCoverTypes>(PredefActCoverSet);
  
    for (const type of types.values()) {
      result.delete(type);
  
      for (const [typeName, extendedType] of Object.entries(this._extendedCoverage)) {
        if (extendedType.has(type)) {
          result.delete(typeName);
        }
      }  
    }
  
    return result;
  }

  private standardTypeChecker(coverageSet: FinalCoverSet, source: CombineSource) {
    return coverageSet.has(source._internalType as PredefActCoverTypes);
  }

  private _typeCheckers: Partial<Record<PredefActCoverTypes, TypeChecker>>;

  private _extendedCoverage: Partial<Record<PredefActCoverTypes, FinalCoverSet>>;
}

export const coverageBuilder = new LCoverage();

export const extendedAll = coverageBuilder.extendType('all');

