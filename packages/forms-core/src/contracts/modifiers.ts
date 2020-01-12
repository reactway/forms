export interface ParseResult<TValue, TRenderValue> {
    currentValue: TValue;
    transientValue?: TRenderValue;
}

export type Format<TValue, TRenderValue> = (currentValue: TValue, transientValue?: TRenderValue) => TRenderValue;
export type Parse<TValue, TRenderValue> = (value: TRenderValue) => ParseResult<TValue, TRenderValue>;

export interface Modifier<TValue, TRenderValue> {
    format: Format<TValue, TRenderValue>;
    parse: Parse<TValue, TRenderValue>;
}
