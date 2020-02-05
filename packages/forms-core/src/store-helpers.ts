import produce, { Draft, Patch } from "immer";
import { IdSeparator } from "./constants";
import { FieldState, Initial, Dictionary, StoreHelpers, UpdateStoreHelpers, FieldStatus, StateUpdater } from "./contracts";
import { Store } from "./store";
import { getFieldNameFromId, assertFieldIsDefined, generateFieldId } from "./helpers";

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
        selectField: cachedSelectField,
        selectFieldParent: fieldId => {
            const parentId = getFieldParentId(fieldId);
            if (parentId == null) {
                return undefined;
            }

            return cachedSelectField(parentId);
        }
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
        registerField: (fieldId, initialFieldState) => {
            registerField(draft, fieldId, initialFieldState);
        },
        unregisterField: id => {
            unregisterField(draft, id);
        },
        updateFieldStatus: (fieldId, updater) => {
            updateFieldStatus(draft, fieldId, updater);
        },
        getUpdater: updaterId => {
            return getUpdater(draft, updaterId);
        }
    };
}

function registerField<TFieldState extends FieldState<any>>(
    state: FieldState<any>,
    fieldId: string,
    initialFieldState: Initial<TFieldState>
): void {
    const fieldName = getFieldNameFromId(fieldId);
    const parentField = selectRegistrationParent(state, fieldId);

    if (parentField == null) {
        throw new Error(`Parent for field '${fieldId}' to be registered on was not found.`);
    }

    const fieldState = parentField.fields[fieldName];

    if (fieldState != null && fieldState.status.permanent === false) {
        throw new Error(`Field '${fieldId}' has already been registered.`);
    }

    if (fieldState == null) {
        // Make fields non-read-only
        const mutableFields = parentField.fields as Dictionary<FieldState<any>>;
        // Add field into the state.
        mutableFields[fieldName] = {
            ...initialFieldState,
            id: fieldId,
            name: fieldName,
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

function getUpdater<TUpdater extends StateUpdater<string>>(
    fieldState: FieldState<any>,
    updaterId: TUpdater extends StateUpdater<infer TId> ? TId : never
): TUpdater | undefined {
    if (fieldState.updaters == null) {
        throw new Error("The updaters are not registered.");
    }
    return fieldState.updaters[updaterId] as TUpdater;
}

function updateFieldStatus(state: Draft<FieldState<any>>, fieldId: string, updater: (status: FieldStatus) => void): void {
    const fieldState = selectField(state, fieldId);

    assertFieldIsDefined(fieldState, fieldId);

    const prevStatus = fieldState.status;

    let statusPatches: Patch[];
    const newStatus = produce(
        prevStatus,
        statusDraft => {
            updater(statusDraft);
        },
        patches => {
            statusPatches = patches;
        }
    );

    const statusChanged = (statusKey: keyof FieldStatus): boolean => {
        return statusPatches.find(x => x.path.includes(statusKey)) != null;
    };

    if (statusChanged("touched")) {
    }

    if (prevStatus === newStatus) {
        return;
    }

    // TODO: Recalculate all statuses
}

function selectRegistrationParent(state: FieldState<any>, fieldId: string): FieldState<any> | undefined {
    const separatorIndex = fieldId.indexOf(IdSeparator);
    if (separatorIndex === -1) {
        return state;
    } else {
        const firstChildName = fieldId.slice(0, separatorIndex);
        const nextChildId = fieldId.slice(separatorIndex + IdSeparator.length);

        const child = state.fields[firstChildName];
        if (child == null) {
            return undefined;
        }

        return selectRegistrationParent(child, nextChildId);
    }
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

function getFieldParentId(fieldId: string): string | undefined {
    const lastSeparatorIndex = fieldId.lastIndexOf(IdSeparator);

    if (lastSeparatorIndex === -1) {
        return undefined;
    }

    return fieldId.slice(0, lastSeparatorIndex);
}

export function selectFieldParent(state: FieldState<any>, fieldId: string): FieldState<any> | undefined {
    const parentId = getFieldParentId(fieldId);
    if (parentId == null) {
        return undefined;
    }
    return selectField(state, parentId);
}
