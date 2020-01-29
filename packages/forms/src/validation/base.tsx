import { Validator } from "@reactway/forms-core";
import { useValidator } from "../use-validator";

export interface BaseValidatorProps<TValue> {
    validator: Validator<TValue>;
}

export const BaseValidator = <TValue,>(props: BaseValidatorProps<TValue>): null => {
    useValidator<TValue>(props.validator);
    return null;
};
