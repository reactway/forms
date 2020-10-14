import { useValidator } from "@reactway/forms";
import { ValidatorResult } from "@reactway/forms-core";

import { BaseValidatorProps } from "../constants";

const defaultErrorMessage = "Input cannot be blank.";

export const EmptyValidator = (props: BaseValidatorProps): null => {
    const errorMessage = props.errorMessage ?? defaultErrorMessage;

    useValidator<string>(
        EmptyValidator.name,
        () => {
            return {
                shouldValidate: (value) => {
                    // somehow if we are using `EmptyValidator` for `react-select` with `multi`, `value` comes not as a string.
                    return typeof value === "string" && value != null && value.trim().length === 0;
                },
                validate: (value): ValidatorResult => {
                    if (value.trim().length === 0) {
                        return [errorMessage];
                    }
                }
            };
        },
        [errorMessage]
    );

    return null;
};
