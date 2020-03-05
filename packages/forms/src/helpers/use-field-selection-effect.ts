import { useLayoutEffect } from "react";
import { assertFieldIsDefined } from "@reactway/forms-core";

import { useFieldContext } from "../components/field-context";
import { InputElement, isInputTextElement } from "./use-input-field";

export function useFieldSelectionEffect(fieldId: string, elementRef: React.RefObject<InputElement>): void {
    const { store } = useFieldContext();

    useLayoutEffect(() => {
        const activeFieldId = store.helpers.getActiveFieldId();
        if (elementRef.current == null || activeFieldId !== fieldId) {
            return;
        }

        // Only Text fields allowed.
        if (!isInputTextElement(elementRef.current)) {
            return;
        }

        const fieldState = store.helpers.selectField(fieldId);
        assertFieldIsDefined(fieldState, fieldId);

        const textState = fieldState;

        const selection = textState.data.selection;
        if (selection == null || elementRef.current == null) {
            return;
        }

        // If nothing has changed
        if (
            elementRef.current.selectionStart === selection.selectionStart &&
            elementRef.current.selectionEnd === selection.selectionEnd &&
            elementRef.current.selectionDirection === selection.selectionDirection
        ) {
            // Bail out and do nothing.
            return;
        }

        elementRef.current.setSelectionRange(selection.selectionStart, selection.selectionEnd);
    }, [elementRef, fieldId, store.helpers]);
}
