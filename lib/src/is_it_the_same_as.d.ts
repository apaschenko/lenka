declare const modes: readonly ["soft", "moderate", "strict", "draconian"];
declare type ModeType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<infer ModeType> ? ModeType : never;
declare type Mode = ModeType<typeof modes>;
export interface IsSameOptions {
    mode: Mode;
}
export declare function isItTheSameAs(original: any, toCompare: any, options?: IsSameOptions): boolean;
export {};
