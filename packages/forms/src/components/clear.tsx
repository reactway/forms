import React from "react";
import { ValueUpdater, FieldState, isInputFieldData } from "@reactway/forms-core";
import { useFieldContext } from "./context";

export interface ClearProps {
    children?: React.ReactNode;
}

export const Clear = (props: ClearProps): JSX.Element => {
    const { store } = useFieldContext();

    const { children = "Clear" } = props;

    const onClick: React.MouseEventHandler<HTMLButtonElement> = event => {
        store.update((draft, helpers) => {
            const valueUpdater = helpers.getUpdater<ValueUpdater>("value");
            clearField(draft, valueUpdater);
        });
    };

    return (
        <button type="button" onClick={onClick}>
            {children}
        </button>
    );
};

function clearField(state: FieldState<any, any>, valueUpdater: ValueUpdater): void {
    console.log(`Clearing ${state.id}...`);
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
