import React, { useContext, useCallback } from "react";
import { selectField, assertFieldIsDefined, InputFieldState, InputFieldData } from "@reactway/forms-core";
import { FormContext, isInputFieldState, TextFieldState } from "@reactway/forms";

export interface TestButtonProps {
    fieldId: string;
}

export const TestButton = (props: TestButtonProps): JSX.Element => {
    const { store } = useContext(FormContext);
    const { fieldId } = props;
    console.info("TestButton", fieldId, store);

    const onClick = useCallback(() => {
        store.update(draft => {
            console.info(fieldId, store);
            const fieldState = selectField(draft, fieldId) as TextFieldState | undefined;

            assertFieldIsDefined(fieldState, fieldId);

            fieldState.status.focused = true;
            fieldState.status.touched = true;

            fieldState.data.selectionStart = 0;
            fieldState.data.selectionEnd = 2;
            fieldState.data.selectionDirection = "backward";
        });
    }, [fieldId, store]);

    return (
        <button type="button" onClick={onClick}>
            Selection
        </button>
    );
};
