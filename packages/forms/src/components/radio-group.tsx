import React from "react";
import { FieldState, Initial, InputValues, getDefaultValues, getDefaultState } from "@reactway/forms-core";
import { useField } from "../helpers";
import { FieldContext, useFieldContext } from "./context";

export type RadioGroupValue = string | number | null;

export interface RadioGroupProps {
    name: string;
    defaultValue?: RadioGroupValue;
    initialValue?: RadioGroupValue;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RadioGroupData extends InputValues<RadioGroupValue, never> {}

export type RadioGroupState = FieldState<RadioGroupValue, RadioGroupData>;

const initialState = (defaultValue: RadioGroupValue, initialValue: RadioGroupValue | undefined): Initial<RadioGroupState> => {
    return {
        ...getDefaultState(),
        data: {
            ...getDefaultValues(defaultValue, initialValue)
        },
        getValue: state => {
            return state.data.currentValue;
        },
        setValue: (state, value) => {
            throw new Error("Not implemented.");
        }
    };
};

export const RadioGroup: React.FC<RadioGroupProps> = props => {
    const { name, defaultValue = null, initialValue } = props;

    const { store, permanent } = useFieldContext();

    // TODO: Use deps array to update initialStateFactory.
    const { state: fieldState } = useField<Element, RadioGroupState>(name, () => initialState(defaultValue, initialValue));

    return (
        <>
            <FieldContext.Provider
                value={{
                    store: store,
                    parentId: fieldState.id,
                    permanent
                }}
            >
                {props.children}
            </FieldContext.Provider>
        </>
    );
};