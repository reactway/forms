import { useEffect, useState } from "react";
import { InputFieldData, FieldState, assertFieldIsDefined, ValueUpdater, ValidationUpdater } from "@reactway/forms-core";
import { useFieldContext } from "../components/field-context";

type InputFieldState = FieldState<unknown, InputFieldData<unknown, unknown>> | undefined;

export function useFieldValueEffect<TValue>(fieldId: string, defaultValue: TValue, initialValue?: TValue, currentValue?: TValue): void {
    const { store } = useFieldContext();
    const [{ prevDefaultValue, prevInitialValue, prevCurrentValue }, setPrevValues] = useState(() => ({
        prevDefaultValue: defaultValue,
        prevInitialValue: initialValue,
        prevCurrentValue: currentValue
    }));

    useEffect(() => {
        // prettier-ignore
        if (
            prevDefaultValue === defaultValue && 
            prevInitialValue === initialValue && 
            prevCurrentValue === currentValue
        ) {
            return;
        }

        store.update(helpers => {
            const fieldState = helpers.selectField(fieldId) as InputFieldState;
            assertFieldIsDefined(fieldState);

            fieldState.data.defaultValue = defaultValue;
            // initialValue coming from the prop can become undefined, but it is not a correct value.
            // Thus, it has to fallback to a defaultValue.
            fieldState.data.initialValue = initialValue === undefined ? defaultValue : initialValue;
            if (currentValue !== undefined) {
                const valueUpdater = helpers.getUpdater<ValueUpdater>("value");
                valueUpdater.updateFieldValue(fieldState.id, currentValue);

                const validationUpdater = helpers.getUpdater<ValidationUpdater>("validation");
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                validationUpdater.validateField(fieldId);
            }
        });

        setPrevValues({
            prevDefaultValue: defaultValue,
            prevInitialValue: initialValue,
            prevCurrentValue: currentValue
        });
    }, [store, fieldId, prevDefaultValue, defaultValue, prevInitialValue, initialValue, prevCurrentValue, currentValue]);

    useEffect(() => {
        if (
            (prevCurrentValue === undefined && currentValue !== undefined) ||
            (prevCurrentValue !== undefined && currentValue === undefined)
        ) {
            // TODO: Normal errors.
            throw new Error("A component is changing controlled field to be uncontrolled.");
        }
    }, [prevCurrentValue, currentValue]);
}
