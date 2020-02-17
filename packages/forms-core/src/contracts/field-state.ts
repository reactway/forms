import { Store } from "../store";
import { Dictionary, PartialKeys } from "./type-helpers";
import { ValidationUpdater, ValueUpdater, StatusUpdater } from "./state-updaters";
import { ValidationResult, Validator } from "./validation";
import { UpdateStoreHelpers } from "./store-helpers";
import { Modifier } from "./modifiers";

export interface FieldState<TValue, TData extends {}> extends FieldValue<TValue, FieldState<TValue, TData>> {
    id: string;
    name: string;
    status: FieldStatus;

    data: TData;
    validation: FieldValidation<TValue>;

    fields: Dictionary<FieldState<any, any>>;
}

export interface FieldValue<TValue, TFieldState extends FieldState<any, any>> {
    getValue: (fieldState: TFieldState) => TValue;
    setValue: (fieldState: TFieldState, value: TValue) => void;
}

export interface FieldStatus {
    touched: boolean;
    pristine: boolean;
    disabled: boolean;
    readonly: boolean;
    permanent: boolean;
}

export interface InputFieldData<TValue, TRenderValue> {
    currentValue: TValue;
    initialValue: TValue;
    defaultValue: TValue;
    transientValue?: TRenderValue;

    modifiers: ReadonlyArray<FieldModifier<TValue, TRenderValue>>;
}

export type StoreUpdaterFactory<TStoreUpdater extends StoreUpdater> = (
    state: FieldState<any, any>,
    helpers: UpdateStoreHelpers,
    store: Store<FieldState<any, any>>
) => TStoreUpdater;

export interface StoreUpdater<TId extends string = string> {
    id: TId;
}

export interface StoreUpdatersFactories {
    [key: string]: StoreUpdaterFactory<StoreUpdater> | undefined;
    [ValidationUpdater]: StoreUpdaterFactory<ValidationUpdater>;
    [ValueUpdater]: StoreUpdaterFactory<ValueUpdater>;
    [StatusUpdater]: StoreUpdaterFactory<StatusUpdater>;
}

export interface FieldValidation<TValue> {
    results: ReadonlyArray<ValidationResult>;
    validators: ReadonlyArray<FieldValidator<TValue>>;
    // TODO: Status + Date or just Date?
    validationStarted?: Date;
}

export interface FieldValidator<TValue> extends Validator<TValue> {
    id: string;
}

export interface FieldModifier<TValue, TRenderValue> extends Modifier<TValue, TRenderValue> {
    id: string;
}

export type DefaultFieldState = Pick<FieldState<any, any>, "fields" | "status" | "validation">;
export type Initial<TFieldState extends FieldState<any, any>> = Omit<
    PartialKeys<TFieldState, keyof DefaultFieldState>,
    "id" | "name" | "fields"
>;

// Partial<Pick<TFieldState, keyof DefaultFieldState>>;
export type UpdaterId<TUpdater extends StoreUpdater> = TUpdater extends StoreUpdater<infer TId> ? TId : never;

export type FieldStateValue<TFieldState extends FieldState<any, any>> = TFieldState extends FieldState<infer TValue, any> ? TValue : never;
export type FieldStateData<TFieldState extends FieldState<any, any>> = TFieldState extends FieldState<any, infer TData> ? TData : never;
export type RenderValue<TData extends InputFieldData<any, any>> = TData extends InputFieldData<any, infer TRenderValue>
    ? TRenderValue
    : never;
