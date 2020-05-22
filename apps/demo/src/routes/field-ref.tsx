import React from "react";
import { RouteComponentProps } from "@reach/router";
import { Form, TextInput, useFieldRef } from "@reactway/forms";

import { FieldWrapper } from "../components/field-wrapper";
import { FieldValue } from "../components/field-value";

export const FieldRef = (_props: RouteComponentProps) => {
    const textField = useFieldRef();

    return (
        <div>
            <Form>
                <FieldWrapper label="First Name">
                    <TextInput name="firstName" fieldRef={textField} />
                </FieldWrapper>
            </Form>
            <FieldValue fieldRef={textField} />
        </div>
    );
};
