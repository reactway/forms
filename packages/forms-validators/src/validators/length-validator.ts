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
    warningMessage?: string;
};

const defaultErrorMessages: LengthValidatorMessages = {
    tooShort: "Too short.",
    tooLong: "Too long."
};

const defaultWarningMessage = "Approaching the max length...";

// FIXME: Something's off with this validator.
export const LengthValidator = (props: LengthValidatorProps): null => {
    const { min = 0, max } = props;
    const errorMessages = props.errorMessages ?? defaultErrorMessages;
    const warningMessage = props.warningMessage ?? defaultWarningMessage;

    useValidator<string>(
        LengthValidator.name,
        () => {
            return {
                shouldValidate: value => {
                    return value != null && value.length > 0;
                },
                validate: (value, helpers): ValidatorResult => {
                    if (value.length < min) {
                        return [errorMessages.tooShort];
                    }

                    if (max != null && value.length > max - 2 && value.length <= max) {
                        return [helpers.warning(warningMessage)];
                    }

                    if (max != null && value.length > max) {
                        return [errorMessages.tooLong];
                    }
                }
            };
        },
        [errorMessages.tooLong, errorMessages.tooShort, max, min]
    );

    return null;
};
