import React from "react";
import { useField } from "../helpers/use-field";
import { FieldState, Initial, getDefaultStatuses, getDefaultValues } from "@reactway/forms-core/src";

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
        updaters: {
            "validation-updater": 
        }
    };
};

export const Text = (props: TextProps): JSX.Element => {
    const { name, defaultValue = "", initialValue } = props;
    const { state } = useField(props.name, () => initialState(name, defaultValue, initialValue));

    return <input />;
};
