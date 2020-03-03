import { Validator as ValidatorInterface, PartialKeys } from "@reactway/forms-core";
import { useValidator } from "@reactway/forms";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ValidatorProps<TValue> extends PartialKeys<ValidatorInterface<TValue>, "shouldValidate" | "name"> {}

export const Validator = <TValue,>(props: ValidatorProps<TValue>): null => {
    const { validate, name, shouldValidate } = props;

    useValidator<TValue>(
        name ?? Validator.name,
        () => {
            return {
                shouldValidate: shouldValidate,
                validate: validate
            };
        },
        [shouldValidate, validate]
    );
    return null;
};
