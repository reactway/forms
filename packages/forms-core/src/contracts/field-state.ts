import { Dictionary } from "./type-helpers";
import { ValidationUpdater, ValueUpdater, StatusUpdater } from "./state-updaters";
import { ValidationResult, Validator } from "./validation";
import { UpdateStoreHelpers } from "./store-helpers";

export interface FieldState<TValue, TRenderValue = any, TData extends {} = {}>
    extends FieldValue<TValue, FieldState<TValue, TRenderValue, {}>> {
    id: string;
    name: string;
    status: FieldStatus;
    values: FieldValues<TValue, TRenderValue>;
    data: TData;
    validation: FieldValidation<TValue>;

    fields: Dictionary<FieldState<any>>;
}

export interface FieldValue<TValue, TFieldState extends FieldState<any>> {
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

export interface FieldValues<TValue, TRenderValue> {
    currentValue: TValue;
    initialValue: TValue;
    defaultValue: TValue;
    transientValue?: TRenderValue;
}

export type StoreUpdaterFactory<TStoreUpdater extends StoreUpdater> = (
    state: FieldState<any>,
    helpers: UpdateStoreHelpers
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

export type Initial<TFieldState extends FieldState<any>> = Omit<TFieldState, "id" | "name" | "fields">;
