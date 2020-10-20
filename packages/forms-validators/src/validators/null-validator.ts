import { useValidator } from "@reactway/forms";
import { ValidatorResult } from "@reactway/forms-core";
import { BaseValidatorProps } from "../contracts";

const defaultErrorMessage = "Field is required.";

export const NullValidator = (props: BaseValidatorProps): null => {
    const errorMessage = props.errorMessage ?? defaultErrorMessage;

    useValidator<string>(
        NullValidator.name,
        () => {
            return {
                validate: (value): ValidatorResult => {
                    if (value == null) {
                        return [errorMessage];
                    }
                }
            };
        },
        [errorMessage]
    );

    return null;
};
