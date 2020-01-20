/* eslint-disable no-console */

import { useMemo } from "react";
import { useValidator } from "@reactway/forms";
import { ValidatorResult, Validator } from "@reactway/forms-core";

export interface LengthValidatorMessages {
    tooShort: string;
    tooLong: string;
}

export type LengthValidatorProps = {
    min?: number;
    max: number;
    errorMessages?: LengthValidatorMessages;
};

const defaultErrorMessages = {
    tooShort: "The value is too short.",
    tooLong: "The value is too long."
};

let count = 0;
export const LengthValidator = (props: LengthValidatorProps): null => {
    /* eslint-disable react-hooks/rules-of-hooks */
    // Conditional hooks scream without this...
    if (count++ >= 100) {
        console.log("More than 100 renders.");
        return null;
    }

    const { min = 0, max, errorMessages = defaultErrorMessages } = props;

    const validator = useMemo<Validator<string>>(() => {
        return {
            shouldValidate: value => {
                return value != null && value.length > 0;
            },
            validate: (value: string): ValidatorResult => {
                if (value.length < min) {
                    return [errorMessages.tooShort];
                }
                if (max != null && value.length > max) {
                    return [errorMessages.tooLong];
                }
            }
        };
    }, [errorMessages, max, min]);

    useValidator<string>(validator);
    return null;
};
