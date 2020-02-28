import React, { useRef, useEffect } from "react";
import {
    FieldState,
    Initial,
    getDefaultValues,
    assertFieldIsDefined,
    InputFieldData,
    FieldHelpers,
    ValidationUpdater
} from "@reactway/forms-core";
import { useInputField, FieldRef } from "../helpers";
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
export interface TextFieldData extends InputFieldData<string, string> {}

export type TextFieldState = FieldState<string, TextFieldData>;

const initialState = (defaultValue: string, initialValue: string | undefined): Initial<TextFieldState> => {
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

export const Text = (props: TextProps): JSX.Element => {
    const { name, defaultValue = "", initialValue, children, fieldRef, ...restProps } = props;

    const { store, permanent } = useFieldContext();

    const { id: fieldId, inputElementProps, orderGuards } = useInputField(name, fieldRef, () => initialState(defaultValue, initialValue));

    useEffect(() => {
        store.update(helpers => {
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

    const helpers: FieldHelpers = {
        registerValidator: validator => {
            // Will be overwritten synchronously.
            let validatorId = "";
            store.update(registerHelpers => {
                const validationUpdater = registerHelpers.getUpdater<ValidationUpdater>("validation");
                validatorId = validationUpdater.registerValidator(fieldId, validator);
            });
            return validatorId;
        },
        unregisterValidator: validator => {
            store.update(unregisterHelpers => {
                const validationUpdater = unregisterHelpers.getUpdater<ValidationUpdater>("validation");
                validationUpdater.unregisterValidator(fieldId, validator);
            });
        },
        orderGuards
    };

    // TODO: Handle defaultValue, initialValue and other prop changes.
    return (
        <>
            <input {...inputElementProps} type="text" {...restProps} ref={textRef} />
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
