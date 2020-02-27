import React from "react";
import { ValueUpdater, FieldState, isInputFieldData } from "@reactway/forms-core";
import { useFieldContext } from "./context";

export interface ResetProps {
    children?: React.ReactNode;
}

export const Reset = (props: ResetProps): JSX.Element => {
    const { store } = useFieldContext();

    const { children = "Reset" } = props;

    const onClick: React.MouseEventHandler<HTMLButtonElement> = () => {
        store.update((draft, helpers) => {
            const valueUpdater = helpers.getUpdater<ValueUpdater>("value");
            resetField(draft, valueUpdater);
        });
    };

    return (
        <button type="button" onClick={onClick}>
            {children}
        </button>
    );
};

function resetField(state: FieldState<any, any>, valueUpdater: ValueUpdater): void {
    console.log(`Resetting ${state.id}...`);
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
