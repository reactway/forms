import React, { ReactNode, useState, useCallback } from "react";
import { Draft } from "immer";
import shortid from "shortid";
import { Store, FormState, getDefaultState, FormsStores, getDefaultUpdatersFactories, NestedDictionary } from "@reactway/forms-core";
import { FieldContext } from "./context";

export interface FormProps {
    onSubmit?: () => void;
    className?: string;
    children?: ReactNode;
}

const initialState = (formId: string): FormState => {
    return {
        ...getDefaultState(),
        computedValue: true,
        id: formId,
        name: formId,
        data: {
            dehydratedState: {},
            activeFieldId: undefined,
            submitCallback: undefined
        },
        getValue: state => {
            const result: NestedDictionary<unknown> = {};

            for (const key of Object.keys(state.fields)) {
                const field = state.fields[key];
                if (field == null) {
                    continue;
                }

                result[key] = field.getValue(field);
            }

            return result;
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
        const formStore = new Store<FormState>(() => initialState(formId), getDefaultUpdatersFactories());

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
