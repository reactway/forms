import { ValidatorResult } from "@reactway/forms-core";
import { useValidator } from "@reactway/forms";

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

export const LengthValidator = (props: LengthValidatorProps): null => {
    const { min = 0, max } = props;
    const errorMessages = props.errorMessages ?? defaultErrorMessages;

    useValidator<string>(() => {
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
    }, [errorMessages.tooLong, errorMessages.tooShort, max, min]);

    return null;
};
