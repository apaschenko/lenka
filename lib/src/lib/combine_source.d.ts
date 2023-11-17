import { LCombineSource, LCombineParams, LNode } from './ifaces';
import { LenkaCustomizerParams } from './customizer_params';
export declare class CombineSource extends LenkaCustomizerParams implements LCombineSource {
    constructor(node: LNode, combineParams: LCombineParams);
    select(): void;
    getChildrenValues(valuesFromP: boolean, valuesFromK: boolean, keysPropsMix: boolean): import("./ifaces").ChildrenValues;
    get childrenKeys(): import("./ifaces").ChildrenKeys;
    get _internalType(): import("./piece_types").ExtendedPieceType;
    get _isPrimitive(): boolean;
    private _combineParams;
}
