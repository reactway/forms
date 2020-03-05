import { useEffect } from "react";
import { InputFieldData, FieldState, assertFieldIsDefined } from "@reactway/forms-core";
import { useFieldContext } from "../components/field-context";

type InputFieldState = FieldState<unknown, InputFieldData<unknown, unknown>> | undefined;

// TODO: WORK IN PROGRESS.
export function useFieldValueEffect<TValue>(fieldId: string, defaultValue: TValue, initialValue?: TValue, currentValue?: TValue): void {
    const { store } = useFieldContext();

    useEffect(() => {
        const fieldState = store.helpers.selectField(fieldId) as InputFieldState;
        if (fieldState == null) {
            // What we should do in this case?
            return;
        }

        if (fieldState.data.defaultValue !== defaultValue) {
            store.update(helpers => {
                const state = helpers.selectField(fieldId) as InputFieldState;
                assertFieldIsDefined(state);
                state.data.defaultValue = defaultValue;
            });
        }
    }, [store, fieldId, defaultValue]);

    useEffect(() => {
        if (initialValue === undefined) {
            return;
        }

        const fieldState = store.helpers.selectField(fieldId) as InputFieldState;
        if (fieldState == null) {
            // What we should do in this case?
            return;
        }

        if (fieldState.data.initialValue !== initialValue) {
            store.update(helpers => {
                const state = helpers.selectField(fieldId) as InputFieldState;
                assertFieldIsDefined(state);
                state.data.initialValue = initialValue;
            });
        }
    }, [store, fieldId, initialValue]);

    useEffect(() => {
        // TODO: We need additional check for controlled value.
        if (currentValue === undefined) {
            return;
        }

        const fieldState = store.helpers.selectField(fieldId) as InputFieldState;
        if (fieldState == null) {
            // What we should do in this case?
            return;
        }

        if (fieldState.data.currentValue !== currentValue) {
            store.update(helpers => {
                const state = helpers.selectField(fieldId) as InputFieldState;
                assertFieldIsDefined(state);
                state.data.currentValue = currentValue;
            });
        }
    }, [store, fieldId, currentValue]);
}
