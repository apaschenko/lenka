import { LSummary } from './ifaces';
export declare class LResults {
    constructor(summary: LSummary);
    setByLabel: (label: number, value: any) => void;
    deleteByLabel: (label: number) => void;
    get accumulator(): import("./general_types").LAccumulatorType;
    get options(): import("./ifaces").LFinalCloneOptions;
    get cloneOptions(): import("./ifaces").LFinalCloneOptions;
    get combineOptions(): import("./ifaces").LFinalCombineOptions;
    get result(): any;
    private _deleteByLabel;
    private _setByLabel;
    private _summary;
}
