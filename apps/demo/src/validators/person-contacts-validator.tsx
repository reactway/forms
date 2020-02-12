import { ValidatorResult } from "@reactway/forms-core";
import { useValidator } from "@reactway/forms";

export const PersonContactsValidator = (): null => {
    useValidator<string>(
        PersonContactsValidator.name,
        () => {
            return {
                validate: (value: any): ValidatorResult => {
                    const defaultValue = "+3706";
                    if (value?.primaryPhone !== defaultValue || value?.secondaryPhone !== defaultValue) {
                        return [];
                    }

                    return ["Enter on primary or secondary phone."];
                }
            };
        },
        []
    );

    return null;
};
