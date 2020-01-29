import { Draft } from "immer";
import shortid from "shortid";
import { formsLogger } from "../logger";
import { FieldState, FieldStateData, FieldStatus, InitialFieldState, FieldValidator, Mechanism } from "../contracts/field-state";
import { Dictionary } from "../contracts/helpers";
import { Validator } from "../contracts/validators";
import { assertFieldIsDefined, getFieldNameFromId } from "./helpers";
import { selectField, selectFieldParent } from "./selectors";
import { FieldStore } from "./field-store";

export interface FieldStoreHelpers {
    selectField(fieldId: string): FieldState<any, any> | undefined;
}

export interface UpdateFieldStoreHelpers extends FieldStoreHelpers {
    updateFieldData<TFieldState extends FieldState<any, any>>(fieldId: string, updater: (data: FieldStateData<TFieldState>) => void): void;
    updateFieldStatus(fieldId: string, updater: (status: FieldStatus) => void): void;

    registerField<TFieldState extends FieldState<any, any>>(id: string, initialFieldState: InitialFieldState<TFieldState>): void;
    unregisterField(id: string): void;

    registerValidator(fieldId: string, validator: Validator<any>): string;
    unregisterValidator(fieldId: string, validatorId: string): void;

    focusField(fieldId: string): void;
    blurField(fieldId: string): void;

    registerMechanism(...mechanisms: Mechanism<string>[]): void;
    getMechanism<TMechanism extends Mechanism<string>>(
        mechanismId: TMechanism extends Mechanism<infer TName> ? TName : string
    ): TMechanism | undefined;

    enqueueUpdate: FieldStore<FieldState<any, any>>["update"];
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

function registerField<TFieldState extends FieldState<any, any>>(
    state: FieldState<any, any>,
    id: string,
    initialFieldState: InitialFieldState<TFieldState>
): void {
    const parentField = selectFieldParent(state, id);

    if (parentField == null) {
        throw new Error("Field parent not found");
    }

    const fieldState = parentField.fields[initialFieldState.name];

    if (fieldState != null && fieldState.status.permanent === false) {
        throw new Error(`Field '${id}' has already been registered.`);
    }

    if (fieldState == null) {
        // Make fields non-read-only
        const mutableFields = parentField.fields as Dictionary<FieldState<any, any>>;
        // Add field into the state.
        mutableFields[initialFieldState.name] = {
            ...initialFieldState,
            id: id,
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

function focusField(helpers: UpdateFieldStoreHelpers, fieldId: string): void {
    helpers.updateFieldStatus(fieldId, status => {
        if (status.focused) {
            // Field is already focused.

            if (!status.touched) {
                formsLogger.warn(
                    `Field ${fieldId} has already been focused, but status is not touched.`,
                    `Field status should always be set to touched when the field is focused.`
                );
            }
            return;
        }

        status.focused = true;
        status.touched = true;
    });
}

function blurField(helpers: UpdateFieldStoreHelpers, fieldId: string): void {
    helpers.updateFieldStatus(fieldId, status => {
        if (!status.focused) {
            // Field is not focused.
            return;
        }

        status.focused = false;
    });
}

function registerValidator(helpers: UpdateFieldStoreHelpers, fieldId: string, validator: Validator<any>): string {
    const fieldState = helpers.selectField(fieldId);

    assertFieldIsDefined(fieldState, fieldId);

    if (fieldState.validation.validators == null) {
        fieldState.validation.validators = [];
    }

    const id = shortid.generate();

    const modifiableValidators = fieldState.validation.validators as FieldValidator<any>[];
    modifiableValidators.push({
        ...validator,
        id: id
    });

    return id;
}

function unregisterValidator(helpers: UpdateFieldStoreHelpers, fieldId: string, validatorId: string): void {
    const fieldState = helpers.selectField(fieldId);

    assertFieldIsDefined(fieldState, fieldId);

    if (fieldState.validation.validators == null) {
        fieldState.validation.validators = [];
    }

    const validatorIndex = fieldState.validation.validators.findIndex(validator => validator.id === validatorId);
    if (validatorIndex === -1) {
        return;
    }

    const modifiableValidators = fieldState.validation.validators as FieldValidator<any>[];
    modifiableValidators.splice(validatorIndex, 1);
}

function registerMechanism(state: FieldState<any, any>, mechanism: Mechanism<string>): void {
    if (state.mechanisms == null) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        state.mechanisms = {};
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const mechanisms = state.mechanisms!;
    if (mechanisms[mechanism.id] != null) {
        throw new Error(`Mechanism ${mechanism.id} has already been registered.`);
    }

    mechanisms[mechanism.id] = mechanism;
}

function getMechanism<TMechanism extends Mechanism<string>>(
    fieldState: FieldState<any, any>,
    mechanismId: TMechanism extends Mechanism<infer TName> ? TName : string
): TMechanism | undefined {
    if (fieldState.mechanisms == null) {
        throw new Error("The mechanisms are not registered.");
    }
    return fieldState.mechanisms[mechanismId] as TMechanism;
}

export function constructFieldStoreHelpers(state: FieldState<any, any>, fieldsCache: Dictionary<FieldState<any, any>>): FieldStoreHelpers {
    const cachedSelectField: UpdateFieldStoreHelpers["selectField"] = fieldId => {
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

    const helpers: FieldStoreHelpers = {
        selectField: cachedSelectField
    };
    return helpers;
}

// TODO: Draft with readonly `status`
export function constructUpdateFieldStoreHelpers(
    store: FieldStore<FieldState<any, any>>,
    draft: Draft<FieldState<any, any>>,
    fieldsCache: Dictionary<FieldState<any, any>>
): UpdateFieldStoreHelpers {
    const helpers: UpdateFieldStoreHelpers = {
        ...constructFieldStoreHelpers(draft, fieldsCache),
        updateFieldData: (fieldId, updater) => {
            const fieldState = helpers.selectField(fieldId);

            assertFieldIsDefined(fieldState, fieldId);

            updater(fieldState.data);
        },
        updateFieldStatus: (fieldId, updater) => {
            updateFieldStatus(draft, fieldId, updater);
        },

        registerField: (id, initialFieldState) => {
            registerField(draft, id, initialFieldState);
        },
        unregisterField: id => {
            unregisterField(draft, id);
            fieldsCache[id] = undefined;
        },

        registerValidator: (fieldId, validator) => {
            return registerValidator(helpers, fieldId, validator);
        },
        unregisterValidator: (fieldId, validatorId) => {
            unregisterValidator(helpers, fieldId, validatorId);
        },

        focusField: fieldId => {
            focusField(helpers, fieldId);
        },
        blurField: fieldId => {
            blurField(helpers, fieldId);
        },

        registerMechanism: (...mechanisms) => {
            for (const mechanism of mechanisms) {
                registerMechanism(draft, mechanism);
            }
        },
        getMechanism: mechanismId => {
            return getMechanism(draft, mechanismId);
        },

        enqueueUpdate: updater => {
            setTimeout(() => store.update(updater), 0);
        }
    };
    return helpers;
}
