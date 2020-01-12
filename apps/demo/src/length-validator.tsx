import { useValidator } from "@reactway/forms/src";
import { useCallback } from "react";
import { ValidationResult } from "@reactway/forms-core/src";

export interface LengthValidatorMessages {
    tooShort: string;
    tooLong: string;
}

export interface LengthValidatorProps {
    min: number;
    max?: number;
    messages: LengthValidatorMessages;
}

export const LengthValidator: React.FC<LengthValidatorProps> = (props): null => {
    const { min, max, messages } = props;
    const validate = useCallback(
        (value: string): ValidationResult => {
            if (value.length < min) {
                return messages.tooShort;
            }
            if (max != null && value.length > max) {
                return messages.tooLong;
            }
        },
        [messages, max, min]
    );

    useValidator<string>({
        shouldValidate: value => {
            return value != null && value.length > 0;
        },
        validate: validate
    });
    return null;
};

LengthValidator.defaultProps = {
    min: 0,
    messages: {
        tooShort: "The value is too short.",
        tooLong: "The value is too long."
    }
};
