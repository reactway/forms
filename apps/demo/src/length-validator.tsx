import { useCallback } from "react";
import { useValidator } from "@reactway/forms";
import { ValidatorResult } from "@reactway/forms-core";

export interface LengthValidatorMessages {
    tooShort: string;
    tooLong: string;
}

export type LengthValidatorProps = {
    min?: number;
    max?: number;
    errorMessages?: LengthValidatorMessages;
};

export const LengthValidator = (props: LengthValidatorProps): null => {
    const {
        min = 0,
        max,
        errorMessages = {
            tooShort: "The value is too short.",
            tooLong: "The value is too long."
        }
    } = props;

    const validate = useCallback(
        (value: string): ValidatorResult => {
            if (value.length < min) {
                return errorMessages.tooShort;
            }
            if (max != null && value.length > max) {
                return errorMessages.tooLong;
            }
        },
        [errorMessages, max, min]
    );

    useValidator<string>({
        shouldValidate: value => {
            return value != null && value.length > 0;
        },
        validate: validate
    });
    return null;
};
