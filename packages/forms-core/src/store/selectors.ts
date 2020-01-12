import { SEPARATOR } from "./constants";
import { FieldState } from "../contracts/form-state";

// TODO: Do we need recursion here?
export function selectField(state: FieldState<any, any>, fieldId: string | undefined): FieldState<any, any> | undefined {
    if (fieldId == null) {
        return undefined;
    }

    const firstSeparatorIndex = fieldId.indexOf(SEPARATOR);

    if (firstSeparatorIndex === -1) {
        return state.fields[fieldId];
    } else {
        const name = fieldId.slice(0, firstSeparatorIndex);
        const nextFieldId = fieldId.slice(firstSeparatorIndex + SEPARATOR.length);
        const child = state.fields[name];
        if (child == null) {
            return undefined;
        }

        return selectField(child, nextFieldId);
    }
}

export function selectFieldParent(state: FieldState<any, any>, fieldId: string | undefined): FieldState<any, any> | undefined {
    if (fieldId == null) {
        return undefined;
    }

    const firstSeparatorIndex = fieldId.indexOf(SEPARATOR);

    if (firstSeparatorIndex === -1) {
        return state;
    } else {
        const name = fieldId.slice(0, firstSeparatorIndex);
        const nextFieldId = fieldId.slice(firstSeparatorIndex + SEPARATOR.length);

        const child = state.fields[name];
        if (child == null) {
            return undefined;
        }

        return selectFieldParent(child, nextFieldId);
    }
}
