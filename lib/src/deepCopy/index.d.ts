export interface DCCustomizerReturn {
    processed: boolean;
    result: any;
}
export interface DCCustomizerParams {
    accumulator: Record<string, any>;
    value: any;
    parent: object | any[];
    key: string | number;
    root: any;
    level: number;
    isItACycle: boolean;
}
export interface DCOptions {
    customizer: (params: DCCustomizerParams) => DCCustomizerReturn;
}
export declare const deepCopy: (original: any, options?: DCOptions) => any;
