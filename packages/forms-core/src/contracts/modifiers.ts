import { TextSelection } from "./field-state";
import { DeepReadonly } from "./type-helpers";

export interface ParseResult<TRenderValue, TValue> {
    currentValue: TValue;
    transientValue?: TRenderValue;
    caretPosition?: number;
}

export interface ParseValue<TValue> {
    readonly value: DeepReadonly<TValue>;
    readonly caretPosition?: number;
}

export type FormatCallback<TValue, TRenderValue> = (currentValue: TValue) => TRenderValue;
export type ParseCallback<TRenderValue, TValue> = (
    current: ParseValue<TRenderValue>,
    previous: ParseValue<TRenderValue>
) => ParseResult<TRenderValue, TValue>;

export interface Modifier<TValue, TRenderValue> {
    format: FormatCallback<TValue, TRenderValue>;
    parse: ParseCallback<TRenderValue, TValue>;
}
