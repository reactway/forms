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
import { FieldStoreHelpers } from "@reactway/forms-core";

export function changeFieldValue<TFieldState extends InputFieldState<InputFieldData<any, any>>>(
    draft: FieldState<any, any>,
    helpers: FieldStoreHelpers,
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

        const validator = data.validator;
        if (validator == null || !validator.shouldValidate(data.currentValue)) {
            return;
        }

        const validationResult = validator.validate(data.currentValue);
        // TODO: Where do we put the validation result?
    });
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
