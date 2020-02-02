import React, { ReactNode, useState } from "react";
import shortid from "shortid";
import {
    Store,
    FormState,
    getDefaultState,
    getDefaultStatuses,
    FormsStores,
    getDefaultUpdaters,
    getDefaultValidation
} from "@reactway/forms-core";
import { FieldContext } from "./context";

console.log(FieldContext);

export interface FormProps {
    onSubmit?: () => void;
    children?: ReactNode;
}

const formStateFactory = (formId: string): FormState => {
    return {
        ...getDefaultState(),
        id: formId,
        name: formId,
        data: {
            dehydratedState: {}
        },
        values: {
            currentValue: null,
            defaultValue: null,
            initialValue: null
        },
        getValue: state => {
            throw new Error("Not implemented.");
        },
        setValue: (state, value) => {
            throw new Error("Not implemented.");
        }
    };
};

export const Form = (props: FormProps): JSX.Element => {
    // TODO: Choose where to store formId.
    const [formId] = useState(`form-${shortid()}`);
    const [store] = useState(() => {
        // const formId = `form-${shortid()}`;
        const formStore = new Store<FormState>(() => formStateFactory(formId));

        FormsStores.registry.registerStore(formId, formStore);

        return formStore;
    });

    return (
        <form
            onSubmit={() => {
                props.onSubmit?.();
            }}
        >
            <FieldContext.Provider
                value={{
                    parentId: undefined,
                    store: store,
                    permanent: false
                }}
            >
                {props.children}
            </FieldContext.Provider>
        </form>
    );
};
