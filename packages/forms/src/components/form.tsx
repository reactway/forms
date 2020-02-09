import React, { ReactNode, useState, useRef, useEffect, useCallback } from "react";
import { Draft } from "immer";
import shortid from "shortid";
import {
    Store,
    FormState,
    getDefaultState,
    getDefaultStatuses,
    FormsStores,
    getDefaultUpdatersFactories,
    getDefaultValidation
} from "@reactway/forms-core";
import { FieldContext } from "./context";

console.log(FieldContext);

export interface FormProps {
    onSubmit?: () => void;
    className?: string;
    children?: ReactNode;
}

const formStateFactory = (formId: string): FormState => {
    return {
        ...getDefaultState(),
        id: formId,
        name: formId,
        data: {
            dehydratedState: {},
            activeFieldId: undefined
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
        const formStore = new Store<FormState>(() => formStateFactory(formId), getDefaultUpdatersFactories());

        FormsStores.registry.registerStore(formId, formStore);

        return formStore;
    });

    type FormRefCallback = (instance: HTMLFormElement | null) => void;

    const setFormRef = useCallback<FormRefCallback>(
        form => {
            store.update(draft => {
                const formState = draft as Draft<FormState>;
                if (form != null) {
                    formState.data.submitCallback = () => {
                        form.dispatchEvent(new Event("submit"));
                    };
                } else {
                    formState.data.submitCallback = undefined;
                }
            });
        },
        [store]
    );

    return (
        <form
            ref={setFormRef}
            onSubmit={() => {
                props.onSubmit?.();
            }}
            className={props.className}
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
