import { ValidationResultOrString } from "@reactway/forms-core";
import { useValidator } from "@reactway/forms";
import { useState } from "react";

export type UsernameValidatorProps = {
    error: string;
    takenUsernames?: string[];
    wait: number;
};

let count = 0;
export const UsernameValidator = (props: UsernameValidatorProps): null => {
    const { error, takenUsernames } = props;

    const [name] = useState<string>(UsernameValidator.name + ++count);

    useValidator<string>(
        name,
        () => {
            return {
                shouldValidate: value => {
                    return value != null && value.length > 0;
                },
                validate: async (value: string): Promise<ValidationResultOrString[]> => {
                    // eslint-disable-next-line no-console
                    // console.log("Making request...");
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
        },
        [error, props.wait, takenUsernames]
    );

    return null;
};
