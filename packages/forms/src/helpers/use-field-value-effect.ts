import { useEffect } from "react";
import { InputFieldData, FieldState, assertFieldIsDefined, getInputValues } from "@reactway/forms-core";
import { useFieldContext } from "../components/field-context";

// TODO: WORK IN PROGRESS.
export function useFieldValueEffect<TValue>(fieldId: string, defaultValue: TValue, initialValue?: TValue, currentValue?: TValue): void {
    const { store } = useFieldContext();

    useEffect(() => {
        const currentState = store.helpers.selectField(fieldId) as FieldState<unknown, InputFieldData<unknown, unknown>> | undefined;
        if (currentState == null) {
            // What we should do in this case?
            return;
        }

        if (
            currentState.data.defaultValue !== defaultValue ||
            currentState.data.initialValue !== initialValue ||
            (currentValue !== undefined && currentState.data.currentValue !== currentValue)
        ) {
            store.update(helpers => {
                const fieldState = helpers.selectField(fieldId) as FieldState<unknown, InputFieldData<unknown, unknown>> | undefined;
                assertFieldIsDefined(fieldState);

                // We want to reset transient value if we get new controlled value.
                const isNewValue = currentValue !== undefined && currentValue !== fieldState.data.currentValue;
                const calculateInputValue = getInputValues(
                    defaultValue,
                    initialValue,
                    isNewValue ? currentValue : fieldState.data.currentValue,
                    isNewValue ? undefined : fieldState.data.transientValue
                );

                fieldState.data = {
                    ...fieldState.data,
                    ...calculateInputValue
                };
            });
        }
    }, [store, fieldId, defaultValue, initialValue, currentValue]);
}
