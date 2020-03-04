import React from "react";
import { RouteComponentProps } from "@reach/router";

import { Form, TextInput } from "@reactway/forms";
import { StoreResult } from "../components/store-result";
import { FieldWrapper } from "../components/field-wrapper";
import { LengthValidator } from "../validators/length-validator";

export const AllFields = (_props: RouteComponentProps): JSX.Element => {
    return (
        <div>
            <Form>
                <FieldWrapper label="First Name">
                    <TextInput name="firstName">
                        <LengthValidator max={10} errorMessages={{ tooLong: "FirstName is too long.", tooShort: "" }} />
                    </TextInput>
                </FieldWrapper>
                <StoreResult />
            </Form>
        </div>
    );
};
