import React from "react";
import { getDefaultStatuses, FieldState } from "@reactway/forms-core";
import { FormContext } from "../form-context";
import { useField } from "../use-field";

export interface RadioGroupProps {
    name: string;
}

export type RadioGroupValue = string | number | null;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RadioGroupFieldState extends FieldState<RadioGroupValue, { checkedValue: RadioGroupValue }> {}

export const RadioGroup: React.FC<RadioGroupProps> = props => {
    const { state: fieldState, store, permanent } = useField<RadioGroupFieldState>(props.name, () => ({
        name: props.name,
        data: {
            checkedValue: null
        },
        getValue: state => state.data.checkedValue,
        setValue: () => {
            throw new Error();
        },
        status: getDefaultStatuses(),
        validation: {
            results: [],
            validators: []
        }
    }));

    return (
        <>
            <FormContext.Provider value={{ store: store, parentId: fieldState.id, permanent }}>{props.children}</FormContext.Provider>
        </>
    );
};
