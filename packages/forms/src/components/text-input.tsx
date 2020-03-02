import React, { useRef, useEffect, SyntheticEvent } from "react";
import {
    FieldState,
    Initial,
    getDefaultValues,
    assertFieldIsDefined,
    InputFieldData,
    TextSelection,
    SpecificKey
} from "@reactway/forms-core";
import { useInputField, FieldRef, useInputFieldHelpers } from "../helpers";
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

    const { id: fieldId, inputElementProps } = useInputField(name, fieldRef, () => initialState(defaultValue, initialValue));
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

    useEffect(() => {
        const updateSelection = (): void => {
            const activeFieldId = store.helpers.getActiveFieldId();
            if (textRef.current == null || activeFieldId !== fieldId) {
                return;
            }

            const fieldState = store.helpers.selectField(fieldId);
            assertFieldIsDefined(fieldState, fieldId);

            const textState = fieldState as TextInputState;

            const selection = textState.data.selection;
            if (selection == null) {
                // textRef.current.blur();
                return;
            }

            console.log("Setting selection range...", JSON.stringify(selection, null, 4));
            textRef.current.setSelectionRange(selection.selectionStart, selection.selectionEnd, selection.selectionDirection);
        };

        updateSelection();

        const selectionDependencyPart: SpecificKey<InputFieldData<any, any>, "selection"> = "selection";

        return store.addListener(() => {
            updateSelection();
        }, [`${fieldId}.data.${selectionDependencyPart}`]);
    });

    const onSelect: React.ReactEventHandler<HTMLInputElement> = event => {
        event.persist();
        store.update(updateHelpers => {
            const fieldState = updateHelpers.selectField(fieldId);
            assertFieldIsDefined(fieldState, fieldId);

            const textState = fieldState as TextInputState;

            const selectionStart = event.currentTarget.selectionStart;
            const selectionEnd = event.currentTarget.selectionEnd;
            const selectionDirection: TextSelection["selectionDirection"] =
                (event.currentTarget.selectionDirection as TextSelection["selectionDirection"]) ?? "none";

            if (selectionStart == null || selectionEnd == null) {
                textState.data.selection = undefined;
                return;
            }

            const newSelection = {
                selectionStart: selectionStart,
                selectionEnd: selectionEnd,
                selectionDirection: selectionDirection
            };

            console.warn("onSelect", newSelection);
            textState.data.selection = newSelection;
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
