import React from "react";
import { RouteComponentProps } from "@reach/router";

import { Form, TextInput } from "@reactway/forms";
import { StoreResult } from "../components/store-result";

export const AllFields = (_props: RouteComponentProps): JSX.Element => {
    return (
        <div>
            <Form>
                <TextInput name="firstName" />
                <StoreResult />
            </Form>
        </div>
    );
};
