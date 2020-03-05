import React, { useRef, useEffect } from "react";
import { FieldState, Initial, getInitialInputData, assertFieldIsDefined, InputFieldData } from "@reactway/forms-core";

import { useInputField, FieldRef, useInputFieldHelpers } from "../helpers";

import { useFieldContext, FieldContext } from "./field-context";

export interface TextInputProps {
    name: string;
    type?: "text" | "password";
    fieldRef?: FieldRef;
    initialValue?: string;
    defaultValue?: string;
    // TODO: AutoFocus?
    autoFocus?: boolean;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];

    children?: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TextInputData extends InputFieldData<string, string> {}

export type TextInputState = FieldState<string, TextInputData>;

const initialState = (defaultValue: string, initialValue: string | undefined): Initial<TextInputState> => {
    return {
        computedValue: false,
        data: {
            ...getInitialInputData(defaultValue, initialValue)
        },
        getValue: state => {
            return state.data.currentValue;
        },
        setValue: _state => {
            // TODO: Maybe setValue updater should be used here?
            throw new Error("setValue is not implemented.");
        }
    };
};

export const TextInput = (props: TextInputProps): JSX.Element => {
    const { name, defaultValue = "", initialValue, children, fieldRef, type = "text", ...restProps } = props;

    // TODO: Check `type` prop if we support it. (Only text and password).

    const textRef = useRef<HTMLInputElement>(null);
    const { store, permanent } = useFieldContext();

    const { id: fieldId, inputElementProps } = useInputField({
        fieldName: name,
        fieldRef: fieldRef,
        elementRef: textRef,
        initialStateFactory: () => initialState(defaultValue, initialValue)
    });
    const helpers = useInputFieldHelpers(fieldId);

    useEffect(() => {
        store.update(updateHelpers => {
            const fieldState = updateHelpers.selectField(fieldId);
            assertFieldIsDefined(fieldState, fieldId);

            const textState = fieldState as TextInputState;
            textState.data.initialValue = initialValue ?? defaultValue;
        });
    }, [defaultValue, fieldId, initialValue, store]);

    // TODO: Handle defaultValue, initialValue and other prop changes.
    return (
        <>
            <input {...inputElementProps} {...restProps} type={type} ref={textRef} />
            {/* TODO: <FieldChildren>? */}
            <FieldContext.Provider
                value={{
                    parentId: fieldId,
                    permanent: permanent,
                    store: store,
                    parentHelpers: helpers
                }}
            >
                {children}
            </FieldContext.Provider>
        </>
    );
};
