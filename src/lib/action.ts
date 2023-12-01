import {
  LAction,
  LActionParams,
  LActorFunction,
  PredefinedActorsSet,
  LFinalAction,
  LCombineParams, 
  TypeChecker
} from './ifaces';
import { quotedListFromArray } from './utils';
import { FinalCoverSet, coverageBuilder, extendedAll } from './coverage';
import { PredefinedActorFunctions } from './predefined_actors';

const ActionKeys = new Set(['coverage', 'actor', 'params']);

const maxCoverage: [FinalCoverSet, FinalCoverSet] = [extendedAll, extendedAll];

export class FinalAction implements LFinalAction {
  constructor(rawAction: LAction, index: number) {
    let maximalCoverage: [FinalCoverSet, FinalCoverSet];
    let paramsName: string;

    if (typeof rawAction !== 'object') {
      this.throwError(index);
    }

    const { coverage, actor, params } = rawAction;
    const keys = Object.keys(rawAction);

    if (
      typeof coverage === 'undefined' || // we can't use "!coverage" here
      typeof actor === 'undefined' || 
      !keys.every((key) => { return ActionKeys.has(key as keyof LAction); })
    ) {
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
        if (!PredefinedActorsSet.includes(actor)) {
          throw new TypeError(
            this.errorHead(index) +
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
          this.errorHead(index) +
            `Actor can't be a ${typeof actor}. It must be either a ` +
            `function or a string representing one of the preset values.`
        );
    }

    this._coverage = coverageBuilder.buildCoverage(
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

  private throwError(index: number) {
    throw new TypeError(
      this.errorHead(index) +
        'Each item of options.actions array must be an object with mandatory "coverage" and "actor" properties, and ' +
        'optional "params" property.'
    );
  }

  private errorHead(index: number) {
    return `Invalid action (params.actions[${index}]). `;
  }

  private _coverage: [TypeChecker[], TypeChecker[]];

  private _actor: LActorFunction;

  private _params: LActionParams;
}