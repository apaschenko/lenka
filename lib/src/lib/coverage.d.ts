import { CombineSource } from './combine_source';
import { TypeChecker, LActionCoverageSingle, LAction } from './ifaces';
export declare const PredefActCoverSet: string[];
export declare type PredefActCoverTypes = typeof PredefActCoverSet[number];
export declare type FinalCoverSet = Set<PredefActCoverTypes>;
export interface CoverageErrorData {
    paramsName: string;
    paramsType: string;
    place: string;
}
export declare class LCoverage {
    constructor();
    buildCoverage(coverage: LAction['coverage'], maximalCoverage: [FinalCoverSet, FinalCoverSet], errorData: Partial<CoverageErrorData>): [TypeChecker[], TypeChecker[]];
    validateAndBuildCoverConds(actionCoverage: LActionCoverageSingle, allowedTypes: FinalCoverSet, errorData: Partial<CoverageErrorData>): TypeChecker[];
    getExtendedListToErrorDescr(types: FinalCoverSet): string[];
    checkType(combineSource: CombineSource, type: PredefActCoverTypes): boolean;
    extendType(type: PredefActCoverTypes): FinalCoverSet;
    private buildAndThrowError;
    private buildExtendedCoverage;
    private buildTypeCheckers;
    private inverseCoverageExtender;
    private standardTypeChecker;
    private _typeCheckers;
    private _extendedCoverage;
}
export declare const coverageBuilder: LCoverage;
export declare const extendedAll: FinalCoverSet;
