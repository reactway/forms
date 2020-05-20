import React from "react";
import classnames from "classnames";
import { useFieldContext, useFieldId, useStoreState, RequiredValidator } from "@reactway/forms";
import { ValidationResultType, constructStoreHelpers } from "@reactway/forms-core";

import "./field-wrapper.scss";

interface Props {
    label: string;
    children: React.ReactElement<{ name: string }>;
}

export const FieldWrapper = (props: Props): JSX.Element => {
    const fieldName = props.children.props.name;
    if (fieldName === null) {
        throw Error("FieldWrapper's child must be a field with a name prop.");
    }

    return (
        <label className="field-wrapper">
            <span>
                {props.label} <RequiredField fieldName={fieldName} />
            </span>
            {props.children}
            <ValidationContainer fieldName={fieldName} />
        </label>
    );
};

const ValidationContainer = (props: { fieldName: string }): JSX.Element | null => {
    const { parentId } = useFieldContext();
    const fieldId = useFieldId(props.fieldName, parentId);
    const { state } = useStoreState(() => [`${fieldId}`], [fieldId]);
    if (state == null) {
        return null;
    }

    const helpers = constructStoreHelpers(state, {});
    const fieldState = helpers.selectField(fieldId);
    if (fieldState == null) {
        return null;
    }

    return (
        <div>
            {fieldState.validation.results.map(validationResult => (
                <span
                    className={classnames("validation-result", {
                        error: validationResult.type === ValidationResultType.Error,
                        warning: validationResult.type === ValidationResultType.Warning
                    })}
                    key={validationResult.message}
                >
                    {validationResult.message}
                </span>
            ))}
        </div>
    );
};

const RequiredField = (props: { fieldName: string }): JSX.Element | null => {
    const { parentId } = useFieldContext();
    const fieldId = useFieldId(props.fieldName, parentId);
    const { state } = useStoreState(() => [`${fieldId}`], [fieldId]);
    if (state == null) {
        return null;
    }

    const helpers = constructStoreHelpers(state, {});
    const fieldState = helpers.selectField(fieldId);
    if (fieldState == null) {
        return null;
    }
    const validators = fieldState.validation.validators;

    const requiredValidatorExists = Object.keys(validators).some(x => validators[x]?.name === RequiredValidator.name);

    if (!requiredValidatorExists) {
        return null;
    }

    return <span style={{ color: "red" }}>*</span>;
};
