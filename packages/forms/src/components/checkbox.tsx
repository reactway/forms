import React from "react";
import { FieldState, Initial, getDefaultValues, InputFieldData } from "@reactway/forms-core";
import { useInputField, UseInputFieldEventHooks, FieldRef } from "../helpers";

export interface CheckboxProps {
    name: string;
    fieldRef?: FieldRef;
    defaultValue?: CheckboxValue;
    initialValue?: CheckboxValue;
}

export type CheckboxValue = boolean | null;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CheckboxData extends InputFieldData<CheckboxValue, undefined> {}

export type CheckboxFieldState = FieldState<CheckboxValue, CheckboxData>;

const initialState = (defaultValue: CheckboxValue, initialValue: CheckboxValue | undefined): Initial<CheckboxFieldState> => {
    return {
        data: {
            ...getDefaultValues(defaultValue, initialValue)
        },
        getValue: state => {
            return state.data.currentValue;
        },
        setValue: (state, value) => {
            throw new Error("Not implemented.");
        }
    };
};

const eventHooks: UseInputFieldEventHooks<HTMLInputElement> = {
    getValueFromChangeEvent: event => {
        return event.currentTarget.checked;
    }
};

export const Checkbox = (props: CheckboxProps): JSX.Element => {
    const { name, defaultValue = false, initialValue, fieldRef } = props;
    const { inputElementProps } = useInputField<HTMLInputElement, CheckboxFieldState>(
        name,
        fieldRef,
        () => initialState(defaultValue, initialValue),
        eventHooks
    );

    const { value, ...rest } = inputElementProps;

    return <input {...rest} type="checkbox" checked={value != null ? value : undefined} />;
};
