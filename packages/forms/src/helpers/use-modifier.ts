import { Modifier, isInputFieldData } from "@reactway/forms-core";
import { DependencyList, useMemo, useState, useLayoutEffect, useEffect } from "react";
import { ValueUpdater, assertFieldIsDefined } from "@reactway/forms-core";
import { useFieldContext } from "../components";

// TODO: Should name be added just like for validators? What could the use-cases be?
export function useModifier<TValue, TRenderValue = any>(modifierFactory: () => Modifier<TValue, TRenderValue>, deps: DependencyList): void {
    // TODO: What about permanent field modifiers?
    // What happens if in between unmounting and mounting the field component again
    // the modifiers are mutated directly in the field state?
    const { store, parentId } = useFieldContext();

    const modifier = useMemo(modifierFactory, deps);
    const [modifierId, setModifierId] = useState<string>();

    useLayoutEffect(() => {
        if (parentId == null) {
            return;
        }

        store.update(helpers => {
            const valueUpdater = helpers.getUpdater<ValueUpdater>("value");
            const id = valueUpdater.registerModifier(parentId, modifier);
            setModifierId(id);
        });
    }, [modifier, parentId, store]);

    useEffect(() => {
        if (parentId == null) {
            return;
        }

        store.update(helpers => {
            const parentState = helpers.selectField(parentId);
            assertFieldIsDefined(parentState, parentId);

            if (!isInputFieldData(parentState.data)) {
                throw new Error("Modifiers can be used only on input fields.");
            }

            const value = parentState.data.transientValue ?? parentState.data.currentValue;
            const valueUpdater = helpers.getUpdater<ValueUpdater>("value");
            valueUpdater.updateFieldValue(parentId, value);
        });
    }, [modifier, parentId, store]);

    useEffect(() => {
        if (parentId == null || modifierId == null) {
            return;
        }
        return () => {
            store.update(helpers => {
                const valueUpdater = helpers.getUpdater<ValueUpdater>("value");
                valueUpdater.unregisterModifier(parentId, modifierId);
            });
        };
    }, [modifierId, parentId, store]);
}
