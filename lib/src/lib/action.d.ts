import { LAction, LFinalAction, LCombineParams } from './ifaces';
export declare class FinalAction implements LFinalAction {
    constructor(rawAction: LAction);
    tryToRun(params: LCombineParams): boolean;
    private throwError;
    private _coverage;
    private _actor;
    private _params;
}
