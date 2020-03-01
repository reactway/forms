import React, { ReactNode, useState, useCallback } from "react";
import { Draft } from "immer";
import shortid from "shortid";
import {
    Store,
    FormState,
    FormSelector,
    FieldState,
    FormsStores,
    NestedDictionary,
    getDefaultState,
    getDefaultUpdatersFactories,
    ValidatorHelpers,
    constructValidatorHelpers,
    ValidationResultOrigin
} from "@reactway/forms-core";
import { useFieldHelpers } from "../helpers";
import { FieldContext } from "./field-context";

export type FormSubmitEventHandler = (
    event: React.FormEvent,
    store: Store<FieldState<any, any>>,
    validationResultsHelper: ValidatorHelpers
) => Promise<void> | void;

export interface FormProps {
    onSubmit?: FormSubmitEventHandler;
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
            submitCallback: undefined,
            isSubmitting: false
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
    const helpers = useFieldHelpers(FormSelector);

    type FormRefCallback = (instance: HTMLFormElement | null) => void;

    const setFormRef = useCallback<FormRefCallback>(
        form => {
            store.update((_, draft) => {
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
            onSubmit={async event => {
                event.preventDefault();
                store.update((_, draft) => {
                    draft.data.isSubmitting = true;
                });

                await props.onSubmit?.(event, store, constructValidatorHelpers(ValidationResultOrigin.FormSubmit));

                store.update((_, draft) => {
                    draft.data.isSubmitting = false;
                });
            }}
            className={props.className}
        >
            <FieldContext.Provider
                value={{
                    parentId: undefined,
                    store: store,
                    permanent: false,
                    parentHelpers: helpers
                }}
            >
                {props.children}
            </FieldContext.Provider>
        </form>
    );
};
