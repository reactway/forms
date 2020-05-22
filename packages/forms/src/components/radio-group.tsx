import React from "react";
import { FieldState, Initial, getInitialInputData, InputFieldData } from "@reactway/forms-core";
import { useField, FieldRef, useFieldHelpers } from "../helpers";
import { FieldContext, useFieldContext } from "./field-context";

export type RadioGroupValue = string | number | null;

export interface RadioGroupProps {
    name: string;
    fieldRef?: FieldRef<RadioGroupState>;
    defaultValue?: RadioGroupValue;
    initialValue?: RadioGroupValue;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface RadioGroupData extends InputFieldData<RadioGroupValue, never> {}

export type RadioGroupState = FieldState<RadioGroupValue, RadioGroupData>;

const initialState = (defaultValue: RadioGroupValue, initialValue: RadioGroupValue | undefined): Initial<RadioGroupState> => {
    return {
        computedValue: false,
        data: {
            ...getInitialInputData(defaultValue, initialValue)
        },
        getValue: state => {
            return state.data.currentValue;
        },
        setValue: (_state, _value) => {
            throw new Error("Not implemented.");
        }
    };
};

export const RadioGroup: React.FC<RadioGroupProps> = props => {
    const { name, defaultValue = null, initialValue } = props;

    const { store, permanent } = useFieldContext();

    // TODO: Use deps array to update initialStateFactory.
    const { id: fieldId, state: fieldState } = useField<Element, RadioGroupState>(name, props.fieldRef, () =>
        initialState(defaultValue, initialValue)
    );
    const helpers = useFieldHelpers(fieldId);

    return (
        <>
            <FieldContext.Provider
                value={{
                    store: store,
                    parentId: fieldState.id,
                    permanent,
                    parentHelpers: helpers
                }}
            >
                {props.children}
            </FieldContext.Provider>
        </>
    );
};
