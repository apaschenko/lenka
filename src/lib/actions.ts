import {
  LAction,
  LActionCustom,
  LActionParams,
  LActionParamsDiff,
  LActionCoverageSingle, 
  LActor,
  LActorFunction,
  PredefinedActorsSet,
  LPredefinedActors,
  PredefActCoverTypes,
  PredefActCoverSet,
  TypeChecker,
  LFinalAction,
  LCombineSource,
  LCombineParams, 
  LChildren,
  ChildrenProducedBySet,
  LChildrenValues
} from './ifaces';
import { PrimitiveTypesSet, CollectionsTypes, ExtendedPieceType } from './piece_types';
import { ProducedAsIntSet, DefaultActionParamsDiff, LProducedAsInt } from './general_types';
import { quotedListFromArray } from './utils';
import { CombineSource } from './combine_source';
import { LenkaNode } from './node';

const ActionKeys = new Set(['coverage', 'actor', 'params']);

const extendVocabulary: readonly PredefActCoverTypes[] =
  ['object', 'array', 'map', 'set', 'collection', 'keyholder', 'vocabulary'] as const;
const extendPrimitive: readonly PredefActCoverTypes[] = [...PrimitiveTypesSet, 'primitive'];
const extendAll: readonly PredefActCoverTypes[] = [...extendPrimitive, ...extendVocabulary, 'all', '*'] as const;

function singleTypeChecker(compareWith: PredefActCoverTypes, combineSource: LCombineSource) {
  return combineSource._internalType === compareWith;
}

const TypeCheckers: Record<PredefActCoverTypes, { extend: readonly PredefActCoverTypes[], run: TypeChecker }> = {
  string: {
    extend: ['string'],
    run: singleTypeChecker.bind(null, 'string'),
  },
  number: {
    extend: ['number'],
    run: singleTypeChecker.bind(null, 'number'),
  },
  bigint: {
    extend: ['bigint'],
    run: singleTypeChecker.bind(null, 'bigint'),
  },
  boolean: {
    extend: ['boolean'],
    run: singleTypeChecker.bind(null, 'boolean'),
  },
  symbol: {
    extend: ['symbol'],
    run: singleTypeChecker.bind(null, 'symbol'),
  },
  undefined: {
    extend: ['undefined'],
    run: singleTypeChecker.bind(null, 'undefined'),
  },
  null: {
    extend: ['null'],
    run: singleTypeChecker.bind(null, 'null'),
  },
  primitive: {
    extend: extendPrimitive,
    run: (combineSource: LCombineSource) => { return combineSource._isPrimitive; },
  },
  object: {
    extend: ['object'],
    run: singleTypeChecker.bind(null, 'object'),
  },
  array: {
    extend: ['array'],
    run: singleTypeChecker.bind(null, 'array'),
  },
  map: {
    extend: ['map'],
    run: singleTypeChecker.bind(null, 'map'),
  },
  set: {
    extend: ['set'],
    run: singleTypeChecker.bind(null, 'set'),
  },
  keyholder: {
    extend: ['set', 'map', 'keyholder'],
    run: (combineSource: CombineSource) => {
      return (['set', 'map'] as ExtendedPieceType[]).includes(combineSource._internalType)
    },
  },
  collection: {
    extend: ['array', 'set', 'collection'],
    run: (combineSource: LCombineSource) => { 
      return ['array', 'set'].includes(combineSource._internalType as string) 
    },
  },
  vocabulary: {
    extend: extendVocabulary,
    run: (combineSource: LCombineSource) => { return !combineSource._isPrimitive; },
  },
  all: {
    extend: extendAll,
    run: () => { return true; },
  },
  '*': {
    extend: extendAll,
    run: () => { return true; },
  },
} as const;

type PredefinedActorType = {
  actor: LActorFunction;
  coverage: [PredefActCoverTypes[], PredefActCoverTypes[]];
  defaultParams: LActionParams;
  paramsValidatorAndBuilder:
    (rawAction: LAction, predefinedActor: PredefinedActorType, actorName: LPredefinedActors) => LActionParams;
  extendedCoverage?: [Set<PredefActCoverTypes>, Set<PredefActCoverTypes>];
};

function generalValidatorAndBuilder(
  rawAction: LAction,
  predefinedActor: PredefinedActorType,
  actorName: LPredefinedActors
) {
  const { params } = rawAction as LActionCustom;
  const { defaultParams } = predefinedActor;

  if (typeof params === 'undefined') {
    return defaultParams;
  }
  const validKeys = Object.keys(defaultParams);

  if (validKeys.length === 0) {
    throw new TypeError(
      `You are trying to pass parameters to the "${actorName}" actor, but it doesn't expect any parameters.`
    );
  }

  if (typeof params !== 'object') {
    throw new TypeError(
      `If you pass parameters to the "${actorName}", the parameters must be an object but not a(n) ${typeof params};`
    );
  }

  for (const [key, value] of Object.entries(params)) {
    if (!validKeys.includes(key)) {
      throw new TypeError(
        `You are trying to pass unknown "${key}" parameter to the "${actorName}" actor. ` +
        `Valid parameters for this actor are ${quotedListFromArray(validKeys)}.`
      );
    }

    const expectedType = typeof defaultParams[key];
    if (typeof value !== expectedType) {
      throw new TypeError(
        `"${key}" parameter of "${actorName}" actor must be a(n) ${expectedType}, but not a(n) ${typeof value}.`
      );
    }
  }

  return { ...defaultParams, ...params };
}

const emptySet = new Set();

const defaultAction: PredefinedActorType = {
  coverage: [['all'], ['all']],
  defaultParams: {},
  paramsValidatorAndBuilder: generalValidatorAndBuilder,
  actor: function(combineParams: LCombineParams) {
    const { bases, scheme } = combineParams;

    combineParams.selectBase(bases[1]);

    if (!bases[1].isItAPrimitive) {
      const targetIsNotMap = bases[1]._internalType !== 'map';
  
      for (const childrenTyped of Object.values(scheme)) {
        for (const childrenByKey of childrenTyped.values()) {
          const child = childrenByKey[childrenByKey.length - 1]
          // TODO check it!
          child.setProducedAs(targetIsNotMap && child.producedAs === 'key' ? 'property' : child.producedAs)
            .add();
        }
      }
    }
  }
}

export const PredefinedActorFunctions: Record<LPredefinedActors, PredefinedActorType> = {
  merge: defaultAction,

  replace: defaultAction,

  diff: {
    coverage: [['vocabulary'], ['all']],
    defaultParams: DefaultActionParamsDiff,
    paramsValidatorAndBuilder: function(
      rawAction: LAction,
      predefinedActor: PredefinedActorType,
      actorName: LPredefinedActors,
    ) {
      const resultParams = generalValidatorAndBuilder(rawAction, predefinedActor, actorName);

      if (!(resultParams.byProperties || resultParams.byKeys || resultParams.byArrayKeys || resultParams.byValues)) {
        throw new TypeError(
          `Calling "diff" actor is meaningless when all "byProperties", "byKeys", "byArrayKeys"` +
            ` and "byValues" parameters are false.`
        );
      }

      return { ...resultParams, keysPropsMix: resultParams.keysPropsMix || resultParams.propsKeysMix };
    },
    // eslint-disable-next-line sonarjs/cognitive-complexity
    actor: function(combineParams: LCombineParams, actorParams: LActionParams) {
      const { bases, scheme } = combineParams;
      const {
        byProperties,
        byKeys,
        byValues,
        byArrayKeys,
        keysPropsMix,
        valuesFromProps,
        valuesFromKeys,
      } = actorParams as unknown as LActionParamsDiff;
  
      combineParams.selectBase(bases[0]);

      const KPNeedsToBeMixed = keysPropsMix && !TypeCheckers.keyholder.run(bases[0]);

      const secondBaseKPINames: LChildren<ChildrenProducedBySet> = { ...bases[1].childrenKeys };
      if (byProperties) {
        if (KPNeedsToBeMixed) {
          secondBaseKPINames.property = new Set();
          for (const keyType of (['property', 'key'] as LProducedAsInt[])) {
            for (const producedBy of bases[1].childrenKeys[keyType].values()) {
              secondBaseKPINames.property.add(producedBy);
            }
          }
        }
      } else {
        secondBaseKPINames.property = emptySet;
      }
      if (!byKeys) {
        secondBaseKPINames.key = emptySet;
      }
      if (!byArrayKeys) {
        secondBaseKPINames.key = emptySet;
      }

      const secondBaseValues = byValues 
        ? bases[1].getChildrenValues(valuesFromProps, valuesFromKeys, KPNeedsToBeMixed) 
        : LenkaNode.emptyChildrenSet<LChildrenValues['property']>(() => { return emptySet; })

      for (const keyType of ProducedAsIntSet) {
        const secBaseKPINamesTyped = secondBaseKPINames[keyType];
        const secBaseValuesTyped = secondBaseValues[keyType];

        for (const [child0] of scheme[keyType].values()) {
          if (child0.index === 0 && !secBaseKPINamesTyped.has(child0.key) && !secBaseValuesTyped.has(child0.value)) {
            child0.add();
          }
        }
      }
    },
  },
}

function lazyGetExtendedCoverage(actorName: LPredefinedActors, sourceIndex: number): Set<PredefActCoverTypes> {
  const actorDescriptor = PredefinedActorFunctions[actorName];

  if (!actorDescriptor.extendedCoverage) {
    actorDescriptor.extendedCoverage = actorDescriptor.coverage.map((coverForArg) => {
      return coverForArg.reduce((extCoverForArg, coverItem) => {
        for (const extCoverItem of TypeCheckers[coverItem].extend) {
          extCoverForArg.add(extCoverItem);
        }
        return extCoverForArg;
      }, new Set<PredefActCoverTypes>());
    }) as PredefinedActorType['extendedCoverage'];
  }

  return actorDescriptor.extendedCoverage[sourceIndex];
}

export class FinalAction implements LFinalAction {
  constructor(rawAction: LAction) {
    if (typeof rawAction !== 'object') {
      this.throwError();
    }

    const keys = Object.keys(rawAction);

    if (keys.length !== 2 || !keys.every((key) => { return ActionKeys.has(key as keyof LAction); })) {
      this.throwError();
    }
  
    const { coverage, actor, params } = rawAction;

    switch (typeof actor) {
      case 'function':
        this._actor = actor;
        this._params = params;
        break;

      case 'string':
        if (!PredefinedActorsSet.includes(actor)) {
          throw new TypeError(
            `Unknown predefined actor "${actor}". Valid values are ${quotedListFromArray(PredefinedActorsSet)}.`
          );
        }
        // eslint-disable-next-line no-case-declarations
        const predefinedActor = PredefinedActorFunctions[actor];
        this._actor = predefinedActor.actor;
        this._params = predefinedActor.paramsValidatorAndBuilder(rawAction, predefinedActor, actor)
        break;

      default:
        throw new TypeError(
          `Actor can't be a ${typeof actor}. It must be either a ` +
          `function or a string representing one of the preset values.`
        );
    }

    if (Array.isArray(coverage)) {
      if (coverage.length !== 2) {
        throw new TypeError(
          "When action's coverage is specified as an array, that array must contains exactly two elements: " +
          'coverage for the first and second parameters.');
      }

      this._coverage = coverage.map((item, index) => {
        return this.singleCoverageValidatorAndBuilder(item, index, actor);
      }) as [TypeChecker[], TypeChecker[]];
    } else {
      this._coverage = [
        this.singleCoverageValidatorAndBuilder(coverage, 0, actor), 
        this.singleCoverageValidatorAndBuilder(coverage, 1, actor)
      ];
    }
  }

  tryToRun(params: LCombineParams) {
    const condition = params.bases.every((source, index) => { 
      return this._coverage[index].some((checker) => checker(source)); 
    });
    if (condition) {
      this._actor(params, this._params);
    }
    return !condition;
  }

  private singleCoverageValidatorAndBuilder(coverage: LActionCoverageSingle, index: number, actor: LActor) {
    switch (typeof coverage) {
      case 'function':
        return [coverage];

      case 'string':
        return coverage.split(',').map((item) => {
          const type = <CollectionsTypes>item.trim().toLowerCase();

          if (typeof actor === 'string' && !lazyGetExtendedCoverage(actor, index).has(type)) {
            const argIndex = index === 0 ? 'first source' : 'second source';

            const errorTail = `Valid coverage options for the ${argIndex} of "${actor}" actor are function or string ` +
              `which contains comma separated list of ${
                quotedListFromArray([...lazyGetExtendedCoverage(actor, index).values()])
              } in any combinations.`;

            throw new TypeError(
              PredefActCoverSet.includes(type)
              ? `Predefined "${actor}" actor is not defined on "${type}" type. ${errorTail}`
              : `Unknown action's coverage value "${coverage}". ${errorTail}`
            );
          }

          return TypeCheckers[type].run;
        });

      default:
        throw new TypeError(
          `Action coverage can't be a ${typeof coverage}. It must be either ` +
          `a function or a string representing one of the preset values.`
        );
    }
  }

  private throwError() {
    throw new TypeError(
      'Each item of options.actions array must be an object with mandatory "coverage" and "actor" properties, and ' +
        'optional "params" property.'
    );
  }

  private _coverage: [TypeChecker[], TypeChecker[]];

  private _actor: LActorFunction;

  private _params: LActionParams;
}
