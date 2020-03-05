import React, { useRef } from "react";
import { FieldState, Initial, getInitialInputData, InputFieldData } from "@reactway/forms-core";
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

export type CheckboxState = FieldState<CheckboxValue, CheckboxData>;

const initialState = (defaultValue: CheckboxValue, initialValue: CheckboxValue | undefined): Initial<CheckboxState> => {
    return {
        computedValue: false,
        data: {
            ...getInitialInputData(defaultValue, initialValue)
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

    const checkboxRef = useRef<HTMLInputElement>(null);
    const { inputElementProps } = useInputField<HTMLInputElement, CheckboxState>({
        fieldName: name,
        fieldRef: fieldRef,
        elementRef: checkboxRef,
        initialStateFactory: () => initialState(defaultValue, initialValue),
        eventHooks
    });

    const { value, ...rest } = inputElementProps;

    return <input {...rest} type="checkbox" checked={value != null ? value : undefined} ref={checkboxRef} />;
};
