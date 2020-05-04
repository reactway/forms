import React from "react";
import { FormState } from "@reactway/forms-core";
import { useStoreState } from "../helpers";
import { HTMLProps } from "../type-helpers";

export interface SubmitProps extends HTMLProps<HTMLButtonElement> {
    children?: React.ReactNode;
}

export const SubmitButton = (props: SubmitProps): JSX.Element => {
    const { state } = useStoreState(() => ["formData.data.isSubmitting"], []);
    const formData = state as FormState;

    const { children = "Submit", ...restProps } = props;

    return (
        <button
            {...restProps}
            type="submit"
            style={{ cursor: formData.data.isSubmitting ? "wait" : "default" }}
            disabled={formData.data.isSubmitting}
        >
            {children}
        </button>
    );
};
