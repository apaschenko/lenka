"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredefinedActorFunctions = void 0;
const coverage_1 = require("./coverage");
const general_types_1 = require("./general_types");
const node_1 = require("./node");
const utils_1 = require("./utils");
function generalValidatorAndBuilder(rawAction, predefinedActor, actorName) {
    const { params } = rawAction;
    const { defaultParams } = predefinedActor;
    if (typeof params === 'undefined') {
        return defaultParams;
    }
    const validKeys = Object.keys(defaultParams);
    if (validKeys.length === 0) {
        throw new TypeError(`You are trying to pass parameters to the "${actorName}" actor, but it doesn't expect any parameters.`);
    }
    if (typeof params !== 'object') {
        throw new TypeError(`If you pass parameters to the "${actorName}", the parameters must be an object but not a(n) ${typeof params};`);
    }
    for (const [key, value] of Object.entries(params)) {
        if (!validKeys.includes(key)) {
            throw new TypeError(`You are trying to pass unknown "${key}" parameter to the "${actorName}" actor. ` +
                `Valid parameters for this actor are ${(0, utils_1.quotedListFromArray)(validKeys)}.`);
        }
        const expectedType = typeof defaultParams[key];
        if (typeof value !== expectedType) {
            throw new TypeError(`"${key}" parameter of "${actorName}" actor must be a(n) ${expectedType}, but not a(n) ${typeof value}.`);
        }
    }
    return Object.assign(Object.assign({}, defaultParams), params);
}
const emptySet = new Set();
const defaultAction = {
    coverage: [coverage_1.extendedAll, coverage_1.extendedAll],
    defaultParams: {},
    paramsValidatorAndBuilder: generalValidatorAndBuilder,
    actor: function (combineParams) {
        const { bases, scheme } = combineParams;
        combineParams.selectBase(bases[1]);
        if (!bases[1].isItAPrimitive) {
            const targetIsNotMap = bases[1]._internalType !== 'map';
            for (const childrenTyped of Object.values(scheme)) {
                for (const childrenByKey of childrenTyped.values()) {
                    const child = childrenByKey[childrenByKey.length - 1];
                    // TODO check it!
                    child.setProducedAs(targetIsNotMap && child.producedAs === 'keys' ? 'properties' : child.producedAs)
                        .add();
                }
            }
        }
    }
};
exports.PredefinedActorFunctions = {
    merge: defaultAction,
    replace: defaultAction,
    diff: {
        coverage: [coverage_1.coverageBuilder.extendType('vocabulary'), coverage_1.extendedAll],
        defaultParams: general_types_1.DefaultActionParamsDiff,
        paramsValidatorAndBuilder: function (rawAction, predefinedActor, actorName) {
            const resultParams = generalValidatorAndBuilder(rawAction, predefinedActor, actorName);
            if (!(resultParams.byProperties || resultParams.byKeys || resultParams.byArrayKeys || resultParams.byValues)) {
                throw new TypeError(`Calling "diff" actor is meaningless when all "byProperties", "byKeys", "byArrayKeys"` +
                    ` and "byValues" parameters are false.`);
            }
            return Object.assign(Object.assign({}, resultParams), { keysPropsMix: resultParams.keysPropsMix || resultParams.propsKeysMix });
        },
        // eslint-disable-next-line sonarjs/cognitive-complexity
        actor: function (combineParams, actorParams) {
            const { bases, scheme } = combineParams;
            const { byProperties, byKeys, byValues, byArrayKeys, valuesFromProps, valuesFromKeys, } = actorParams;
            combineParams.selectBase(bases[0]);
            const KPNeedsToBeMixed = false; // keysPropsMix && !TypeCheckers.keyholder.run(bases[0]);
            const secondBaseKPINames = Object.assign({}, bases[1].childrenKeys);
            if (byProperties) {
                if (KPNeedsToBeMixed) {
                    secondBaseKPINames.properties = new Set();
                    for (const keyType of ['properties', 'keys']) {
                        for (const producedBy of bases[1].childrenKeys[keyType].values()) {
                            secondBaseKPINames.properties.add(producedBy);
                        }
                    }
                }
            }
            else {
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
                : node_1.LenkaNode.emptyChildrenSet(() => { return emptySet; });
            for (const keyType of general_types_1.ProducedAsIntSet) {
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
};
