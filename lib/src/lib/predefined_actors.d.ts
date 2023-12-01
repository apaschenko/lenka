import { FinalCoverSet } from './coverage';
import { LAction, LActionParams, LActorFunction, LPredefinedActors } from './ifaces';
declare type PredefinedActorType = {
    actor: LActorFunction;
    coverage: [FinalCoverSet, FinalCoverSet];
    defaultParams: LActionParams;
    paramsValidatorAndBuilder: (rawAction: LAction, predefinedActor: PredefinedActorType, actorName: LPredefinedActors) => LActionParams;
};
export declare const PredefinedActorFunctions: Record<LPredefinedActors, PredefinedActorType>;
export {};
