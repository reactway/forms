import { SEPARATOR } from "./constants";
import { FieldState, FieldStatus, InputFieldData } from "../contracts/field-state";
import { JsonValue } from "../contracts/helpers";
import { selectField } from "./selectors";

export function generateFieldId(name: string, parentId: string | undefined): string {
    if (parentId == null) {
        return name;
    }
    return `${parentId}${SEPARATOR}${name}`;
}

export function assertFieldIsDefined<T>(field: T, fieldId?: string): asserts field is NonNullable<T> {
    if (field == null) {
        throw new Error(`Field '${fieldId}' does not exist in a given state.`);
    }
}

// export function dehydrateField(state: FieldState<any, any> | FormState): NestedDictionary<JsonValue> {
//     const result: NestedDictionary<JsonValue> = {};

//     for (const fieldId of Object.keys(state.fields)) {
//         const field = state.fields[fieldId];
//         if (field == null) {
//             continue;
//         }

//         result[field.name] = field.dehydrate(field);
//     }

//     return result;
// }

export function hydrateField(value: JsonValue): FieldState<any, any> {
    throw new Error(`Not implemented: hydrate(${JSON.stringify(value)})`);
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

// export function defaultFieldData<TValue, TRenderValue>(
//     initialValue: TValue,
//     defaultValue: TValue,
//     transientValue?: TRenderValue
// ): FieldData<TValue, TRenderValue> {
//     let currentValue: TValue;

//     if (initialValue == null) {
//         initialValue = defaultValue;
//         currentValue = defaultValue;
//     } else {
//         initialValue = initialValue;
//         currentValue = initialValue;
//     }

//     return {
//         currentValue: currentValue,
//         defaultValue: defaultValue,
//         initialValue: initialValue,
//         transientValue: transientValue
//     };
// }

export function getDefaultFieldData<TValue, TRenderValue>(
    defaultValue: TValue,
    initialValue?: TValue,
    currentValue?: TValue,
    transientValue?: TRenderValue
): InputFieldData<TValue, TRenderValue> {
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

export function getFieldValue<TFieldState extends FieldState<any, any> = FieldState<any, any>>(state: TFieldState): {};
export function getFieldValue<TFieldState extends FieldState<any, any> = FieldState<any, any>>(state: TFieldState, fieldId: string): any;
export function getFieldValue<TFieldState extends FieldState<any, any> = FieldState<any, any>>(state: TFieldState, fieldId?: string): any {
    if (fieldId == null) {
        return state.getValue(state);
    }

    const fieldState = selectField(state, fieldId);
    assertFieldIsDefined(fieldState, fieldId);

    return fieldState.getValue(fieldState);
}

export function getFieldNameFromId(fieldId: string): string {
    const lastSeparatorIndex = fieldId.lastIndexOf(SEPARATOR);
    if (lastSeparatorIndex === -1) {
        return fieldId;
    }

    return fieldId.slice(lastSeparatorIndex + SEPARATOR.length);
}
