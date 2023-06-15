declare const modes: readonly ["soft", "moderate", "strict", "draconian"];
declare type Mode = typeof modes[number];
export interface IsSameOptions {
    mode: Mode;
}
export declare function isItTheSameAs(original: any, toCompare: any, options?: IsSameOptions): boolean;
export {};
