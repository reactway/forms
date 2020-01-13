import { FieldState, FieldStoreHelpers, assertFieldIsDefined, ValidationResult, ValidationResultType } from "@reactway/forms-core";
import { isPromise } from "./is";

function getValidationResult(value: string | ValidationResult): ValidationResult {
    if (typeof value === "string") {
        return {
            message: value,
            type: ValidationResultType.Error
        };
    }
    return value;
}

export async function validateField<TFieldState extends FieldState<any, any>>(
    draft: FieldState<any, any>,
    helpers: FieldStoreHelpers,
    fieldId: string
): Promise<void> {
    {
        const fieldState = helpers.selectField(fieldId);
        assertFieldIsDefined(fieldState, fieldId);

        const validators = fieldState.validation.validators;

        if (validators.length === 0) {
            return;
        }

        const results: ValidationResult[] = [];
        const fieldValue = fieldState.getValue(fieldState);

        // Indicate that the validation has started.
        fieldState.validation.validationStarted = new Date();

        for (const validator of validators) {
            if (!validator.shouldValidate(fieldValue)) {
                continue;
            }
            let validatorResult = validator.validate(fieldValue);

            if (validatorResult == null) {
                continue;
            }

            if (isPromise(validatorResult)) {
                try {
                    await validatorResult;
                    continue;
                } catch (err) {
                    // Using errors we cannot enforce types...
                    validatorResult = err;
                }
                // TODO: This shouldn't be here.
                continue;
            }

            if (!Array.isArray(validatorResult)) {
                results.push(getValidationResult(validatorResult));
                continue;
            }

            for (const value of validatorResult) {
                results.push(getValidationResult(value));
            }
        }

        // Set results and indicate that validation has finished.
        fieldState.validation.results = results;
        fieldState.validation.validationStarted = undefined;
    }
}
