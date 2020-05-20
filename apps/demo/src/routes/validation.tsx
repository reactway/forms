import React from "react";
import { RouteComponentProps } from "@reach/router";
import { Form, TextInput, useFieldContext } from "@reactway/forms";
import { ValidationUpdater } from "@reactway/forms-core";

import { FieldWrapper } from "../components/field-wrapper";

const ValidateButton = (props: { fieldName: string }) => {
    const { store } = useFieldContext();

    const onClick = () => {
        store.update(helpers => {
            const validationUpdater = helpers.getUpdater<ValidationUpdater>("validation");
            validationUpdater.setFieldValidationResults(props.fieldName, ["Button click error result."]);
        });
    };

    return (
        <button type="button" onClick={onClick}>
            Set errors
        </button>
    );
};

export const Validation = (_props: RouteComponentProps): JSX.Element => {
    return (
        <div>
            <Form>
                <ValidateButton fieldName="firstName" />
                <FieldWrapper label="First Name">
                    <TextInput name="firstName" />
                </FieldWrapper>
            </Form>
        </div>
    );
};
