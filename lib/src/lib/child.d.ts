import { LChild, LCombineParams, LNode } from './ifaces';
import { LProducedAsInt } from './general_types';
export declare class LenkaChild implements LChild {
    constructor(params: {
        combineParams: LCombineParams;
        producedBy: LNode['producedBy'];
        producedAs: LProducedAsInt;
        parentNode: LNode;
    });
    add(): number;
    setKey(keyOrPropName: unknown): this;
    setProducedAs(keyType: LProducedAsInt): this;
    setValue(value: unknown): this;
    get index(): number;
    get key(): any;
    get producedAs(): "key" | "property" | "item";
    get value(): any;
    get label(): number;
    private _combineParams;
    private _index;
    private _key;
    private _producedAs;
    private _label;
    private _value;
    private _parentNode;
}
