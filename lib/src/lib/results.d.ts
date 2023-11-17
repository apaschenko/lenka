import { LSummary } from './ifaces';
export declare class LResults {
    constructor(summary: LSummary);
    setByLabel: (label: number, value: any) => void;
    deleteByLabel: (label: number) => void;
    get accumulator(): import("./general_types").AccumulatorType;
    get options(): import("./ifaces").FinalCloneOptions;
    get cloneOptions(): import("./ifaces").FinalCloneOptions;
    get combineOptions(): import("./ifaces").FinalCombineOptions;
    get result(): any;
    private _deleteByLabel;
    private _setByLabel;
    private _summary;
}
