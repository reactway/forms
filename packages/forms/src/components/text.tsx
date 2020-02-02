import React from "react";
import { useField } from "../helpers";
import { FieldState, Initial, getDefaultStatuses, getDefaultValues, getDefaultUpdaters, getDefaultValidation } from "@reactway/forms-core";

export interface TextProps {
    name: string;
    initialValue?: string;
    defaultValue?: string;
}

export interface TextFieldState extends FieldState<string, string> {}

const initialState = (fieldName: string, defaultValue: string, initialValue: string | undefined): Initial<TextFieldState> => {
    return {
        name: fieldName,
        data: {},
        status: getDefaultStatuses(),
        values: getDefaultValues(defaultValue, initialValue),
        updaters: getDefaultUpdaters(),
        validation: getDefaultValidation(),
        getValue: state => {
            return state.values.currentValue;
        },
        setValue: state => {
            // TODO: Maybe setValue updater should be used here?
            throw new Error("setValue is not implemented.");
        }
    };
};

export const Text = (props: TextProps): JSX.Element => {
    const { name, defaultValue = "", initialValue } = props;
    const { state } = useField(props.name, () => initialState(name, defaultValue, initialValue));

    return <input />;
};
