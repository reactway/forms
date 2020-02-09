import { FieldStatus, FieldValues, StoreUpdatersFactories, FieldValidation, FieldState, StoreUpdater } from "./contracts";
import { IdSeparator } from "./constants";
import { ValueUpdaterFactory, ValidationUpdaterFactory } from "./updaters";
import { StatusUpdaterFactory } from "./updaters/status-updater";

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

export function assertFieldIsDefined<TField extends FieldState<any>>(
    field: TField | undefined,
    fieldId?: string
): asserts field is NonNullable<TField> {
    if (field == null) {
        throw new Error(`Field '${fieldId}' does not exist in a given state.`);
    }
}

export function assertUpdaterIsDefined<TUpdater extends StoreUpdater>(
    updater: TUpdater | undefined,
    updaterId?: TUpdater extends StoreUpdater<infer TId> ? TId : never
): asserts updater is NonNullable<TUpdater> {
    if (updater == null) {
        throw new Error(`Updater '${updaterId}' does not exist.`);
    }
}

export function getDefaultState(): Pick<FieldState<any>, "fields" | "status" | "validation"> {
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

export function getDefaultValues<TValue, TRenderValue>(
    defaultValue: TValue,
    initialValue?: TValue,
    currentValue?: TValue,
    transientValue?: TRenderValue
): FieldValues<TValue, TRenderValue> {
    if (initialValue == null) {
        initialValue = defaultValue;
    }

    if (currentValue == null) {
        currentValue = initialValue;
    }

    return {
        defaultValue,
        initialValue,
        currentValue,
        transientValue
    };
}

export function getDefaultUpdatersFactories(): StoreUpdatersFactories {
    return {
        validation: ValidationUpdaterFactory,
        value: ValueUpdaterFactory,
        status: StatusUpdaterFactory
    };
}

export function getDefaultValidation(): FieldValidation<any> {
    return {
        results: [],
        validators: []
    };
}
