import React from "react";
import { FieldState, Initial, getDefaultState, getDefaultValues, NestedDictionary } from "@reactway/forms-core";
import { useField } from "../helpers";
import { FieldContext, useFieldContext } from "./context";

export interface GroupProps {
    name: string;
    permanent?: boolean;
    children?: React.ReactNode;
}

export interface GroupFieldState extends FieldState<NestedDictionary<unknown>, unknown, {}> {}

const initialState = (): Initial<GroupFieldState> => {
    return {
        ...getDefaultState(),
        values: getDefaultValues({}),
        data: {},
        getValue: state => {
            const data: NestedDictionary<any> = {};

            for (const key of Object.keys(state.fields)) {
                const field = state.fields[key];
                if (field == null) {
                    continue;
                }

                data[key] = field.getValue(field);
            }

            return data;
        },
        setValue: (state, value) => {
            for (const key of Object.keys(value)) {
                const field = state.fields[key];

                if (field == null) {
                    continue;
                }

                const newFieldValue = value[key];

                field.setValue(field, newFieldValue);
            }
        }
    };
};

export const Group = (props: GroupProps): JSX.Element => {
    const { store, permanent: parentPermanent } = useFieldContext();
    const { state: fieldState } = useField<never, GroupFieldState>(props.name, () => initialState());

    return (
        <FieldContext.Provider
            value={{
                store: store,
                parentId: fieldState.id,
                permanent: props.permanent ?? parentPermanent
            }}
        >
            {props.children}
        </FieldContext.Provider>
    );
};
