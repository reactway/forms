import { FieldState, InputFieldData, assertFieldIsDefined } from "@reactway/forms-core";

import { useFieldContext } from "../components/field-context";
import { useValidator } from "../helpers";

const DEFAULT_ERROR_MESSAGE = "This field is required.";

export interface RequiredValidatorProps {
    errorMessage?: string;
}

// TODO: Better way of getting not only value but whole data from FieldState.
export const RequiredValidator = (props: RequiredValidatorProps): null => {
    const { errorMessage = DEFAULT_ERROR_MESSAGE } = props;
    const { store, parentId } = useFieldContext();

    useValidator(
        RequiredValidator.name,
        () => {
            return {
                shouldValidate: _ => true,
                validate: value => {
                    if (parentId == null) {
                        throw new Error("ParentId is missing.");
                    }
                    const field = store.helpers.selectField(parentId) as FieldState<any, InputFieldData<any, any>> | undefined;
                    assertFieldIsDefined(field);

                    return value === field.data.defaultValue ? [errorMessage] : undefined;
                }
            };
        },
        [errorMessage, store, parentId]
    );

    return null;
};
