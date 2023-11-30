import { LAction, LActionParams, LActorFunction, LPredefinedActors, LFinalAction, LCombineParams } from './ifaces';
import { FinalCoverSet } from './coverage';
declare type PredefinedActorType = {
    actor: LActorFunction;
    coverage: [FinalCoverSet, FinalCoverSet];
    defaultParams: LActionParams;
    paramsValidatorAndBuilder: (rawAction: LAction, predefinedActor: PredefinedActorType, actorName: LPredefinedActors) => LActionParams;
};
export declare const PredefinedActorFunctions: Record<LPredefinedActors, PredefinedActorType>;
export declare class FinalAction implements LFinalAction {
    constructor(rawAction: LAction);
    tryToRun(params: LCombineParams): boolean;
    private throwError;
    private _coverage;
    private _actor;
    private _params;
}
export {};
