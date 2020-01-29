import React, { useLayoutEffect, useRef } from "react";
import {
    getDefaultStatuses,
    InputFieldData,
    getDefaultFieldData,
    InputFieldState,
    formsLogger,
    InitialFieldState
} from "@reactway/forms-core";

import { FormContext } from "../form-context";
import { useField } from "../use-field";
import { getRenderValue, changeFieldValue } from "../helpers/input-field";
import { ValidationMechanismImplementation } from "../mechanisms/validation";

export interface Cursor {
    selectionStart: number;
    selectionEnd: number;
    selectionDirection: string | null;
}

export interface TextFieldData extends InputFieldData<string, string> {
    selectionStart?: number;
    selectionEnd?: number;
    selectionDirection?: "forward" | "backward" | "none";
}
export type TextFieldState = InputFieldState<TextFieldData>;

export interface TextProps {
    name: string;
    initialValue?: string;
    defaultValue: string;
}

const initialFieldState = (name: string, defaultValue: string, initialValue: string | undefined): InitialFieldState<TextFieldState> => ({
    name: name,
    data: getDefaultFieldData<string, string>(defaultValue, initialValue),
    getValue: state => state.data.currentValue,
    setValue: (state, value) => {
        // Should not only set the value, but also trigger validation and possibly parsing of the set value.
        state.data.currentValue = value;
    },
    status: getDefaultStatuses(),
    validation: {
        results: [],
        validators: []
    },
    mechanisms: {
        "field-validation": new ValidationMechanismImplementation()
    }
});

export const Text = (props: React.PropsWithChildren<TextProps>): React.ReactElement => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { state: fieldState, store, permanent } = useField<TextFieldState>(props.name, () =>
        initialFieldState(props.name, props.defaultValue, props.initialValue)
    );

    useLayoutEffect(() => {
        if (inputRef.current == null) {
            return;
        }

        const isCurrentElementFocused = document.activeElement === inputRef.current;
        if (!fieldState.status.focused || isCurrentElementFocused) {
            return;
        }

        inputRef.current.focus();
    }, [fieldState.status.focused]);

    useLayoutEffect(() => {
        if (inputRef.current == null) {
            return;
        }

        if (fieldState.data.selectionStart == null || fieldState.data.selectionEnd == null) {
            if (fieldState.data.selectionStart != null && fieldState.data.selectionEnd == null) {
                formsLogger.warn(
                    `Field '${fieldState.id}' has selectionStart set, but selectionEnd is null.`,
                    `This is not a correct data, thus no action will be taken.`,
                    `Set both selectionStart and selectionEnd and focus the field if you intend to make a selection.`
                );
                return;
            }

            if (fieldState.data.selectionEnd != null && fieldState.data.selectionStart == null) {
                formsLogger.warn(
                    `Field '${fieldState.id}' has selectionEnd set, but selectionStart is null.`,
                    `This is not a correct data, thus no action will be taken.`,
                    `Set both selectionStart and selectionEnd and focus the field if you intend to make a selection.`
                );
                return;
            }

            return;
        }

        if (!fieldState.status.focused) {
            formsLogger.warn(
                `Field '${fieldState.id}' has selection in its data, but is not focused.`,
                `This is not a correct data, thus no action will be taken.`,
                `Focus the field if you intend to make a selection.`
            );
            return;
        }

        formsLogger.log("Setting selection range...");
        inputRef.current.setSelectionRange(
            fieldState.data.selectionStart,
            fieldState.data.selectionEnd,
            fieldState.data.selectionDirection
        );
    }, [
        fieldState.status.focused,
        fieldState.data.selectionDirection,
        fieldState.data.selectionEnd,
        fieldState.data.selectionStart,
        fieldState.id
    ]);

    return (
        <>
            <input
                ref={inputRef}
                name={props.name}
                type="text"
                value={getRenderValue(fieldState)}
                onChange={event => {
                    const nextValue = event.currentTarget.value;
                    store.update((draft, helpers) => {
                        changeFieldValue<TextFieldState>(draft, helpers, fieldState.id, nextValue);

                        // const fs = selectField(draft, fieldState.id) as TextFieldState | undefined;
                        // assertFieldIsDefined(fs, fieldState.id);

                        // const validation = getMechanism<ValidationMechanism<number>>(fs, "field-value-validation");
                        // validation?.validate(draft, fieldState.id);
                    });
                }}
                onFocus={_event => {
                    store.update((_draft, helpers) => {
                        helpers.focusField(fieldState.id);
                    });
                }}
                onBlur={_event => {
                    store.update((draft, helpers) => {
                        helpers.blurField(fieldState.id);

                        helpers.updateFieldData<TextFieldState>(fieldState.id, data => {
                            data.selectionStart = undefined;
                            data.selectionEnd = undefined;
                            data.selectionDirection = undefined;
                        });
                    });
                }}
            />
            <FormContext.Provider value={{ store: store, parentId: fieldState.id, permanent }}>{props.children}</FormContext.Provider>
        </>
    );
};

Text.defaultProps = {
    defaultValue: ""
};
