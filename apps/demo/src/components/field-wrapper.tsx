import React from "react";
import classnames from "classnames";
import { useFieldContext, useStoreState, useFieldId } from "@reactway/forms";

import "./field-wrapper.scss";
import { ValidationResultType } from "@reactway/forms-core";

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
            <span>{props.label}</span>
            {props.children}
            <ValidationContainer fieldName={fieldName} />
        </label>
    );
};

const ValidationContainer = (props: { fieldName: string }): JSX.Element | null => {
    const { parentId } = useFieldContext();
    const { store } = useStoreState();
    const fieldId = useFieldId(props.fieldName, parentId);
    const fieldState = store.helpers.selectField(fieldId);

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
