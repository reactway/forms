/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useCallback } from "react";
import { selectField, assertFieldIsDefined } from "@reactway/forms-core";
import { FormContext, TextFieldState } from "@reactway/forms";

export interface TestButtonProps {
    fieldId: string;
}

export const TestButton = (props: TestButtonProps): JSX.Element => {
    const { store } = useContext(FormContext);
    const { fieldId } = props;

    // const onClick = useCallback(() => {
    //     store.update(draft => {
    //         console.info(fieldId, store);
    //         const fieldState = selectField(draft, fieldId) as TextFieldState | undefined;

    //         assertFieldIsDefined(fieldState, fieldId);

    //         fieldState.status.focused = true;
    //         fieldState.status.touched = true;

    //         fieldState.data.selectionStart = 0;
    //         fieldState.data.selectionEnd = 2;
    //         fieldState.data.selectionDirection = "backward";
    //     });
    // }, [fieldId, store]);

    const onClick = useCallback(() => {
        // const state = store.getState();
        // const personState = selectField(state, "person");
        // assertFieldIsDefined(personState, "person");

        // const value = personState.getValue(personState);
        // console.log(value);

        store.update((draft, helpers) => {
            const personState = helpers.selectField("person");
            assertFieldIsDefined(personState, "person");

            personState.setValue(personState, { firstName: "JOHN2", lastName: "smith2" });
        });
    }, [store]);

    return (
        <button type="button" onClick={onClick}>
            Test
        </button>
    );
};
