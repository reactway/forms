import { ValidatorResult } from "@reactway/forms-core";
import { useValidator } from "@reactway/forms";
import isEmail from "validator/lib/isEmail";

import { BaseValidatorProps } from "../contracts";

const defaultErrorMessage = "Email is not valid.";
const RESTRICTED_SYMBOL = "*";

export const EmailValidator = (props: BaseValidatorProps): null => {
    const errorMessage = props.errorMessage ?? defaultErrorMessage;

    useValidator<string>(
        EmailValidator.name,
        () => {
            return {
                shouldValidate: value => {
                    return typeof value === "string" && value !== "";
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
