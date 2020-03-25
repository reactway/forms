import React from "react";
import { FieldState, Initial } from "@reactway/forms-core";
import shortid from "shortid";

import { useField, FieldRef, useFieldHelpers } from "../helpers";
import { useFieldContext, FieldContext } from "./field-context";

export interface FieldsArrayStateData {
    fieldsOrder: string[];
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FieldsArrayState extends FieldState<unknown[], FieldsArrayStateData> {}

const initialState = (): Initial<FieldsArrayState> => {
    // TODO: Testing;
    const _order = new Array(3).fill(undefined).map(() => shortid());
    return {
        computedValue: true,
        data: {
            fieldsOrder: _order
        },
        getValue: state => {
            const { fieldsOrder } = state.data;
            const value: unknown[] = [];

            for (const fieldName of fieldsOrder) {
                const fieldState = state.fields[fieldName];
                if (fieldState == null) {
                    continue;
                }

                value.push(fieldState.getValue(fieldState));
            }

            return value;
        },
        setValue: (_state, _value) => {
            throw new Error("Not Implemented.");
        }
    };
};

export interface FieldsArrayItem {
    name: string;
}

export interface FieldsArrayProps {
    name: string;
    fieldRef?: FieldRef;
    permanent?: boolean;

    children: (item: FieldsArrayItem) => JSX.Element;
}

export const FieldsArray = (props: FieldsArrayProps): JSX.Element => {
    const { store, permanent: parentPermanent } = useFieldContext();

    const { id: fieldId, state: fieldsArrayState } = useField<never, FieldsArrayState>(props.name, props.fieldRef, () => initialState());
    const helpers = useFieldHelpers(fieldId);

    return (
        <FieldContext.Provider
            value={{
                store: store,
                parentId: fieldId,
                permanent: props.permanent ?? parentPermanent,
                parentHelpers: helpers
            }}
        >
            {fieldsArrayState.data.fieldsOrder.map(fieldName => props.children({ name: fieldName }))}
        </FieldContext.Provider>
    );
};
