export declare type LAccumulatorType = Record<PropertyKey, any>;
export declare const OutputTypeSet: readonly ["simple", "verbose"];
export declare type LOutputType = typeof OutputTypeSet[number];
export declare const ProducedAsIntSet: readonly ["key", "property", "item"];
export declare type LProducedAsInt = typeof ProducedAsIntSet[number];
export declare type LProducedAs = LProducedAsInt | 'root';
export declare type OperationType = 'combine' | 'clone';
export declare const DefaultActionParamsDiff: {
    byProperties: boolean;
    byKeys: boolean;
    byValues: boolean;
    byArrayKeys: boolean;
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
