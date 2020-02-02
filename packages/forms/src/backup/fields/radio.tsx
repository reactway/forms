import React, { useContext } from "react";
import { FieldState, selectField } from "@reactway/forms-core";

import { FormContext } from "../form-context";
import { RadioGroupFieldState } from "./radio-group";

export type RadioValue = string | number;

export interface RadioProps {
    value: RadioValue;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RadioFieldState extends FieldState<RadioValue | undefined, { checked: boolean }> {}

export const Radio: React.FC<RadioProps> = props => {
    const { parentId, store } = useContext(FormContext);

    const parent = selectField(store.getState(), parentId) as RadioGroupFieldState;
    if (parentId == null || parent == null || parent.data.checkedValue === undefined) {
        throw new Error("Radio button MUST have parent.");
    }

    return (
        <input
            name={parent.name}
            type="radio"
            checked={parent.data.checkedValue === props.value}
            onChange={event => {
                const isChecked = event.currentTarget.checked;

                if (isChecked) {
                    store.update((_draft, helpers) => {
                        helpers.updateFieldData(parentId, data => {
                            data.checkedValue = props.value;
                        });
                    });
                }
            }}
        />
    );
};
