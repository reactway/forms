import { Draft } from "immer";
import { Dictionary, JsonValue, NestedDictionary } from "./helpers";
import { Modifier } from "./modifiers";
import { Validator, ValidationResult } from "./validators";
import { UpdateFieldStoreHelpers } from "../store/field-store-helpers";

export interface Updater<TId extends string = string, TValue = any, TRenderValue = any> {
    id: TId;
}

// TODO: THydrationValue example with DraftJS: TValue = DraftJsState, THydrationValue = object.
// TODO: Add Hydration.
export interface FieldState<TValue, TData extends {}> extends FieldValue<TValue, FieldState<TValue, TData>> {
    readonly id: string;
    readonly name: string;

    readonly data: TData;
    readonly status: FieldStatus;
    readonly validation: FieldValidation<TValue>;
    readonly updaters?: Updaters<TValue, InputFieldRenderValue<TData>>;

    readonly fields: Readonly<Dictionary<FieldState<unknown, any>>>;
}

export const ValidationUpdater = "field-validation" as const;
export interface ValidationUpdater<TValue> extends Updater<typeof ValidationUpdater, TValue> {
    validateField(state: FieldState<any, any>, helpers: UpdateFieldStoreHelpers, fieldId: string): Promise<void>;
}

export const ModifierUpdaterId = "field-modifier";
export interface ModifierUpdater<TValue, TRenderValue> extends Updater<typeof ModifierUpdaterId, TValue, TRenderValue> {
    parse(state: FieldState<any, any>, helpers: UpdateFieldStoreHelpers, fieldId: string, nextValue: TValue): void;
    format(state: FieldState<any, any>, helpers: UpdateFieldStoreHelpers, fieldId: string): TRenderValue;
}

export const StatusesUpdaterId = "field-statuses";
export interface StatusesUpdater extends Updater<typeof StatusesUpdaterId> {
    updateFieldStatus(state: Draft<FieldState<any, any>>, fieldId: string, updater: (status: FieldStatus) => void): void;
}

export const ResetUpdaterId = "field-reset";
export interface ResetUpdater<TValue> extends Updater<typeof ResetUpdaterId, TValue> {}

export const ClearUpdaterId = "field-clear";
export interface ClearUpdater<TValue> extends Updater<typeof ClearUpdaterId, TValue> {}

export const SubmitUpdaterId = "field-submit";
export interface SubmitUpdater<TValue> extends Updater<typeof SubmitUpdaterId, TValue> {}

export interface Updaters<TValue, TRenderValue> {
    [key: string]: Updater<string, TValue, TRenderValue>;
    [ValidationUpdater]: ValidationUpdater<TValue>;
    // [ModifierUpdaterId]: ModifierUpdater<TValue, TRenderValue>;
    // [StatusesUpdaterId]: StatusesUpdater;
    // [ResetUpdaterId]: ResetUpdater<TValue>;
    // [ClearUpdaterId]: ClearUpdater<TValue>;
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

export interface FieldValidator<TValue> extends Validator<TValue> {
    id: string;
}

export interface FieldValidation<TValue> {
    results: ReadonlyArray<ValidationResult>;
    validators: ReadonlyArray<FieldValidator<TValue>>;
    // TODO: Status + Date or just Date?
    validationStarted?: Date;
}

export interface InputFieldData<TValue = unknown, TRenderValue = unknown> {
    currentValue: TValue;
    initialValue: TValue;
    defaultValue: TValue;
    transientValue?: TRenderValue;

    modifiers: Modifier<TValue, TRenderValue>[];
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

export type InitialFieldState<TFieldState extends FieldState<any, any>> = Omit<TFieldState, "id" | "TUpdater">;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FormState<TData extends object = FormStateData> extends FieldState<NestedDictionary<unknown>, TData> {}

export type DraftUpdater<TBase> = (draft: Draft<TBase>) => void;

export type InputFieldValue<TInputFieldData> = TInputFieldData extends InputFieldData<infer TValue, any> ? TValue : never;
export type InputFieldRenderValue<TInputFieldData> = TInputFieldData extends InputFieldData<any, infer TRenderValue> ? TRenderValue : never;
export type FieldStateValue<TFieldState> = TFieldState extends FieldState<infer TValue, any> ? TValue : never;
export type FieldStateData<TFieldState> = TFieldState extends FieldState<any, infer TData> ? TData : never;
export type FieldStateRenderValue<TFieldState> = InputFieldRenderValue<FieldStateData<TFieldState>>;
