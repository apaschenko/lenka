import { LCombineParams, LSummary, LNode, CombineChildren, LChild } from './ifaces';
import { LProducedAs } from './general_types';
import { CombineSource } from './combine_source';
import { LenkaChild } from './child';
export declare class CombineParams implements LCombineParams {
    constructor(summary: LSummary, nodes: LNode[]);
    addChild(child: LenkaChild, producedAs?: LProducedAs): number;
    getNextLabel(): number;
    selectBase(combineSource: CombineSource): void;
    postCheck(): void;
    get bases(): CombineSource[];
    get selectedBase(): CombineSource;
    get result(): CombineChildren;
    get scheme(): CombineChildren;
    _createChild(child: LChild): LNode;
    private _nodes;
    private _combineSources;
    private _summary;
    private _selectedBase;
    private _scheme;
    private _result;
}
