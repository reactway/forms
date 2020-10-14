import { useValidator } from "@reactway/forms";
import { ValidatorResult } from "@reactway/forms-core";
import { BaseValidatorProps } from "../constants";

const defaultErrorMessage = "Field is required.";

export const FieldNullValidator = (props: BaseValidatorProps): null => {
    const errorMessage = props.errorMessage ?? defaultErrorMessage;

    useValidator<string>(
        FieldNullValidator.name,
        () => {
            return {
                shouldValidate: value => {
                    return value == null;
                },
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
