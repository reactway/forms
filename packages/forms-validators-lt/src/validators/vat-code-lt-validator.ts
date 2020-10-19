import { useValidator } from "@reactway/forms";
import { ValidatorResult } from "@reactway/forms-core";
import { BaseValidatorProps } from "../contracts";

const defaultErrorMessage = "Incorrect VAT code.";

export const VatCodeLtValidator = (props: BaseValidatorProps): null => {
    const errorMessage = props.errorMessage ?? defaultErrorMessage;

    useValidator<string>(
        VatCodeLtValidator.name,
        () => {
            return {
                shouldValidate: value => {
                    return value != null && value.trim().length > 0;
                },
                validate: (value): ValidatorResult => {
                    if (!/^LT\d{8,12}$/.test(value)) {
                        return [errorMessage];
                    }
                }
            };
        },
        [errorMessage]
    );

    return null;
};
