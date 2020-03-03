import { Store } from "../store";
import { Dictionary, PartialKeys } from "./type-helpers";
import { ValidationUpdater, ValueUpdater, StatusUpdater } from "./state-updaters";
import { ValidationResult, Validator, CancellationToken } from "./validation";
import { UpdateStoreHelpers } from "./store-helpers";
import { Modifier } from "./modifiers";

export interface FieldState<TValue, TData extends {}> extends FieldValue<TValue, FieldState<TValue, TData>> {
    id: string;
    name: string;
    status: FieldStatus;

    computedValue: boolean;
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

    modifiers: Dictionary<FieldModifier<TValue, TRenderValue>>;
    modifiersOrder: ReadonlyArray<string>;

    selection?: TextSelection;
}

export interface TextSelection {
    selectionDirection: TextSelectionDirection;
    selectionEnd: number;
    selectionStart: number;
}

export type TextSelectionDirection = "forward" | "backward" | "none";

export type UpdaterFactory<TUpdater extends Updater> = (
    helpers: UpdateStoreHelpers,
    state: FieldState<any, any>,
    store: Store<FieldState<any, any>>
) => TUpdater;

export interface Updater<TId extends string = string> {
    id: TId;
}

export interface UpdatersFactories {
    [key: string]: UpdaterFactory<Updater> | undefined;
    [ValidationUpdater]: UpdaterFactory<ValidationUpdater>;
    [ValueUpdater]: UpdaterFactory<ValueUpdater>;
    [StatusUpdater]: UpdaterFactory<StatusUpdater>;
}

export interface FieldValidation<TValue> {
    results: ReadonlyArray<ValidationResult>;
    validators: Readonly<Dictionary<FieldValidator<TValue>>>;
    validatorsOrder: ReadonlyArray<string>;
    currentValidation?: Validation;
}

export interface Validation {
    // TODO: Currently running validator
    started: Date;
    cancellationToken: CancellationToken;
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
export type UpdaterId<TUpdater extends Updater> = TUpdater extends Updater<infer TId> ? TId : never;

export type FieldStateValue<TFieldState extends FieldState<any, any>> = TFieldState extends FieldState<infer TValue, any> ? TValue : never;
export type FieldStateData<TFieldState extends FieldState<any, any>> = TFieldState extends FieldState<any, infer TData> ? TData : never;
export type RenderValue<TData extends InputFieldData<any, any>> = TData extends InputFieldData<any, infer TRenderValue>
    ? TRenderValue
    : never;
