import React from "react";
import { ValueUpdater, FieldState, isInputFieldData } from "@reactway/forms-core";

import { HTMLProps } from "../type-helpers";

import { useFieldContext } from "./field-context";

export interface ResetProps extends HTMLProps<HTMLButtonElement> {
    children?: React.ReactNode;
}

export const ResetButton = (props: ResetProps): JSX.Element => {
    const { store } = useFieldContext();

    const { children = "Reset", ...restProps } = props;

    const onClick: React.MouseEventHandler<HTMLButtonElement> = () => {
        store.update((helpers, draft) => {
            const valueUpdater = helpers.getUpdater<ValueUpdater>("value");
            resetField(draft, valueUpdater);
        });
    };

    return (
        <button {...restProps} type="button" onClick={onClick}>
            {children}
        </button>
    );
};

function resetField(state: FieldState<any, any>, valueUpdater: ValueUpdater): void {
    if (isInputFieldData(state.data)) {
        valueUpdater.resetFieldValue(state.id);
    }

    const fieldIds = Object.keys(state.fields);
    for (const fieldId of fieldIds) {
        const field = state.fields[fieldId];
        if (field == null) {
            // TODO: Should we throw here?
            continue;
        }
        resetField(field, valueUpdater);
    }
}
