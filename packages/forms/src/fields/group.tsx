import React from "react";
import { getDefaultStatuses, FieldState, NestedDictionary } from "@reactway/forms-core";
import { FormContext } from "../form-context";
import { useField } from "../use-field";

export interface GroupProps {
    name: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GroupFieldState extends FieldState<NestedDictionary<unknown>, {}> {}

export const Group: React.FC<GroupProps> = props => {
    const { state: fieldState, store, permanent } = useField<GroupFieldState>(props.name, () => ({
        name: props.name,
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
        },
        status: getDefaultStatuses(),
        validation: {
            results: [],
            validators: []
        }
    }));

    return (
        <>
            <FormContext.Provider value={{ store: store, parentId: fieldState.id, permanent }}>{props.children}</FormContext.Provider>
        </>
    );
};
