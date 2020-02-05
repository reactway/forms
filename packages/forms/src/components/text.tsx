import React from "react";
import { FieldState, Initial, getDefaultStatuses, getDefaultValues, getDefaultUpdaters, getDefaultValidation } from "@reactway/forms-core";
import { useField, useInputField } from "../helpers";

export interface TextProps {
    name: string;
    initialValue?: string;
    defaultValue?: string;
}

export interface TextFieldState extends FieldState<string, string> {}

const initialState = (defaultValue: string, initialValue: string | undefined): Initial<TextFieldState> => {
    return {
        data: {},
        status: getDefaultStatuses(),
        values: getDefaultValues(defaultValue, initialValue),
        updaters: getDefaultUpdaters(),
        validation: getDefaultValidation(),
        getValue: state => {
            return state.values.currentValue;
        },
        setValue: _state => {
            // TODO: Maybe setValue updater should be used here?
            throw new Error("setValue is not implemented.");
        }
    };
};

export const Text = (props: TextProps): JSX.Element => {
    const { name, defaultValue = "", initialValue } = props;
    const { state, id, ...rest } = useInputField(name, () => initialState(defaultValue, initialValue));

    // TODO: Handle defaultValue, initialValue and other prop changes.

    return <input {...rest} type="text" />;
};
