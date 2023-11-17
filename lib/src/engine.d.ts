import { LNode, FinalCloneOptions, LCloneOptions, CombineOptions, LCustomizerParams } from './lib/ifaces';
import { LResults } from './lib/results';
export { BY_DEFAULT, MISSING } from './lib/symbols';
export { LCustomizerParams, LCloneOptions, LResults };
export interface CustParamsAccSoft<ACC> extends LCustomizerParams {
    accumulator: ACC & {
        [key: PropertyKey]: unknown;
    };
}
export interface CustParamsAccStrict<ACC> extends LCustomizerParams {
    accumulator: ACC;
}
declare type CloneAccumulator<OPT> = OPT extends {
    accumulator: LResults['accumulator'];
} ? OPT['accumulator'] & {
    [key: PropertyKey]: unknown;
} : LResults['accumulator'];
declare type CloneResult<SOURCE, OPT> = OPT extends {
    customizer: FinalCloneOptions['customizer'];
} ? any : SOURCE;
interface CloneVerboseReturnType<SOURCE, OPT> extends LResults {
    result: CloneResult<SOURCE, OPT>;
    accumulator: CloneAccumulator<OPT>;
}
export declare type CloneReturnType<SOURCE, OPT> = OPT extends {
    output: 'verbose';
} ? CloneVerboseReturnType<SOURCE, OPT> : SOURCE;
export declare function clone<SOURCE, OPT extends LCloneOptions>(original: SOURCE, rawOptions?: OPT): CloneReturnType<SOURCE, OPT>;
declare type CombineReturnType<OPT> = OPT extends {
    output: 'verbose';
} ? LResults : LNode['target'];
export declare function combine<OPT extends CombineOptions>(firstSource: unknown, secondSource: unknown, rawOptions?: OPT): CombineReturnType<OPT>;
