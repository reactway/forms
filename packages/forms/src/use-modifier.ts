import { useContext, useEffect } from "react";
import { Modifier, selectField, Format, Parse } from "@reactway/forms-core";
import { FormContext } from "./form-context";
import { isInputFieldState } from "./helpers/is";

export function useModifier<TValue, TRenderValue = any>(
    format: Modifier<TValue, TRenderValue>["format"],
    parse: Modifier<TValue, TRenderValue>["parse"]
): void {
    const { parentId, store } = useContext(FormContext);

    useEffect(() => {
        console.log("Setting modifier for ", parentId);
        store.update(draft => {
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

            const modifier = {
                format: format as Format<unknown, unknown>,
                parse: parse as Parse<unknown, unknown>
            };
            inputFieldState.data.modifier = modifier;

            console.log("Parent id:", parentId);
            console.log("Modifier:", modifier);
        });
    }, [format, parse, store, parentId]);

    useEffect(() => {
        return () => {
            console.log("Removing modifier for ", parentId);
            store.update(draft => {
                const fieldState = selectField(draft, parentId);
                const inputFieldState = fieldState as any;

                if (!isInputFieldState(inputFieldState)) {
                    // Should never happen
                    throw new Error("Modifier being removed from non-input field.");
                }

                inputFieldState.data.modifier = undefined;
            });
        };
    }, [parentId, store]);
}
