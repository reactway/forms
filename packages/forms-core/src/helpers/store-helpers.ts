import { Draft } from "immer";
import { IdSeparator, FormSelector } from "../constants";
import {
    FieldState,
    Initial,
    Dictionary,
    StoreHelpers,
    UpdateStoreHelpers,
    UpdatersFactories,
    Updater,
    FormState,
    StatusUpdater,
    UpdaterId,
    GetUpdaterReturnType,
    FieldSelector
} from "../contracts";
import { Store } from "../store";
import { getFieldNameFromId, getDefaultState, isInputFieldData } from "./generic";

export function constructStoreHelpers(state: FieldState<any, any>, fieldsCache: Dictionary<FieldState<any, any>>): StoreHelpers {
    const cachedSelectField: StoreHelpers["selectField"] = fieldSelector => {
        if (fieldSelector === FormSelector) {
            return state;
        }

        const cachedField = fieldsCache[fieldSelector];
        if (cachedField != null) {
            return cachedField;
        }

        const selectedField = selectField(state, fieldSelector);
        if (selectedField != null) {
            fieldsCache[fieldSelector] = selectedField;
        }
        return selectedField;
    };

    const helpers: StoreHelpers = {
        selectField: cachedSelectField,
        selectFieldParent: fieldSelector => {
            const parentId = getFieldParentId(fieldSelector);
            if (parentId == null) {
                return undefined;
            }

            return cachedSelectField(parentId);
        },
        getActiveFieldId: () => {
            const formState = state as FormState;
            return formState.data.activeFieldId;
        },
        getFieldParentId: getFieldParentId,
        getFormValue: () => {
            return state.getValue(state);
        }
    };
    return helpers;
}

export function constructUpdateStoreHelpers(
    store: Store<FieldState<any, any>>,
    draft: Draft<FieldState<any, any>>,
    updaters: UpdatersFactories,
    fieldsCache: Dictionary<FieldState<any, any>>
): UpdateStoreHelpers {
    const fieldStoreHelpers = constructStoreHelpers(draft, fieldsCache);
    const updateStoreHelpers: UpdateStoreHelpers = {
        ...fieldStoreHelpers,
        registerField: (fieldId, initialFieldState) => {
            registerField(draft, fieldId, initialFieldState);
        },
        unregisterField: id => {
            unregisterField(draft, id);
        },
        setActiveFieldId: fieldId => {
            const formState = draft as Draft<FormState>;
            formState.data.activeFieldId = fieldId;
        },
        updateFieldStatus: (fieldSelector, updater) => {
            const statusUpdater = updateStoreHelpers.getUpdater<StatusUpdater>("status");
            statusUpdater.updateFieldStatus(fieldSelector, updater);
        },
        getUpdater: updaterId => {
            return getUpdater(draft, updateStoreHelpers, store, updaters, updaterId);
        },
        enqueueUpdate: updater => {
            setTimeout(() => store.update(updater), 0);
        }
    };
    return updateStoreHelpers;
}

function registerField<TFieldState extends FieldState<any, any>>(
    state: FieldState<any, any>,
    fieldId: string,
    initialFieldState: Initial<TFieldState>
): void {
    if (initialFieldState.computedValue && isInputFieldData(initialFieldState.data)) {
        throw new Error(`Field ${fieldId} is marked to have computedValue, but also has data of an input field.`);
    }

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
        const mutableFields = parentField.fields as Dictionary<FieldState<any, any>>;
        // Add field into the state.
        mutableFields[fieldName] = {
            ...getDefaultState(),
            ...initialFieldState,
            id: fieldId,
            name: fieldName,
            fields: {}
        };
    }
}

function unregisterField(state: FieldState<any, any>, id: string): void {
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
    const mutableFields = parentField.fields as Dictionary<FieldState<any, any>>;
    mutableFields[fieldName] = undefined;
}

function getUpdater<TUpdater extends Updater<string>>(
    fieldState: FieldState<any, any>,
    helpers: UpdateStoreHelpers,
    store: Store<FieldState<any, any>>,
    updaters: UpdatersFactories,
    updaterId: UpdaterId<TUpdater>
): GetUpdaterReturnType<typeof updaterId, TUpdater> {
    type ResultType = GetUpdaterReturnType<typeof updaterId, TUpdater>;
    const factory = updaters[updaterId];

    if (factory != null) {
        return factory(fieldState, helpers, store) as ResultType;
    }

    return undefined as ResultType;
}

function selectRegistrationParent(state: FieldState<any, any>, fieldId: string): FieldState<any, any> | undefined {
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
export function selectField(state: FieldState<any, any>, selector: FieldSelector): FieldState<any, any> | undefined {
    if (selector === FormSelector) {
        return state;
    }
    const fieldId = selector;

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

export function getFieldParentId(fieldSelector: FieldSelector): FieldSelector | undefined {
    if (fieldSelector === FormSelector) {
        return undefined;
    }

    const lastSeparatorIndex = fieldSelector.lastIndexOf(IdSeparator);

    if (lastSeparatorIndex === -1) {
        return FormSelector;
    }

    return fieldSelector.slice(0, lastSeparatorIndex);
}

export function selectFieldParent(state: FieldState<any, any>, fieldId: string): FieldState<any, any> | undefined {
    const parentId = getFieldParentId(fieldId);
    if (parentId == null) {
        return undefined;
    }
    return selectField(state, parentId);
}
