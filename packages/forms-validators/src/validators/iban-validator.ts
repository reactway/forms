import { useValidator } from "@reactway/forms";
import { ValidatorResult } from "@reactway/forms-core";
import IBAN from "iban";

import { BaseValidatorProps } from "../contracts";

const defaultErrorMessage = "Invalid IBAN.";

export const IbanValidator = (props: BaseValidatorProps): null => {
    const errorMessage = props.errorMessage ?? defaultErrorMessage;

    useValidator<string>(
        IbanValidator.name,
        () => {
            return {
                shouldValidate: value => {
                    return typeof value === "string" && value !== "";
                },
                validate: (value): ValidatorResult => {
                    if (!IBAN.isValid(value)) {
                        return [errorMessage];
                    }
                }
            };
        },
        [errorMessage]
    );

    return null;
};
