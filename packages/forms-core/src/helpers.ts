import { FieldStatus, FieldValues } from "./contracts";
import { IdSeparator } from "./constants";

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

export function assertFieldIsDefined<TField>(field: TField, fieldId?: string): asserts field is NonNullable<TField> {
    if (field == null) {
        throw new Error(`Field '${fieldId}' does not exist in a given state.`);
    }
}

export function getDefaultStatuses(): FieldStatus {
    return {
        disabled: false,
        touched: false,
        focused: false,
        pristine: true,
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
