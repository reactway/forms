import { useLayoutEffect } from "react";
import { assertFieldIsDefined } from "@reactway/forms-core";

import { useFieldContext } from "../components/field-context";

export function useFieldSelectionEffect(fieldId: string, elementRef: React.RefObject<HTMLInputElement>): void {
    const { store } = useFieldContext();

    useLayoutEffect(() => {
        const activeFieldId = store.helpers.getActiveFieldId();
        if (elementRef.current == null || activeFieldId !== fieldId) {
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
