import { Draft } from "immer";
import { Dictionary, JsonValue, NestedDictionary } from "./helpers";
import { Modifier } from "./modifiers";

// TODO: THydrationValue example with DraftJS: TValue = DraftJsState, THydrationValue = object.
// TODO: Add Hydration.
export interface FieldState<TValue, TData extends {}> extends FieldValue<TValue, FieldState<TValue, TData>> {
    readonly id: string;
    readonly name: string;

    readonly data: TData;
    readonly status: FieldStatus;

    readonly fields: Readonly<Dictionary<FieldState<unknown, any>>>;
}

export interface FieldValue<TValue, TFieldState extends FieldState<any, any>> {
    getValue: (fieldState: TFieldState) => TValue;
    setValue: (fieldState: TFieldState, value: TValue) => void;
}

export interface FieldStatus {
    focused: boolean;
    touched: boolean;
    pristine: boolean;
    disabled: boolean;
    readonly: boolean;
    permanent: boolean;
}

export interface InputFieldData<TValue = unknown, TRenderValue = unknown> {
    currentValue: TValue;
    initialValue: TValue;
    defaultValue: TValue;
    transientValue?: TRenderValue;

    modifier?: Modifier<TValue, TRenderValue>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InputFieldState<TData extends InputFieldData<any, any>> extends FieldState<InputFieldValue<TData>, TData> {}

export interface HydrationState<TState extends FieldState<any, any>, THydrationValue extends JsonValue = JsonValue> {
    dehydrate: (state: TState) => THydrationValue;
    hydrate: (value: THydrationValue) => void;
}

export interface FormStateData {
    submitCallback?: () => void;
    dehydratedState: NestedDictionary<unknown>;
}

export type InitialFieldState<TFieldState extends FieldState<any, any>> = Omit<TFieldState, "id" | "fields">;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FormState<TData extends object = FormStateData> extends FieldState<NestedDictionary<unknown>, TData> {}

export type DraftUpdater<TBase> = (draft: Draft<TBase>) => void;

export type InputFieldValue<TInputFieldData> = TInputFieldData extends InputFieldData<infer TValue, any> ? TValue : never;
export type InputFieldRenderValue<TInputFieldData> = TInputFieldData extends InputFieldData<any, infer TRenderValue> ? TRenderValue : never;
export type FieldStateValue<TFieldState> = TFieldState extends FieldState<infer TValue, any> ? TValue : never;
export type FieldStateData<TFieldState> = TFieldState extends FieldState<any, infer TData> ? TData : never;
export type FieldStateRenderValue<TFieldState> = InputFieldRenderValue<FieldStateData<TFieldState>>;
