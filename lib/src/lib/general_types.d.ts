export declare type AccumulatorType = Record<PropertyKey, any>;
export declare const OutputTypeSet: readonly ["simple", "verbose"];
export declare type OutputType = typeof OutputTypeSet[number];
export declare const ProducedAsIntSet: readonly ["key", "property", "setItem", "arrayItem"];
export declare type ProducedAsInt = typeof ProducedAsIntSet[number];
export declare type ProducedAs = ProducedAsInt | 'root';
export declare type OperationType = 'combine' | 'clone';
export declare const DefaultActionParamsDiff: {
    byProperties: boolean;
    byKeys: boolean;
    byValues: boolean;
    byArrayItems: boolean;
    keysPropsMix: boolean;
    propsKeysMix: boolean;
    valuesFromProps: boolean;
    valuesFromKeys: boolean;
};
export interface DCArrayBuffer extends ArrayBuffer {
    prototype: {
        slice: (start: any, end: any) => ArrayBuffer;
    };
}
