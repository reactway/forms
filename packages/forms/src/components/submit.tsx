import React from "react";
import { FormState } from "@reactway/forms-core";
import { useStoreState } from "../helpers";

export interface SubmitProps {
    children?: React.ReactNode;
}

export const Submit = (props: SubmitProps): JSX.Element => {
    const { state } = useStoreState();
    const formData = state as FormState;

    const { children = "Submit" } = props;

    return (
        <button type="submit" style={{ cursor: formData.data.isSubmitting ? "wait" : "default" }} disabled={formData.data.isSubmitting}>
            {children}
        </button>
    );
};
