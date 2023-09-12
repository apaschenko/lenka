import { Results, CustomizerParams, CloneOptions, FinalCloneOptions } from './service';
export interface CustParamsAccSoft<ACC> extends CustomizerParams {
    accumulator: ACC & {
        [key: PropertyKey]: unknown;
    };
}
export interface CustParamsAccStrict<ACC> extends CustomizerParams {
    accumulator: ACC;
}
declare type CloneAccumulator<OPT> = OPT extends {
    accumulator: Results['accumulator'];
} ? OPT['accumulator'] & {
    [key: PropertyKey]: unknown;
} : Results['accumulator'];
declare type CloneResult<SOURCE, OPT> = OPT extends {
    customizer: FinalCloneOptions['customizer'];
} ? any : SOURCE;
interface CloneVerboseReturnType<SOURCE, OPT> extends Results {
    result: CloneResult<SOURCE, OPT>;
    accumulator: CloneAccumulator<OPT>;
}
export declare type CloneReturnType<SOURCE, OPT> = OPT extends {
    output: 'verbose';
} ? CloneVerboseReturnType<SOURCE, OPT> : SOURCE;
export declare function clone<SOURCE, OPT extends CloneOptions>(original: SOURCE, rawOptions?: OPT): CloneReturnType<SOURCE, OPT>;
export {};
