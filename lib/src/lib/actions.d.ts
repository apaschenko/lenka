import { Action, ActorFunction, PredefinedActors, PredefActCoverTypes, ActionParams, LFinalAction, LCombineParams } from './ifaces';
declare type PredefinedActorType = {
    actor: ActorFunction;
    coverage: [PredefActCoverTypes[], PredefActCoverTypes[]];
    defaultParams: ActionParams;
    paramsValidatorAndBuilder: (rawAction: Action, predefinedActor: PredefinedActorType, actorName: PredefinedActors) => ActionParams;
    extendedCoverage?: [Set<PredefActCoverTypes>, Set<PredefActCoverTypes>];
};
export declare const PredefinedActorFunctions: Record<PredefinedActors, PredefinedActorType>;
export declare class FinalAction implements LFinalAction {
    constructor(rawAction: Action);
    tryToRun(params: LCombineParams): boolean;
    private singleCoverageValidatorAndBuilder;
    private throwError;
    private _coverage;
    private _actor;
    private _params;
}
export {};
