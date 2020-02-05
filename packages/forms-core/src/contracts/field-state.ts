import { Dictionary } from "./type-helpers";
import { ValidationUpdater, ValueUpdater, StatusUpdater } from "./state-updaters";
import { ValidationResult, Validator } from "./validation";

export interface FieldState<TValue, TRenderValue = any, TData extends {} = {}>
    extends FieldValue<TValue, FieldState<TValue, TRenderValue, {}>> {
    id: string;
    name: string;
    status: FieldStatus;
    values: FieldValues<TValue, TRenderValue>;
    data: TData;
    updaters: Updaters<TValue, TRenderValue>;
    validation: FieldValidation<TValue>;

    fields: Dictionary<FieldState<any>>;
}

export interface FieldValue<TValue, TFieldState extends FieldState<any>> {
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

export interface FieldValues<TValue, TRenderValue> {
    currentValue: TValue;
    initialValue: TValue;
    defaultValue: TValue;
    transientValue?: TRenderValue;
}

export interface StateUpdater<TId extends string = string, TValue = any, TRenderValue = any> {
    id: TId;
}

export interface Updaters<TValue, TRenderValue> {
    [key: string]: StateUpdater<string, TValue, TRenderValue>;
    [ValidationUpdater]: ValidationUpdater;
    [ValueUpdater]: ValueUpdater<TValue>;
    [StatusUpdater]: StateUpdater;
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
