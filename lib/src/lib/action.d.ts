import { LAction, LFinalAction, LCombineParams } from './ifaces';
export declare class FinalAction implements LFinalAction {
    constructor(rawAction: LAction, index: number);
    tryToRun(params: LCombineParams): boolean;
    private throwError;
    private errorHead;
    private _coverage;
    private _actor;
    private _params;
}
