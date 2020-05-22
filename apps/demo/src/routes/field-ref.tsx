import React from "react";
import { RouteComponentProps } from "@reach/router";
import { Form, TextInput, useFieldRef, TextInputState } from "@reactway/forms";

import { FieldWrapper } from "../components/field-wrapper";
import { FieldValue } from "../components/field-value";

export const FieldRef = (_props: RouteComponentProps) => {
    const textFieldRef = useFieldRef<TextInputState>();

    return (
        <div>
            <Form>
                <FieldWrapper label="First Name">
                    <TextInput name="firstName" fieldRef={textFieldRef} />
                </FieldWrapper>
            </Form>
            <FieldValue fieldRef={textFieldRef} />
        </div>
    );
};
