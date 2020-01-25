import { useContext, useEffect } from "react";
import { Modifier, selectField, FieldState } from "@reactway/forms-core";
import { FormContext } from "./form-context";
import { isInputFieldState } from "./helpers/is";
import { changeFieldValue } from "./helpers/input-field";

export function useModifier<TValue, TRenderValue = any>(modifier: Modifier<TValue, TRenderValue>): void {
    const { parentId, store } = useContext(FormContext);

    useEffect(() => {
        if (parentId == null) {
            return;
        }

        store.update((draft, helpers) => {
            const fieldState = selectField(draft, parentId);
            const inputFieldState = fieldState as any;

            if (!isInputFieldState(inputFieldState)) {
                throw new Error("Modifier provided for non-input field.");
            }

            // TODO: Should the last modifier win?
            // TODO: Or should we error-out and set the modifier to undefined during the props update?
            // if (inputFieldState.modifier != null) {
            //     // TODO: <CombinedModifier /> component or sth.
            //     throw new Error("Multiple modifiers are not supported. Use <CombinedModifier /> component.");
            // }

            inputFieldState.data.modifier = modifier;

            // Initial value update is needed to kick off the modifier mechanism.
            // TODO: Not sure whether this is the *right* approach, because transientValue and currentValue types can be different.
            changeFieldValue<FieldState<any, any>>(
                draft,
                helpers,
                parentId,
                inputFieldState.data.transientValue ?? inputFieldState.data.currentValue
            );
        });
    }, [store, parentId, modifier]);

    useEffect(() => {
        return () => {
            store.update(draft => {
                const fieldState = selectField(draft, parentId);
                const inputFieldState = fieldState as any;

                if (!isInputFieldState(inputFieldState)) {
                    // Should never happen
                    throw new Error(`Modifier is being removed from non-input field ${parentId}.`);
                }

                inputFieldState.data.modifier = undefined;
            });
        };
    }, [parentId, store]);
}
