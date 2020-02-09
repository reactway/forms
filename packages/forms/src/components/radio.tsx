import React from "react";
import { FieldState, selectField, ValueUpdater } from "@reactway/forms-core";
import { useFieldContext } from "./context";
import { RadioGroupState, RadioGroup } from "./radio-group";

export type RadioValue = string | number;

export interface RadioProps {
    value: RadioValue;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RadioFieldState extends FieldState<RadioValue | undefined, { checked: boolean }> {}

export const Radio = (props: RadioProps): JSX.Element => {
    const { parentId, store } = useFieldContext();

    if (parentId == null) {
        throw new Error(`Radio must be inside ${RadioGroup.name}.`);
    }

    const parent = selectField(store.getState(), parentId) as RadioGroupState;

    if (parent == null || parent.data.currentValue === undefined) {
        throw new Error(`Radio must be inside ${RadioGroup.name}.`);
    }

    return (
        <input
            name={parent.name}
            type="radio"
            checked={parent.data.currentValue === props.value}
            onChange={event => {
                const isChecked = event.currentTarget.checked;

                if (isChecked) {
                    store.update((_draft, helpers) => {
                        const valueUpdater = helpers.getUpdater<ValueUpdater>("value");
                        valueUpdater.updateFieldValue(parentId, props.value);
                        // throw new Error("Not implemented.");

                        // helpers.updateFieldData(parentId, data => {
                        //     data.checkedValue = props.value;
                        // });
                    });
                }
            }}
        />
    );
};
