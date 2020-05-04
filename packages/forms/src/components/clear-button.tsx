import React from "react";
import { ValueUpdater, FieldState, isInputFieldData } from "@reactway/forms-core";

import { HTMLProps } from "../type-helpers";

import { useFieldContext } from "./field-context";

export interface ClearButtonProps extends HTMLProps<HTMLButtonElement> {
    children?: React.ReactNode;
}

export const ClearButton = (props: ClearButtonProps): JSX.Element => {
    const { store } = useFieldContext();

    const { children = "Clear", ...restProps } = props;

    const onClick: React.MouseEventHandler<HTMLButtonElement> = _ => {
        store.update((helpers, draft) => {
            const valueUpdater = helpers.getUpdater<ValueUpdater>("value");
            clearField(draft, valueUpdater);
        });
    };

    return (
        <button {...restProps} type="button" onClick={onClick}>
            {children}
        </button>
    );
};

function clearField(state: FieldState<any, any>, valueUpdater: ValueUpdater): void {
    if (isInputFieldData(state.data)) {
        valueUpdater.clearFieldValue(state.id);
    }

    const fieldIds = Object.keys(state.fields);
    for (const fieldId of fieldIds) {
        const field = state.fields[fieldId];
        if (field == null) {
            // TODO: Should we throw here?
            continue;
        }
        clearField(field, valueUpdater);
    }
}
