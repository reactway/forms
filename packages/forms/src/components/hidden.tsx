import React from "react";
import { FieldState, InputFieldData, Initial, getInitialInputData } from "@reactway/forms-core";

import { FieldRef, useFieldHelpers, useField } from "../helpers";
import { useFieldValueEffect } from "../helpers/use-field-value-effect";

import { useFieldContext, FieldContext } from "./field-context";

export type HiddenState = FieldState<unknown, InputFieldData<unknown, unknown>>;

const initialState = (defaultValue: unknown, initialValue: unknown | undefined, value?: unknown): Initial<HiddenState> => {
    return {
        computedValue: false,
        data: {
            ...getInitialInputData(defaultValue, initialValue, value)
        },
        getValue: state => {
            return state.data.currentValue;
        },
        setValue: (state, value) => {
            throw new Error("Not implemented.");
        }
    };
};

export interface HiddenProps {
    name: string;
    defaultValue?: unknown;
    initialValue?: unknown;
    value?: unknown;
    children?: React.ReactNode;
    fieldRef?: FieldRef;
}

export const HiddenInput = (props: HiddenProps): JSX.Element => {
    const { name, defaultValue = null, initialValue, value, fieldRef } = props;
    const { store, permanent } = useFieldContext();
    const { id: fieldId } = useField<never, HiddenState>(name, fieldRef, () => initialState(defaultValue, initialValue, value));
    const helpers = useFieldHelpers(fieldId);

    useFieldValueEffect(fieldId, defaultValue, initialValue, value);

    return (
        <FieldContext.Provider
            value={{
                store: store,
                parentId: fieldId,
                permanent: permanent,
                parentHelpers: helpers
            }}
        >
            {props.children}
        </FieldContext.Provider>
    );
};
