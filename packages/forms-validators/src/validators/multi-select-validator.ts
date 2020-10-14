import { useValidator } from "@reactway/forms";
import { ValidatorResult } from "@reactway/forms-core";

import { BaseValidatorProps } from "../constants";

const defaultErrorMessage = "validations:error.blank-input";

export const MultiSelectValidator = (props: BaseValidatorProps): null => {
    const errorMessage = props.errorMessage ?? defaultErrorMessage;

    useValidator<unknown[]>(
        MultiSelectValidator.name,
        () => {
            return {
                shouldValidate: value => {
                    return value != null && value.length === 0;
                },
                validate: (value): ValidatorResult => {
                    if (value.length === 0) {
                        return [errorMessage];
                    }
                }
            };
        },
        [errorMessage]
    );

    return null;
};
