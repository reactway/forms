import { ValidatorResult } from "@reactway/forms-core";
import { useValidator } from "@reactway/forms";

export interface PhoneNumberValidatorMessages {
    incorrect: string;
    blank: string;
}

const defaultErrorMessages: PhoneNumberValidatorMessages = {
    incorrect: "Phone number is incorrect.",
    blank: "Phone number is required."
};

interface PhoneNumberValidatorProps {
    errorMessages?: PhoneNumberValidatorMessages;
}

export const PhoneNumberLtValidator = (props: PhoneNumberValidatorProps): null => {
    const errorMessages = props.errorMessages ?? defaultErrorMessages;

    useValidator<string>(
        PhoneNumberLtValidator.name,
        () => {
            return {
                shouldValidate: value => {
                    return value != null && value.trim.length === 0;
                },
                validate: (value): ValidatorResult => {
                    const trimmedNumber = value.replace(/\s/g, "");

                    if (trimmedNumber === "" || trimmedNumber === "+370") {
                        return [errorMessages.blank];
                    }

                    if (!/^\+370\d{8}$/.test(trimmedNumber)) {
                        return [errorMessages.incorrect];
                    }
                }
            };
        },
        []
    );

    return null;
};
