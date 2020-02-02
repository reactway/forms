import { Draft } from "immer";
import { IdSeparator } from "./constants";
import { FieldState, Initial, Dictionary, StoreHelpers, UpdateStoreHelpers, FieldStatus } from "./contracts";
import { Store } from "./store";
import { getFieldNameFromId, assertFieldIsDefined } from "./helpers";

export function constructStoreHelpers(state: FieldState<any>, fieldsCache: Dictionary<FieldState<any>>): StoreHelpers {
    const cachedSelectField: StoreHelpers["selectField"] = fieldId => {
        const cachedField = fieldsCache[fieldId];
        if (cachedField != null) {
            return cachedField;
        }

        const selectedField = selectField(state, fieldId);
        if (selectedField != null) {
            fieldsCache[fieldId] = selectedField;
        }
        return selectedField;
    };

    const helpers: StoreHelpers = {
        selectField: cachedSelectField
    };
    return helpers;
}

export function constructUpdateStoreHelpers(
    store: Store<FieldState<any>>,
    draft: Draft<FieldState<any>>,
    fieldsCache: Dictionary<FieldState<any>>
): UpdateStoreHelpers {
    const fieldStoreHelpers = constructStoreHelpers(draft, fieldsCache);
    return {
        ...fieldStoreHelpers,
        registerField: (id, initialFieldState) => {
            registerField(draft, id, initialFieldState);
        },
        unregisterField: id => {
            unregisterField(draft, id);
        },
        updateFieldStatus: (fieldId, updater) => {
            updateFieldStatus(draft, fieldId, updater);
        }
    };
}

function registerField<TFieldState extends FieldState<any>>(
    state: FieldState<any>,
    id: string,
    initialFieldState: Initial<TFieldState>
): void {
    const parentField = selectFieldParent(state, id);

    if (parentField == null) {
        throw new Error(`Field '${id}' parent was not found.`);
    }

    const fieldState = parentField.fields[initialFieldState.name];

    if (fieldState != null && fieldState.status.permanent === false) {
        throw new Error(`Field '${id}' has already been registered.`);
    }

    if (fieldState == null) {
        // Make fields non-read-only
        const mutableFields = parentField.fields as Dictionary<FieldState<any>>;
        // Add field into the state.
        mutableFields[initialFieldState.name] = {
            ...initialFieldState,
            id: id,
            fields: {}
        };
    }
}

function unregisterField(state: FieldState<any>, id: string): void {
    const parentField = selectFieldParent(state, id);
    if (parentField == null) {
        return;
    }
    const fieldName = getFieldNameFromId(id);
    const field = parentField.fields[fieldName];
    if (field == null) {
        return;
    }

    if (field.status.permanent) {
        return;
    }

    // Make fields non-read-only
    const mutableFields = parentField.fields as Dictionary<FieldState<any>>;
    mutableFields[fieldName] = undefined;
}

function updateFieldStatus(state: Draft<FieldState<any, any>>, fieldId: string, updater: (status: FieldStatus) => void): void {
    const fieldState = selectField(state, fieldId);

    assertFieldIsDefined(fieldState, fieldId);

    const prevStatus = fieldState.status;
    updater(fieldState.status);

    if (prevStatus === fieldState.status) {
        return;
    }

    // TODO: Recalculate all statuses
}

// TODO: Do we need recursion here?
export function selectField(state: FieldState<any>, fieldId: string | undefined): FieldState<any> | undefined {
    if (fieldId == null) {
        return undefined;
    }

    const firstSeparatorIndex = fieldId.indexOf(IdSeparator);

    if (firstSeparatorIndex === -1) {
        return state.fields[fieldId];
    } else {
        const name = fieldId.slice(0, firstSeparatorIndex);
        const nextFieldId = fieldId.slice(firstSeparatorIndex + IdSeparator.length);
        const child = state.fields[name];
        if (child == null) {
            return undefined;
        }

        return selectField(child, nextFieldId);
    }
}

export function selectFieldParent(state: FieldState<any>, fieldId: string | undefined): FieldState<any> | undefined {
    if (fieldId == null) {
        return undefined;
    }

    const firstSeparatorIndex = fieldId.indexOf(IdSeparator);

    if (firstSeparatorIndex === -1) {
        return state;
    } else {
        const name = fieldId.slice(0, firstSeparatorIndex);
        const nextFieldId = fieldId.slice(firstSeparatorIndex + IdSeparator.length);

        const child = state.fields[name];
        if (child == null) {
            return undefined;
        }

        return selectFieldParent(child, nextFieldId);
    }
}
