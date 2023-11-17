import { LChild, LCombineParams, LNode } from './ifaces';
import { ProducedAsInt } from './general_types';
export declare class LenkaChild implements LChild {
    constructor(params: {
        combineParams: LCombineParams;
        producedBy: LNode['producedBy'];
        producedAs: ProducedAsInt;
        parentNode: LNode;
    });
    add(): number;
    setKey(keyOrPropName: unknown): this;
    setProducedAs(keyType: ProducedAsInt): this;
    setValue(value: unknown): this;
    get index(): number;
    get key(): any;
    get producedAs(): "key" | "property" | "setItem" | "arrayItem";
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
