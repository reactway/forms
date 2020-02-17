import { Modifier } from "@reactway/forms-core";
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

        store.update((_, helpers) => {
            const valueUpdater = helpers.getUpdater<ValueUpdater>("value");
            const id = valueUpdater.registerModifier(parentId, modifier);
            setModifierId(id);
        });
    }, [modifier, parentId, store]);

    useEffect(() => {
        if (parentId == null) {
            return;
        }

        store.update((_, helpers) => {
            const parentState = helpers.selectField(parentId);
            assertFieldIsDefined(parentState, parentId);

            const valueUpdater = helpers.getUpdater<ValueUpdater>("value");
            valueUpdater.updateFieldValue(parentId, parentState.getValue(parentState));
        });
    }, [modifier, parentId, store]);

    useEffect(() => {
        if (parentId == null || modifierId == null) {
            return;
        }
        return () => {
            store.update((_, helpers) => {
                const valueUpdater = helpers.getUpdater<ValueUpdater>("value");
                valueUpdater.unregisterModifier(parentId, modifierId);
            });
        };
    }, [modifierId, parentId, store]);
}
