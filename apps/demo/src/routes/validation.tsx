import React from "react";
import { RouteComponentProps } from "@reach/router";
import { Form, TextInput, useFieldContext } from "@reactway/forms";
import { ValidationUpdater } from "@reactway/forms-core";

import { FieldWrapper } from "../components/field-wrapper";

const ValidationActionButtons = (props: { fieldName: string }) => {
    const { store } = useFieldContext();

    const onSet = () => {
        store.update(helpers => {
            const validationUpdater = helpers.getUpdater<ValidationUpdater>("validation");
            validationUpdater.setFieldValidationResults(props.fieldName, ["Button click error result."]);
        });
    };

    const onReset = () => {
        store.update(helpers => {
            const validationUpdater = helpers.getUpdater<ValidationUpdater>("validation");
            validationUpdater.resetFieldValidationResults(props.fieldName);
        });
    };

    return (
        <>
            <button type="button" onClick={onSet}>
                Set errors
            </button>
            <button type="button" onClick={onReset}>
                Reset errors
            </button>
        </>
    );
};

export const Validation = (_props: RouteComponentProps): JSX.Element => {
    return (
        <div>
            <Form>
                <ValidationActionButtons fieldName="firstName" />
                <FieldWrapper label="First Name">
                    <TextInput name="firstName" />
                </FieldWrapper>
            </Form>
        </div>
    );
};
