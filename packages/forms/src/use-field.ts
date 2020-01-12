import { useState, useContext, useEffect } from "react";
import { FieldState, generateFieldId, FieldStore, InitialFieldState } from "@reactway/forms-core";
import { selectField } from "@reactway/forms-core";
import { FormContext } from "./form-context";
import { isInputFieldState } from "./helpers/is";

export function useField<TFieldState extends FieldState<any, any>>(
    fieldName: string,
    initialStateFactory: () => InitialFieldState<TFieldState>
): { state: TFieldState; store: FieldStore<FieldState<any, any>>; permanent: boolean } {
    // Sanity checks.
    if (fieldName.length === 0) {
        throw new Error(`fieldName cannot be empty.`);
    }
    if (fieldName.includes(".")) {
        throw new Error(`fieldName cannot include dots: ${fieldName}`);
    }

    const { parentId, store, permanent } = useContext(FormContext);
    const fieldId = generateFieldId(fieldName, parentId);

    const [state, setState] = useState<TFieldState>(() => {
        store.update((draft, helpers) => {
            const initialState = initialStateFactory();

            const inputState = initialState as any;
            if (isInputFieldState(inputState)) {
                const data = inputState.data;

                // TODO: Docs
                if (data.transientValue != null) {
                    throw new Error(`transientValue cannot be specified during field registration.`);
                }

                if (inputState.data.modifier != null) {
                    const parseResult = inputState.data.modifier.parse(data.currentValue);

                    data.currentValue = parseResult.currentValue;
                    data.transientValue = parseResult.transientValue;
                }
            }

            helpers.registerField(fieldId, initialState);
        });

        const registeredField = selectField(store.getState(), fieldId);

        if (registeredField == null) {
            throw new Error("Field is not registered. This should never happen, so please report as bug if it does.");
        }

        return registeredField as TFieldState;
    });

    useEffect(() => {
        const storeUpdated = (): void => {
            const nextState = selectField(store.getState(), fieldId) as TFieldState;
            if (nextState != null) {
                setState(nextState);
            }
        };

        /*
        Synchronous updates occur in child component renders, because field is registered during the first render
        and store listener is added in useEffect, which fires asynchronously. The change action is emitted in-between,
        thus, a manual (i.e. not coming from the store) initial update is needed.
        */
        storeUpdated();

        const removeListener = store.addListener(storeUpdated);

        return () => {
            removeListener();
            store.update((draft, helpers) => {
                helpers.unregisterField(fieldId);
            });
        };
    }, [fieldName, fieldId, store]);

    useEffect(() => {
        if (state.status.permanent === permanent) {
            return;
        }

        store.update((draft, helpers) => {
            helpers.updateFieldStatus(fieldId, status => {
                status.permanent = permanent;
            });
        });
    }, [fieldId, store, permanent, state.status.permanent]);

    return {
        state: (state as unknown) as TFieldState,
        store,
        permanent
    };
}
