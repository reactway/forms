import React, { useRef, useEffect } from "react";
import { FieldState, Initial, getDefaultStatuses, getDefaultValues, getDefaultValidation, Store } from "@reactway/forms-core";
import { useInputField } from "../helpers";
import { useFieldContext } from "./context";

export interface TextProps {
    name: string;
    initialValue?: string;
    defaultValue?: string;
    autoFocus?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TextFieldState extends FieldState<string, string> {}

const initialState = (defaultValue: string, initialValue: string | undefined): Initial<TextFieldState> => {
    return {
        data: {},
        status: getDefaultStatuses(),
        values: getDefaultValues(defaultValue, initialValue),
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
    const { name, defaultValue = "", initialValue, ...restProps } = props;

    const { store } = useFieldContext();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { state, id: fieldId, ...restField } = useInputField(name, () => initialState(defaultValue, initialValue));

    const textRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const focusWhenActive = (): void => {
            // TODO: This focuses field on any store change.
            const activeFieldId = store.helpers.getActiveFieldId();
            if (activeFieldId === fieldId && textRef.current != null) {
                textRef.current.focus();
            }
        };

        focusWhenActive();

        return store.addListener(() => {
            focusWhenActive();
        });
    }, [fieldId, store]);

    // TODO: Handle defaultValue, initialValue and other prop changes.
    return <input {...restField} type="text" {...restProps} ref={textRef} />;
};
