import React, { useRef, useEffect } from "react";
import { FieldState, assertFieldIsDefined, InputFieldData } from "@reactway/forms-core";

import { useInputField, FieldRef, useInputFieldHelpers, InitialInput } from "../helpers";

import { HTMLProps } from "../type-helpers";
import { useFieldContext, FieldContext } from "./field-context";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TextareaInputData extends InputFieldData<string, string> {
    strict: string;
}

export type TextareaInputState = FieldState<string, TextareaInputData>;

const initialState = (): InitialInput<TextareaInputState> => {
    return {
        computedValue: false,
        data: {
            strict: ""
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

interface BaseTextInputProps {
    name: string;
    fieldRef?: FieldRef;
    initialValue?: string;
    defaultValue?: string;
    value?: string;
    // TODO: AutoFocus?
    autoFocus?: boolean;
    inputMode?: React.HTMLAttributes<HTMLTextAreaElement>["inputMode"];
    onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;

    children?: React.ReactNode;
}

export interface TextareaInputProps extends BaseTextInputProps, HTMLProps<HTMLTextAreaElement, BaseTextInputProps> {}

export const TextareaInput = (props: TextareaInputProps): JSX.Element => {
    const {
        name,
        defaultValue = "",
        initialValue,
        value,
        children,
        fieldRef,
        type = "text",
        onBlur: onBlurFromProps,
        ...restProps
    } = props;

    // TODO: Check `type` prop if we support it. (Only text and password).

    const textRef = useRef<HTMLTextAreaElement>(null);
    const { store, permanent } = useFieldContext();

    const { id: fieldId, inputElementProps } = useInputField<HTMLTextAreaElement, TextareaInputState>({
        fieldName: name,
        fieldRef: fieldRef,
        elementRef: textRef,
        initialStateFactory: () => initialState(),
        values: {
            defaultValue: defaultValue,
            initialValue: initialValue,
            currentValue: value
        }
    });
    const helpers = useInputFieldHelpers(fieldId);

    useEffect(() => {
        store.update(updateHelpers => {
            const fieldState = updateHelpers.selectField(fieldId);
            assertFieldIsDefined(fieldState, fieldId);

            const textState = fieldState as TextareaInputState;
            textState.data.initialValue = initialValue ?? defaultValue;
        });
    }, [defaultValue, fieldId, initialValue, store]);

    const onBlurFromInputElementProps = inputElementProps.onBlur;
    inputElementProps.onBlur = event => {
        onBlurFromInputElementProps(event);
        if (!event.isPropagationStopped()) {
            onBlurFromProps?.(event);
        }
    };

    // TODO: Handle defaultValue, initialValue and other prop changes.
    return (
        <>
            <textarea {...inputElementProps} {...restProps} ref={textRef} />
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
