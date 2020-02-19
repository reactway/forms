import React from "react";
import { ValidationResultType } from "@reactway/forms-core";
import { useStoreState } from "../helpers";

export interface ValidationResultsProps {
    fieldId: string | undefined;
}

export const ValidationResults = (props: ValidationResultsProps): JSX.Element | null => {
    const { store } = useStoreState();

    if (props.fieldId == null) {
        return null;
    }

    const fieldState = store.helpers.selectField(props.fieldId);
    if (fieldState == null) {
        return null;
    }

    const validationInProgress = fieldState.validation.currentValidation != null;

    const loader = validationInProgress ? <div>Validating...</div> : null;
    const validationResults = fieldState.validation.results;

    const errors = validationResults
        .filter(result => result.type === ValidationResultType.Error)
        .map((error, index) => {
            return <div key={`error-${index}`}>{error.message}</div>;
        });
    const warnings = validationResults
        .filter(result => result.type === ValidationResultType.Warning)
        .map((warning, index) => {
            return <div key={`warning-${index}`}>{warning.message}</div>;
        });

    return (
        <div>
            {loader}
            <div>
                Errors:
                {errors}
            </div>
            <div>
                Warnings:
                {warnings}
            </div>
        </div>
    );
};
