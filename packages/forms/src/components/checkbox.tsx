import React, { useRef } from "react";
import { FieldState, InputFieldData } from "@reactway/forms-core";
import { useInputField, UseInputFieldEventHooks, FieldRef, InitialInput } from "../helpers";

export type CheckboxValue = boolean | null;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CheckboxData extends InputFieldData<CheckboxValue, undefined> {}

export type CheckboxState = FieldState<CheckboxValue, CheckboxData>;

const initialState = (): InitialInput<CheckboxState> => {
    return {
        computedValue: false,
        data: {},
        getValue: state => {
            return state.data.currentValue;
        },
        setValue: (_state, _value) => {
            throw new Error("Not implemented.");
        }
    };
};

const eventHooks: UseInputFieldEventHooks<HTMLInputElement> = {
    getValueFromChangeEvent: event => {
        return event.currentTarget.checked;
    }
};

export interface CheckboxProps {
    name: string;
    fieldRef?: FieldRef<CheckboxState>;
    defaultValue?: CheckboxValue;
    initialValue?: CheckboxValue;
    value?: CheckboxValue;
}

export const Checkbox = (props: CheckboxProps): JSX.Element => {
    const { name, defaultValue = false, initialValue, value, fieldRef } = props;

    const checkboxRef = useRef<HTMLInputElement>(null);
    const { inputElementProps } = useInputField<HTMLInputElement, CheckboxState>({
        fieldName: name,
        fieldRef: fieldRef,
        elementRef: checkboxRef,
        initialStateFactory: () => initialState(),
        eventHooks,
        values: {
            defaultValue: defaultValue,
            initialValue: initialValue,
            currentValue: value
        }
    });

    const { value: elementValue, ...rest } = inputElementProps;

    return <input {...rest} type="checkbox" checked={elementValue != null ? elementValue : undefined} ref={checkboxRef} />;
};
