import {
  LAction,
  LActionCustom,
  LActionParams,
  LActionParamsDiff,
  LActorFunction,
  PredefinedActorsSet,
  LPredefinedActors,
  LFinalAction,
  LCombineParams, 
  LChildren,
  ChildrenProducedBySet,
  LChildrenValues,
  TypeChecker
} from './ifaces';
import { ProducedAsIntSet, DefaultActionParamsDiff, LProducedAsInt } from './general_types';
import { quotedListFromArray } from './utils';
import { LenkaNode } from './node';
import { LCoverage, FinalCoverSet } from './coverage';

const actionCoverage = new LCoverage();
const ActionKeys = new Set(['coverage', 'actor', 'params']);

const extendedAll = actionCoverage.extendType('all');
const maxCoverage: [FinalCoverSet, FinalCoverSet] = [extendedAll, extendedAll];

type PredefinedActorType = {
  actor: LActorFunction;
  coverage: [FinalCoverSet, FinalCoverSet];
  defaultParams: LActionParams;
  paramsValidatorAndBuilder:
    (rawAction: LAction, predefinedActor: PredefinedActorType, actorName: LPredefinedActors) => LActionParams;
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
  coverage: [extendedAll, extendedAll],
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
          child.setProducedAs(targetIsNotMap && child.producedAs === 'keys' ? 'properties' : child.producedAs)
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
    coverage: [actionCoverage.extendType('vocabulary'), extendedAll],
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
        valuesFromProps,
        valuesFromKeys,
      } = actorParams as unknown as LActionParamsDiff;
  
      combineParams.selectBase(bases[0]);

      const KPNeedsToBeMixed = false // keysPropsMix && !TypeCheckers.keyholder.run(bases[0]);

      const secondBaseKPINames: LChildren<ChildrenProducedBySet> = { ...bases[1].childrenKeys };
      if (byProperties) {
        if (KPNeedsToBeMixed) {
          secondBaseKPINames.properties = new Set();
          for (const keyType of (['properties', 'keys'] as LProducedAsInt[])) {
            for (const producedBy of bases[1].childrenKeys[keyType].values()) {
              secondBaseKPINames.properties.add(producedBy);
            }
          }
        }
      } else {
        secondBaseKPINames.properties = emptySet;
      }
      if (!byKeys) {
        secondBaseKPINames.keys = emptySet;
      }
      if (!byArrayKeys) {
        secondBaseKPINames.keys = emptySet;
      }

      const secondBaseValues = byValues 
        ? bases[1].getChildrenValues(valuesFromProps, valuesFromKeys, KPNeedsToBeMixed) 
        : LenkaNode.emptyChildrenSet<LChildrenValues['properties']>(() => { return emptySet; })

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

export class FinalAction implements LFinalAction {
  constructor(rawAction: LAction) {
    let maximalCoverage: [FinalCoverSet, FinalCoverSet];
    let paramsName: string;

    if (typeof rawAction !== 'object') {
      this.throwError();
    }

    const { coverage, actor, params } = rawAction;
    const keys = Object.keys(rawAction);

    if (
      typeof coverage === 'undefined' || 
      typeof actor === 'undefined' || 
      !keys.every((key) => { return ActionKeys.has(key as keyof LAction); })
    ) {
      this.throwError();
    }
  
    switch (typeof actor) {
      case 'function':
        this._actor = actor;
        this._params = params;
        maximalCoverage = maxCoverage;
        paramsName = 'custom';

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
        this._params = predefinedActor.paramsValidatorAndBuilder(rawAction, predefinedActor, actor);
        maximalCoverage = predefinedActor.coverage;
        paramsName = actor;

        break;

      default:
        throw new TypeError(
          `Actor can't be a ${typeof actor}. It must be either a ` +
          `function or a string representing one of the preset values.`
        );
    }

    this._coverage = actionCoverage.buildCoverage(
      coverage,
      maximalCoverage,
      { 
        paramsName,
        paramsType: 'actor',
      }
    );
  }

  tryToRun(params: LCombineParams) {
    const condition = params.bases.every((source, index) => { 
      return this._coverage[index].some((typeChecker) => typeChecker(source))
    });
    if (condition) {
      this._actor(params, this._params);
    }
    return !condition;
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
