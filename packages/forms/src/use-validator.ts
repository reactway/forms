import { useContext, useEffect } from "react";
import { selectField, FieldState, Validator } from "@reactway/forms-core";
import { FormContext } from "./form-context";
import { isInputFieldState } from "./helpers/is";
import { changeFieldValue } from "./helpers/input-field";

export function useValidator<TValue>(validator: Validator<TValue>): void {
    const { parentId, store } = useContext(FormContext);

    useEffect(() => {
        if (parentId == null) {
            return;
        }

        store.update((draft, helpers) => {
            const fieldState = selectField(draft, parentId);
            const inputFieldState = fieldState as any;

            if (!isInputFieldState(inputFieldState)) {
                throw new Error("Validator provided for non-input field.");
            }

            inputFieldState.data.validator = validator;

            // Initial value update is needed to kick off the validation mechanism.
            changeFieldValue<FieldState<any, any>>(
                draft,
                helpers,
                parentId,
                inputFieldState.data.transientValue ?? inputFieldState.data.currentValue
            );
        });
    }, [store, parentId, validator]);

    useEffect(() => {
        return () => {
            store.update(draft => {
                const fieldState = selectField(draft, parentId);
                const inputFieldState = fieldState as any;

                if (!isInputFieldState(inputFieldState)) {
                    // Should never happen
                    throw new Error(`Validator is being removed from non-input field ${parentId}.`);
                }

                inputFieldState.data.validator = undefined;
            });
        };
    }, [parentId, store]);
}
