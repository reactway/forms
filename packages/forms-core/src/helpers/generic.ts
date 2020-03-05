import {
    FieldStatus,
    InputFieldData,
    UpdatersFactories,
    FieldValidation,
    FieldState,
    Updater,
    DefaultFieldState,
    FieldSelector
} from "../contracts";
import { IdSeparator } from "../constants";
import { ValueUpdaterFactory, ValidationUpdaterFactory, StatusUpdaterFactory } from "../updaters";

export function isPromise(candidate: any): candidate is Promise<any> {
    return candidate.then != null && candidate.catch != null;
}

export function generateFieldId(name: string, parentId: string | undefined): string {
    if (parentId == null) {
        return name;
    }
    return `${parentId}${IdSeparator}${name}`;
}

export function getFieldNameFromId(fieldId: string): string {
    const lastSeparatorIndex = fieldId.lastIndexOf(IdSeparator);
    if (lastSeparatorIndex === -1) {
        return fieldId;
    }

    return fieldId.slice(lastSeparatorIndex + IdSeparator.length);
}

export function assertFieldIsDefined<TField extends FieldState<any, any>>(
    field: TField | undefined,
    fieldSelector?: FieldSelector
): asserts field is NonNullable<TField> {
    if (field == null) {
        throw new Error(`Field '${String(fieldSelector)}' does not exist in a given state.`);
    }
}

export function assertUpdaterIsDefined<TUpdater extends Updater>(
    updater: TUpdater | undefined,
    updaterId?: TUpdater extends Updater<infer TId> ? TId : never
): asserts updater is NonNullable<TUpdater> {
    if (updater == null) {
        throw new Error(`Updater '${updaterId}' does not exist.`);
    }
}

export function getDefaultState(): DefaultFieldState {
    return {
        fields: {},
        status: getDefaultStatuses(),
        validation: getDefaultValidation()
    };
}

export function getDefaultStatuses(): FieldStatus {
    return {
        disabled: false,
        pristine: true,
        touched: false,
        readonly: false,
        permanent: false
    };
}

export function getInitialInputData<TValue, TRenderValue>(
    defaultValue: TValue,
    initialValue?: TValue,
    currentValue?: TValue,
    transientValue?: TRenderValue
): InputFieldData<TValue, TRenderValue> {
    // Triple equals to `undefined`, because `null` might be a valid value.
    if (initialValue === undefined) {
        initialValue = defaultValue;
    }

    // Triple equals to `undefined`, because `null` might be a valid value.
    if (currentValue === undefined) {
        currentValue = initialValue;
    }

    return {
        defaultValue,
        initialValue,
        currentValue,
        transientValue,
        modifiers: {},
        modifiersOrder: []
    };
}

export function getDefaultUpdatersFactories(): UpdatersFactories {
    return {
        validation: ValidationUpdaterFactory,
        value: ValueUpdaterFactory,
        status: StatusUpdaterFactory
    };
}

export function getDefaultValidation(): FieldValidation<any> {
    return {
        results: [],
        validators: {},
        validatorsOrder: []
    };
}

export function isInputFieldData(candidate: {}): candidate is InputFieldData<any, any> {
    const inputValues = candidate as InputFieldData<any, any>;
    return (
        inputValues.defaultValue !== undefined &&
        inputValues.initialValue !== undefined &&
        inputValues.currentValue !== undefined &&
        inputValues.modifiers !== undefined &&
        typeof inputValues.modifiers === "object" &&
        Array.isArray(inputValues.modifiersOrder)
    );
}
