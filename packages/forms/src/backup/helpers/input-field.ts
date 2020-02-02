import {
    FormState,
    FieldStateValue,
    FieldStateRenderValue,
    selectField,
    assertFieldIsDefined,
    InputFieldData,
    InputFieldState,
    FieldState,
    getUpdater,
    ValidationUpdater,
    ValidationUpdaterId
} from "@reactway/forms-core";
import { FieldStore } from "@reactway/forms-core";
import { UpdateFieldStoreHelpers } from "@reactway/forms-core";
import { validateField } from "./validation";

export function changeFieldValue<TFieldState extends InputFieldState<InputFieldData<any, any>>>(
    draft: FieldState<any, any>,
    helpers: UpdateFieldStoreHelpers,
    fieldId: string,
    nextValue: FieldStateValue<TFieldState>
): void {
    helpers.updateFieldData<TFieldState>(fieldId, data => {
        if (data.modifier == null) {
            data.currentValue = nextValue;
            return;
        }

        const modifierResult = data.modifier.parse(nextValue);

        data.currentValue = modifierResult.currentValue;
        data.transientValue = modifierResult.transientValue;

        helpers.updateFieldStatus(fieldId, status => {
            status.touched = true;
            status.pristine = false;
        });
    });

    // No need to wait for it.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    validateField(draft, helpers, fieldId);
    const validation = getUpdater<ValidationUpdater<any>>(draft, "field-value-validation");
    validation?.validate(draft, fieldId);
}

export function getRenderValue<TFieldState extends InputFieldState<InputFieldData<any, any>>>(
    fieldState: TFieldState
): FieldStateRenderValue<TFieldState> {
    const currentValue = fieldState.data.transientValue ?? fieldState.data.currentValue;
    if (fieldState.data.modifiers == null) {
        return currentValue;
    }

    const updaters = fieldState.updaters;

    if (updaters == null) {
        throw new Error();
    }

    return fieldState.data.modifiers.format(currentValue);
}

// TODO: Is this function valuable at all?
// export function getRenderValueFromFormStore(store: FieldStore<FormState>, fieldId: string): unknown {
//     const fieldState = selectField(store.getState(), fieldId);

//     assertFieldIsDefined(fieldState, fieldId);

//     return getRenderValue(fieldState);
// }
