import { FieldState, Initial, generateFieldId, Store } from "@reactway/forms-core";
import { useFieldContext } from "../components";
import { useState, useEffect } from "react";

function fieldNameCompliance(fieldName: string): void {
    // TODO: Maybe we should throw errors with links to docs?
    if (fieldName.length === 0) {
        throw new Error(`fieldName cannot be empty.`);
    }
    if (fieldName.includes(".")) {
        throw new Error(`fieldName cannot include separators: ${fieldName}`);
    }
}

export interface UseFieldResult<TFieldState extends FieldState<any>> {
    state: TFieldState;
    // TODO: Is store needed here?
    // store: Store<FieldState<any>>;
}

export function useField<TFieldState extends FieldState<any>>(
    fieldName: string,
    initialStateFactory: () => Initial<TFieldState>
): UseFieldResult<TFieldState> {
    fieldNameCompliance(fieldName);
    const { store, parentId, permanent } = useFieldContext();
    const fieldId = generateFieldId(fieldName, parentId);

    const [state, setState] = useState<TFieldState>(() => {
        store.update((draft, helpers) => {
            const initialState = initialStateFactory();

            helpers.registerField(fieldId, initialState);
        });

        // Retrieve the registered field.
        const registeredField = store.helpers.selectField(fieldId);
        if (registeredField == null) {
            throw new Error("Field is not registered. This should never happen, so please report as bug if it does.");
        }

        return registeredField as TFieldState;
    });

    useEffect(() => {
        const storeUpdated = (): void => {
            const nextState = store.helpers.selectField(fieldId) as TFieldState;
            if (nextState != null) {
                setState(nextState);
            }
        };

        /*
        Synchronous updates occur in child component renders, because field is registered during the first render
        and store listener is added in useEffect, which fires asynchronously. The change action is emitted in-between,
        thus, a manual (i.e. not coming from the store) initial update is needed here.
        */
        storeUpdated();

        const removeListener = store.addListener(storeUpdated);

        return () => {
            removeListener();
            store.update((_draft, helpers) => {
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
        state: state
        // store: store
    };
}
