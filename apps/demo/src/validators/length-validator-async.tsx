import { ValidationResultOrString } from "@reactway/forms-core";
import { useValidator } from "@reactway/forms";

export interface LengthValidatorMessages {
    tooShort: string;
    tooLong: string;
}

export type LengthValidatorProps = {
    min?: number;
    max: number;
    errorMessages?: LengthValidatorMessages;
    wait: number;
};

const defaultErrorMessages = {
    tooShort: "The value is too short.",
    tooLong: "The value is too long."
};

export const LengthValidatorAsync = (props: LengthValidatorProps): null => {
    const { min = 0, max } = props;
    const errorMessages = props.errorMessages ?? defaultErrorMessages;

    useValidator<string>(
        LengthValidatorAsync.name,
        () => {
            return {
                shouldValidate: value => {
                    return value != null && value.length > 0;
                },
                validate: async (value: string): Promise<ValidationResultOrString[]> => {
                    await new Promise(resolve => setTimeout(resolve, props.wait));

                    if (value.length < min) {
                        return [errorMessages.tooShort];
                    }
                    if (max != null && value.length > max) {
                        return [errorMessages.tooLong];
                    }
                    return [];
                }
            };
        },
        [errorMessages.tooLong, errorMessages.tooShort, max, min, props.wait]
    );

    return null;
};
