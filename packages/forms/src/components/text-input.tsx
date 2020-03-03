import React, { useRef, useEffect, useLayoutEffect } from "react";
import { FieldState, Initial, getDefaultValues, assertFieldIsDefined, InputFieldData } from "@reactway/forms-core";
import { useInputField, FieldRef, useInputFieldHelpers, extractTextSelection } from "../helpers";
import { useFieldContext, FieldContext } from "./field-context";

export interface TextInputProps {
    name: string;
    fieldRef?: FieldRef;
    initialValue?: string;
    defaultValue?: string;
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
            ...getDefaultValues(defaultValue, initialValue)
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
    const { name, defaultValue = "", initialValue, children, fieldRef, ...restProps } = props;

    const { store, permanent } = useFieldContext();

    const { id: fieldId, inputElementProps, selectionUpdateGuard, renderId } = useInputField(name, fieldRef, () =>
        initialState(defaultValue, initialValue)
    );
    const helpers = useInputFieldHelpers(fieldId);

    useEffect(() => {
        store.update(updateHelpers => {
            const fieldState = updateHelpers.selectField(fieldId);
            assertFieldIsDefined(fieldState, fieldId);

            const textState = fieldState as TextInputState;
            textState.data.initialValue = initialValue ?? defaultValue;
        });
    }, [defaultValue, fieldId, initialValue, store]);

    const textRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const focusWhenActive = (): void => {
            if (textRef.current == null) {
                return;
            }

            const activeFieldId = store.helpers.getActiveFieldId();
            if (activeFieldId === fieldId) {
                textRef.current.focus();
            }
        };

        focusWhenActive();

        return store.addListener(() => {
            focusWhenActive();
        }, ["data.activeFieldId"]);
    }, [fieldId, store]);

    useLayoutEffect(
        () => {
            const activeFieldId = store.helpers.getActiveFieldId();
            if (textRef.current == null || activeFieldId !== fieldId) {
                return;
            }

            const fieldState = store.helpers.selectField(fieldId);
            assertFieldIsDefined(fieldState, fieldId);

            const textState = fieldState as TextInputState;

            const selection = textState.data.selection;
            if (selection == null || textRef.current == null) {
                return;
            }

            // If nothing has changed
            if (
                textRef.current.selectionStart === selection.selectionStart &&
                textRef.current.selectionEnd === selection.selectionEnd &&
                textRef.current.selectionDirection === selection.selectionDirection
            ) {
                // Bail out and do nothing.
                return;
            }

            textRef.current.setSelectionRange(selection.selectionStart, selection.selectionEnd);
        },
        // Without store.helpers dependency, the selection update happens just a bit later and thus,
        // the cursor jumps to the end of the input first and _only then_ to the correct position.
        [fieldId, store.helpers]
    );

    const onSelect: React.ReactEventHandler<HTMLInputElement> = event => {
        if (selectionUpdateGuard.updated) {
            console.warn("IT WAS HANDLED BEFORE onSelect!");
            return;
        }
        event.persist();
        store.update(updateHelpers => {
            const fieldState = updateHelpers.selectField(fieldId);
            assertFieldIsDefined(fieldState, fieldId);
            const newSelection = extractTextSelection(event);
            const textState = fieldState as TextInputState;
            console.log("onSelect:", newSelection);
            textState.data.selection = newSelection;
            selectionUpdateGuard.markAsUpdated();
        });
    };

    // TODO: Handle defaultValue, initialValue and other prop changes.
    return (
        <>
            <input {...inputElementProps} type="text" {...restProps} onSelect={onSelect} ref={textRef} />
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
