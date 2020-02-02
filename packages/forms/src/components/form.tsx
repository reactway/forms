import React, { ReactNode, useState } from "react";
import shortid from "shortid";
import { Store, FormState, getDefaultStatuses, FormsStores } from "@reactway/forms-core";
import { FieldContext } from "./context";

console.log(FieldContext);

export interface FormProps {
    onSubmit?: () => void;
    children?: ReactNode;
}

const formStateFactory = (formId: string): FormState => {
    return {
        id: formId,
        name: formId,
        data: {
            dehydratedState: {}
        },
        status: getDefaultStatuses(),
        values: {
            currentValue: null,
            defaultValue: null,
            initialValue: null
        },
        fields: {}
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
                    parentId: formId,
                    store: store,
                    permanent: false
                }}
            >
                {props.children}
            </FieldContext.Provider>
        </form>
    );
};
