import { LCustomizerParams, LNode } from './ifaces';
export declare class LenkaCustomizerParams implements LCustomizerParams {
    constructor(node: LNode);
    get value(): any;
    get key(): any;
    get parent(): LenkaCustomizerParams;
    get root(): LenkaCustomizerParams;
    get index(): number;
    get level(): number;
    get label(): number;
    get isItAdouble(): boolean;
    get isItAPrimitive(): boolean;
    get accumulator(): import("./general_types").AccumulatorType;
    get options(): Partial<import("./ifaces").FinalCloneOptions>;
    protected _node: LNode;
}
