import {
    FieldState,
    Initial,
    generateFieldId,
    StatusUpdater,
    FieldHelpers,
    constructFieldHelpers,
    FieldSelector
} from "@reactway/forms-core";
import { useState, useEffect } from "react";
import { useFieldContext } from "../components";
import { FieldRef, MutableFieldRef } from "./use-field-ref";
import { useValidatorsOrderGuard } from "./use-order-guards";

function fieldNameCompliance(fieldName: string): void {
    // TODO: Maybe we should throw errors with links to docs?
    if (fieldName.length === 0) {
        throw new Error(`fieldName cannot be empty.`);
    }
    if (fieldName.includes(".")) {
        throw new Error(`fieldName cannot include separators: ${fieldName}`);
    }
}

export interface UseFieldResult<TElement, TFieldState extends FieldState<any, any>> {
    // TODO: Is store needed here?
    // store: Store<FieldState<any, any>>;

    id: string;
    state: TFieldState;
}

export function useFieldId(fieldName: string, parentId: string | undefined): string {
    const [fieldId] = useState(() => generateFieldId(fieldName, parentId));

    // TODO: Compliance check.
    // useEffect(() => {
    //     return () => {
    //         throw new Error(
    //             `Field name and its parentId should never change during the lifecycle of the field. parentId: ${parentId}, fieldName: ${fieldName}`
    //         );
    //     };
    // }, [fieldName, parentId]);

    return fieldId;
}

export function useField<TElement, TFieldState extends FieldState<any, any>>(
    fieldName: string,
    fieldRef: FieldRef | undefined,
    initialStateFactory: () => Initial<TFieldState>
): UseFieldResult<TElement, TFieldState> {
    fieldNameCompliance(fieldName);

    const { store, parentId, permanent } = useFieldContext();
    const fieldId = useFieldId(fieldName, parentId);

    const [state, setState] = useState<TFieldState>(() => {
        store.update(helpers => {
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

    if (fieldRef != null) {
        const mutableRef = fieldRef as MutableFieldRef;
        mutableRef.setFieldId(fieldId);
    }

    useEffect(() => {
        return () => {
            if (fieldRef != null) {
                const mutableRef = fieldRef as MutableFieldRef;
                mutableRef.setFieldId(undefined);
            }
        };
        // Adding fieldRef to deps array sets fieldId to a proper value and to undefined immediately after.
        // This happens because the fieldRef is updated.
        // We only need to set fieldId to undefined when component is unmounted.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Store updates.
    useEffect(
        () => {
            const storeUpdated = (): void => {
                const nextState = store.helpers.selectField(fieldId);
                if (nextState != null) {
                    setState(nextState as TFieldState);
                }
            };

            /*
            Synchronous updates occur in child component renders, because field is registered during the first render
            and store listener is added in useEffect, which fires asynchronously. The change action is emitted in-between,
            thus, a manual (i.e. not coming from the store) initial update is needed here.
            */
            storeUpdated();

            const removeListener = store.addListener(storeUpdated, [fieldId]);

            return () => {
                removeListener();
                store.update(helpers => {
                    helpers.unregisterField(fieldId);
                });
            };
        },
        // The store and fieldId will never change in a compliant scenario.
        [fieldId, store]
    );

    // Permanent changes.
    useEffect(() => {
        if (state.status.permanent === permanent) {
            return;
        }

        store.update(helpers => {
            const statusUpdater = helpers.getUpdater<StatusUpdater>("status");
            statusUpdater.updateFieldStatus(fieldId, status => {
                status.permanent = permanent;
            });
        });
    }, [fieldId, permanent, state.status.permanent, store]);

    return {
        id: fieldId,
        state: state
    };
}

export function useFieldHelpers(fieldSelector: FieldSelector): FieldHelpers {
    return constructFieldHelpers(fieldSelector, {
        ...useValidatorsOrderGuard(fieldSelector)
    });
}
