import { FinalCoverSet, coverageBuilder, extendedAll } from './coverage';
import { DefaultActionParamsDiff, LProducedAsInt, ProducedAsIntSet } from './general_types';
import {
  ChildrenProducedBySet,
  LAction,
  LActionCustom,
  LActionParams,
  LActionParamsDiff,
  LActorFunction,
  LChildren,
  LChildrenValues,
  LCombineParams,
  LPredefinedActors
} from './ifaces';
import { LenkaNode } from './node';
import { quotedListFromArray } from './utils';

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
    coverage: [coverageBuilder.extendType('vocabulary'), extendedAll],
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
