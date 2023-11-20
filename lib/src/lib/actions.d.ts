import { LAction, LActionParams, LActorFunction, LPredefinedActors, PredefActCoverTypes, LFinalAction, LCombineParams } from './ifaces';
declare type PredefinedActorType = {
    actor: LActorFunction;
    coverage: [PredefActCoverTypes[], PredefActCoverTypes[]];
    defaultParams: LActionParams;
    paramsValidatorAndBuilder: (rawAction: LAction, predefinedActor: PredefinedActorType, actorName: LPredefinedActors) => LActionParams;
    extendedCoverage?: [Set<PredefActCoverTypes>, Set<PredefActCoverTypes>];
};
export declare const PredefinedActorFunctions: Record<LPredefinedActors, PredefinedActorType>;
export declare class FinalAction implements LFinalAction {
    constructor(rawAction: LAction);
    tryToRun(params: LCombineParams): boolean;
    private singleCoverageValidatorAndBuilder;
    private throwError;
    private _coverage;
    private _actor;
    private _params;
}
export {};
