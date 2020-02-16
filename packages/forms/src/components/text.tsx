import React, { useRef, useEffect, RefObject, MutableRefObject, Ref, LegacyRef } from "react";
import {
    FieldState,
    Initial,
    getDefaultStatuses,
    getDefaultValues,
    getDefaultValidation,
    InputValues,
    ValueUpdater,
    assertFieldIsDefined
} from "@reactway/forms-core";
import { useInputField, FieldRef, MutableFieldRef } from "../helpers";
import { useFieldContext, FieldContext } from "./context";

export interface TextProps {
    name: string;
    fieldRef?: FieldRef;
    initialValue?: string;
    defaultValue?: string;
    autoFocus?: boolean;

    children?: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TextFieldData extends InputValues<string, string> {}

export type TextFieldState = FieldState<string, TextFieldData>;

const initialState = (defaultValue: string, initialValue: string | undefined): Initial<TextFieldState> => {
    return {
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

export const Text = (props: TextProps): JSX.Element => {
    const { name, defaultValue = "", initialValue, children, fieldRef, ...restProps } = props;

    const { store, permanent } = useFieldContext();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { state, id: fieldId, ...restField } = useInputField(name, fieldRef, () => initialState(defaultValue, initialValue));

    useEffect(() => {
        store.update((_, helpers) => {
            const fieldState = helpers.selectField(fieldId);
            assertFieldIsDefined(fieldState, fieldId);

            const textState = fieldState as TextFieldState;
            textState.data.initialValue = initialValue ?? defaultValue;
        });
    }, [defaultValue, fieldId, initialValue, store]);

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
        }, ["data.activeFieldId"]);
    }, [fieldId, store]);

    // TODO: Handle defaultValue, initialValue and other prop changes.
    return (
        <>
            <input {...restField} type="text" {...restProps} ref={textRef} />
            {/* TODO: <FieldChildren>? */}
            <FieldContext.Provider
                value={{
                    parentId: fieldId,
                    permanent: permanent,
                    store: store
                }}
            >
                {children}
            </FieldContext.Provider>
        </>
    );
};
