import { ValidationResultOrString } from "@reactway/forms-core";
import { useValidator } from "@reactway/forms";

export type UsernameValidatorProps = {
    error: string;
    takenUsernames?: string[];
    wait: number;
};

export const UsernameValidator = (props: UsernameValidatorProps): null => {
    const { error, takenUsernames } = props;

    useValidator<string>(() => {
        return {
            shouldValidate: value => {
                return value != null && value.length > 0;
            },
            validate: async (value: string): Promise<ValidationResultOrString[]> => {
                console.log("Making request...");
                await new Promise(resolve => setTimeout(resolve, props.wait));

                if (takenUsernames == null) {
                    return [];
                }

                if (takenUsernames.includes(value.toLowerCase())) {
                    return [error];
                }

                return [];
            }
        };
    }, [error, props.wait, takenUsernames]);

    return null;
};
