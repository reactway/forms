import React from "react";
import { ValidationResultType, FieldSelector } from "@reactway/forms-core";
import { useFieldContext } from "./field-context";

export interface ValidationResultsProps {
    fieldSelector: FieldSelector | undefined;
}

export const ValidationResults = (props: ValidationResultsProps): JSX.Element | null => {
    const { store } = useFieldContext();

    if (props.fieldSelector == null) {
        return null;
    }

    const fieldState = store.helpers.selectField(props.fieldSelector);
    if (fieldState == null) {
        return null;
    }

    const validationInProgress = fieldState.validation.currentValidation != null;

    const loader = validationInProgress ? <div>Validating...</div> : null;
    const validationResults = fieldState.validation.results;

    const errors = validationResults
        .filter(result => result.type === ValidationResultType.Error)
        .map((error, index) => {
            return (
                <div key={`error-${index}`}>
                    {error.message}
                    {error.code != null ? ` (${error.code})` : ""}
                </div>
            );
        });
    const warnings = validationResults
        .filter(result => result.type === ValidationResultType.Warning)
        .map((warning, index) => {
            return (
                <div key={`warning-${index}`}>
                    {warning.message}
                    {warning.code != null ? ` (${warning.code})` : ""}
                </div>
            );
        });

    const errorsBlock =
        errors.length === 0 ? null : (
            <div style={{ border: "1px solid #FF9494", padding: "5px", color: "red" }}>
                Errors:
                {errors}
            </div>
        );

    const warningsBlock =
        warnings.length === 0 ? null : (
            <div style={{ border: "1px solid orange", padding: "5px", color: "orange" }}>
                Warnings:
                {warnings}
            </div>
        );

    return (
        <div>
            {loader}
            {errorsBlock}
            {warningsBlock}
        </div>
    );
};
