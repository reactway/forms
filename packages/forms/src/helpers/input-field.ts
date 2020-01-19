import {
    FormState,
    FieldStateValue,
    FieldStateRenderValue,
    selectField,
    assertFieldIsDefined,
    InputFieldData,
    InputFieldState,
    FieldState
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
    console.group("Updating field", fieldId);
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

    console.log("Starting validation");
    // No need to wait for it.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    validateField(draft, helpers, fieldId);
    console.groupEnd();
}

export function getRenderValue<TFieldState extends InputFieldState<InputFieldData<any, any>>>(
    fieldState: TFieldState
): FieldStateRenderValue<TFieldState> {
    if (fieldState.data.modifier == null) {
        return fieldState.data.transientValue ?? fieldState.data.currentValue;
    }

    return fieldState.data.modifier.format(fieldState.data.currentValue, fieldState.data.transientValue);
}

// TODO: Does this function is valuable at all?
export function getRenderValueFromFormStore(store: FieldStore<FormState>, fieldId: string): unknown {
    const fieldState = selectField(store.getState(), fieldId);

    assertFieldIsDefined(fieldState, fieldId);

    return getRenderValue(fieldState);
}
