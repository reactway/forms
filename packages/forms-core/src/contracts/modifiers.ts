export interface ParseResult<TValue, TRenderValue> {
    currentValue: TValue;
    transientValue?: TRenderValue;
}

export type Format<TValue, TRenderValue> = (currentValue: TValue) => TRenderValue;
export type Parse<TRenderValue, TValue> = (value: TRenderValue) => ParseResult<TValue, TRenderValue>;

export interface Modifier<TValue, TRenderValue> {
    format: Format<TValue, TRenderValue>;
    parse: Parse<TRenderValue, TValue>;
}
