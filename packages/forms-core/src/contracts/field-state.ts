import { Draft } from "immer";
import { Dictionary, JsonValue, NestedDictionary } from "./helpers";
import { Modifier } from "./modifiers";
import { Validator, ValidationResult } from "./validators";
import { UpdateFieldStoreHelpers } from "../store/field-store-helpers";

export interface Mechanism<TId extends string = string, TValue = any, TRenderValue = any> {
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
    readonly mechanisms?: Mechanisms<TValue, InputFieldRenderValue<TData>>;

    readonly fields: Readonly<Dictionary<FieldState<unknown, any>>>;
}

export const ValidationMechanismId = "field-validation" as const;
export interface ValidationMechanism<TValue> extends Mechanism<typeof ValidationMechanismId, TValue> {
    validateField(state: FieldState<any, any>, helpers: UpdateFieldStoreHelpers, fieldId: string): Promise<void>;
}

export const ModifierMechanismId = "field-modifier" as const;
export interface ModifierMechanism<TValue, TRenderValue> extends Mechanism<typeof ModifierMechanismId, TValue, TRenderValue> {
    parse(state: FieldState<any, any>, helpers: UpdateFieldStoreHelpers, fieldId: string, nextValue: TValue): void;
    format(state: FieldState<any, any>, helpers: UpdateFieldStoreHelpers, fieldId: string): TRenderValue;
}

export const StatusesMechanismId = "field-statuses" as const;
export interface StatusesMechanism extends Mechanism<typeof StatusesMechanismId> {
    updateFieldStatus(state: Draft<FieldState<any, any>>, fieldId: string, updater: (status: FieldStatus) => void): void;
}

export const ResetMechanismId = "field-reset" as const;
export interface ResetMechanism<TValue> extends Mechanism<typeof ResetMechanismId, TValue> {}

export const ClearMechanismId = "field-clear" as const;
export interface ClearMechanism<TValue> extends Mechanism<typeof ClearMechanismId, TValue> {}

export const SubmitMechanismId = "field-submit" as const;
export interface SubmitMechanism<TValue> extends Mechanism<typeof SubmitMechanismId, TValue> {}

export interface Mechanisms<TValue, TRenderValue> {
    [key: string]: Mechanism<string, TValue, TRenderValue>;
    [ValidationMechanismId]: ValidationMechanism<TValue>;
    // [ModifierMechanismId]: ModifierMechanism<TValue, TRenderValue>;
    // [StatusesMechanismId]: StatusesMechanism;
    // [ResetMechanismId]: ResetMechanism<TValue>;
    // [ClearMechanismId]: ClearMechanism<TValue>;
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

export type InitialFieldState<TFieldState extends FieldState<any, any>> = Omit<TFieldState, "id" | "fields">;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FormState<TData extends object = FormStateData> extends FieldState<NestedDictionary<unknown>, TData> {}

export type DraftUpdater<TBase> = (draft: Draft<TBase>) => void;

export type InputFieldValue<TInputFieldData> = TInputFieldData extends InputFieldData<infer TValue, any> ? TValue : never;
export type InputFieldRenderValue<TInputFieldData> = TInputFieldData extends InputFieldData<any, infer TRenderValue> ? TRenderValue : never;
export type FieldStateValue<TFieldState> = TFieldState extends FieldState<infer TValue, any> ? TValue : never;
export type FieldStateData<TFieldState> = TFieldState extends FieldState<any, infer TData> ? TData : never;
export type FieldStateRenderValue<TFieldState> = InputFieldRenderValue<FieldStateData<TFieldState>>;
