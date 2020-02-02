import React, { useState, useEffect } from "react";
import shortid from "shortid";
import { FieldStore, FormState, getDefaultStatuses, NestedDictionary, FormsStores, FieldState } from "@reactway/forms-core";

import { FormContext } from "../form-context";

export interface FormProps {
    onSubmit?: (store: FieldStore<FieldState<any, any>>) => void;
}

const initialFormState = (formId: string): FormState => ({
    id: formId,
    name: formId,
    data: {
        dehydratedState: {}
    },
    fields: {},
    getValue: fieldState => {
        const result: NestedDictionary<unknown> = {};

        for (const key of Object.keys(fieldState.fields)) {
            const field = fieldState.fields[key];
            if (field == null) {
                continue;
            }

            result[key] = field.getValue(field);
        }

        return result;
    },
    setValue: () => {
        throw new Error("Not implemented.");
    },
    status: getDefaultStatuses(),
    validation: {
        results: [],
        validators: []
    }
});

export const Form: React.FC<FormProps> = props => {
    const [store] = useState(() => {
        const formId = `form-${shortid()}`;
        const formStore = new FieldStore<FormState>(() => initialFormState(formId));

        FormsStores.Registry.registerStore(formId, formStore);

        (window as any).formStore = formStore;
        return formStore;
    });

    useEffect(() => {
        return () => {
            FormsStores.Registry.unregisterStore(store.getState().id);
        };
    }, [store]);

    return (
        <form
            onSubmit={event => {
                event.preventDefault();
                props.onSubmit?.(store);
            }}
        >
            <FormContext.Provider value={{ store: store, parentId: undefined, permanent: false }}>{props.children}</FormContext.Provider>
        </form>
    );
};
