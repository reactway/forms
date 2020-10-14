import { ValidatorResult } from "@reactway/forms-core";
import { useValidator } from "@reactway/forms";
import isEmail from "validator/lib/isEmail";

import { RESTRICTED_SYMBOL } from "../constants";
import { BaseValidatorProps } from "../constants";

const defaultErrorMessage = "Email is not valid.";

export const EmailValidator = (props: BaseValidatorProps): null => {
    const errorMessage = props.errorMessage ?? defaultErrorMessage;

    useValidator<string>(
        EmailValidator.name,
        () => {
            return {
                shouldValidate: (value) => {
                    return value != null && value.length > 0;
                },
                validate: (value): ValidatorResult => {
                    if (!isEmail(value) || value.includes(RESTRICTED_SYMBOL)) {
                        return [errorMessage];
                    }
                }
            };
        },
        []
    );

    return null;
};
