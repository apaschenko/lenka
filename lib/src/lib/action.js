"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinalAction = void 0;
const ifaces_1 = require("./ifaces");
const utils_1 = require("./utils");
const coverage_1 = require("./coverage");
const predefined_actors_1 = require("./predefined_actors");
const ActionKeys = new Set(['coverage', 'actor', 'params']);
const maxCoverage = [coverage_1.extendedAll, coverage_1.extendedAll];
class FinalAction {
    constructor(rawAction, index) {
        let maximalCoverage;
        let paramsName;
        if (typeof rawAction !== 'object') {
            this.throwError(index);
        }
        const { coverage, actor, params } = rawAction;
        const keys = Object.keys(rawAction);
        if (typeof coverage === 'undefined' || // we can't use "!coverage" here
            typeof actor === 'undefined' ||
            !keys.every((key) => { return ActionKeys.has(key); })) {
            this.throwError(index);
        }
        switch (typeof actor) {
            case 'function':
                this._actor = actor;
                this._params = params;
                maximalCoverage = maxCoverage;
                paramsName = 'custom';
                break;
            case 'string':
                if (!ifaces_1.PredefinedActorsSet.includes(actor)) {
                    throw new TypeError(this.errorHead(index) +
                        `Unknown predefined actor "${actor}". Valid values are ${(0, utils_1.quotedListFromArray)(ifaces_1.PredefinedActorsSet)}.`);
                }
                // eslint-disable-next-line no-case-declarations
                const predefinedActor = predefined_actors_1.PredefinedActorFunctions[actor];
                this._actor = predefinedActor.actor;
                this._params = predefinedActor.paramsValidatorAndBuilder(rawAction, predefinedActor, actor);
                maximalCoverage = predefinedActor.coverage;
                paramsName = actor;
                break;
            default:
                throw new TypeError(this.errorHead(index) +
                    `Actor can't be a ${typeof actor}. It must be either a ` +
                    `function or a string representing one of the preset values.`);
        }
        this._coverage = coverage_1.coverageBuilder.buildCoverage(coverage, maximalCoverage, {
            paramsName,
            paramsType: 'actor',
        });
    }
    tryToRun(params) {
        const condition = params.bases.every((source, index) => {
            return this._coverage[index].some((typeChecker) => typeChecker(source));
        });
        if (condition) {
            this._actor(params, this._params);
        }
        return !condition;
    }
    throwError(index) {
        throw new TypeError(this.errorHead(index) +
            'Each item of options.actions array must be an object with mandatory "coverage" and "actor" properties, and ' +
            'optional "params" property.');
    }
    errorHead(index) {
        return `Invalid action (params.actions[${index}]). `;
    }
}
exports.FinalAction = FinalAction;
