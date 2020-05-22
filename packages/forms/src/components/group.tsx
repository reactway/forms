import React, { useEffect, useState } from "react";
import { FieldState, Initial, NestedDictionary, ValidationUpdater, assertFieldIsDefined } from "@reactway/forms-core";
import { useField, FieldRef, useFieldHelpers } from "../helpers";
import { FieldContext, useFieldContext } from "./field-context";

export interface GroupProps {
    name: string;
    fieldRef?: FieldRef<GroupState>;
    permanent?: boolean;
    children?: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GroupState extends FieldState<NestedDictionary<unknown>, {}> {}

const initialState = (): Initial<GroupState> => {
    return {
        computedValue: true,
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
    const { id: fieldId, state: groupState } = useField<never, GroupState>(props.name, props.fieldRef, () => initialState());
    const helpers = useFieldHelpers(fieldId);

    const [previousValue, setPreviousValue] = useState<string>(JSON.stringify(undefined));

    useEffect(() => {
        if (Object.keys(groupState.validation.validators).length === 0) {
            return;
        }

        const validate = (): void => {
            store.update(updateHelpers => {
                const fieldState = updateHelpers.selectField(fieldId);
                assertFieldIsDefined(fieldState, fieldId);

                const currentValue = JSON.stringify(fieldState.getValue(fieldState));

                if (currentValue === previousValue) {
                    // Value did not change. No need to re-validate.
                    setPreviousValue(currentValue);
                    return;
                }

                // New value. Validation needs to be run.
                setPreviousValue(currentValue);

                // Cancel currently running validation
                if (fieldState.validation.currentValidation != null) {
                    fieldState.validation.currentValidation.cancellationToken.cancel();
                }

                const validationUpdater = updateHelpers.getUpdater<ValidationUpdater>("validation");
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                validationUpdater.validateField(fieldId);
            });
        };

        validate();

        return store.addListener(
            patches => {
                if (patches.every(x => x.path.includes("validation"))) {
                    return;
                }
                validate();
            },
            [fieldId]
        );
    }, [groupState.validation.validators.length, previousValue, fieldId, store, groupState.validation.validators]);

    return (
        <FieldContext.Provider
            value={{
                store: store,
                parentId: fieldId,
                permanent: props.permanent ?? parentPermanent,
                parentHelpers: helpers
            }}
        >
            {props.children}
        </FieldContext.Provider>
    );
};
