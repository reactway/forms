import { TextSelection } from "./field-state";

export interface ParseResult<TRenderValue, TValue> {
    currentValue: TValue;
    transientValue?: TRenderValue;
    selection?: TextSelection;
}

export type Format<TValue, TRenderValue> = (currentValue: TValue) => TRenderValue;
export type Parse<TRenderValue, TValue> = (value: TRenderValue, selection?: TextSelection) => ParseResult<TRenderValue, TValue>;

export interface Modifier<TValue, TRenderValue> {
    format: Format<TValue, TRenderValue>;
    parse: Parse<TRenderValue, TValue>;
}
