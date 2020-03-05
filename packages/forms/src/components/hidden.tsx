import React, { useEffect } from "react";
import { FieldState, InputFieldData, Initial, getInitialInputData, assertFieldIsDefined } from "@reactway/forms-core";

import { FieldRef, useFieldHelpers, useField } from "../helpers";
import { useFieldContext, FieldContext } from "./field-context";

export type HiddenState = FieldState<unknown, InputFieldData<unknown, unknown>>;

const initialState = (defaultValue: unknown, initialValue: unknown | undefined, value?: unknown): Initial<HiddenState> => {
    const calculatedValues = getInitialInputData(defaultValue, initialValue);

    if (value !== undefined && calculatedValues.currentValue === undefined) {
        calculatedValues.currentValue = value;
    }

    return {
        computedValue: false,
        data: {
            ...calculatedValues
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
    const { name, defaultValue, initialValue, value, fieldRef } = props;
    const { store, permanent } = useFieldContext();
    const { id: fieldId, state } = useField<never, HiddenState>(name, fieldRef, () => initialState(defaultValue, initialValue, value));
    const helpers = useFieldHelpers(fieldId);

    useEffect(() => {
        if (state.data.currentValue === props.value)
            store.update(helpers => {
                const fieldState = helpers.selectField(fieldId) as HiddenState;
                assertFieldIsDefined(fieldState);

                fieldState.data.currentValue = value;
            });
    }, [fieldId, defaultValue, initialValue, value]);

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
