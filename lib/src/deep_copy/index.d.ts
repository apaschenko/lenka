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
    accumulator?: Record<string, any>;
    mode?: 'simple' | 'verbose';
}
interface InternalData {
    root: any;
    originalItems: object[];
    originalToCopy: Map<object, object>;
    circulars: {
        parentOriginalObject: object;
        parentKey: string | number;
        original: object;
    }[];
    accumulator: Record<string, any>;
}
export declare function deepCopy(original: any, options?: {
    customizer: (DCCustomizerParams: any) => DCCustomizerReturn;
    accumulator?: Record<string, any>;
    mode?: 'simple';
}): any;
export declare function deepCopy(original: any, options?: {
    customizer: (DCCustomizerParams: any) => DCCustomizerReturn;
    accumulator?: Record<string, any>;
    mode: 'verbose';
}): {
    copy: any;
    accumulator: DCOptions['accumulator'];
    originalToCopy: InternalData['originalToCopy'];
};
export {};
