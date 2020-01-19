import {
    FieldState,
    UpdateFieldStoreHelpers,
    assertFieldIsDefined,
    ValidationResult,
    ValidationResultType,
    ValidationResultOrString,
    ValidationResultOrigin
} from "@reactway/forms-core";
import { isPromise } from "./is";

function resolveValidationResult(value: string | ValidationResult): ValidationResult {
    if (typeof value !== "string") {
        return value;
    }
    return {
        message: value,
        type: ValidationResultType.Error,
        origin: ValidationResultOrigin.Validation
    };
}

function pushValidationResultsAsync(
    helpers: UpdateFieldStoreHelpers,
    fieldId: string,
    validationResults: ValidationResult[],
    currentData: {
        value: any;
        validationStarted: Date;
    },
    validationFinished: boolean
): void {
    const fieldState = helpers.selectField(fieldId);
    assertFieldIsDefined(fieldState, fieldId);

    if (
        fieldState.validation.validationStarted == null ||
        fieldState.validation.validationStarted.getTime() !== currentData.validationStarted.getTime()
    ) {
        throw new Error("New validation has already started.");
    }

    const fieldValue = fieldState.getValue(fieldState);
    if (fieldValue !== currentData.value) {
        throw new Error("Value has changed since validation has started.");
    }

    const modifiableResults = fieldState.validation.results as ValidationResult[];
    modifiableResults.push(...validationResults);

    if (validationFinished) {
        fieldState.validation.validationStarted = undefined;
    }
}

export async function validateField(draft: FieldState<any, any>, helpers: UpdateFieldStoreHelpers, fieldId: string): Promise<void> {
    const fieldState = helpers.selectField(fieldId);
    assertFieldIsDefined(fieldState, fieldId);

    const validators = fieldState.validation.validators;

    console.log("Total validators:", validators.length);

    if (validators.length === 0) {
        return;
    }

    const fieldValue = fieldState.getValue(fieldState);

    // Indicate that the validation has started.
    const validationStarted = new Date();
    fieldState.validation.validationStarted = validationStarted;
    fieldState.validation.results = [];

    console.log(Object.assign({}, fieldState));

    let validatorsCount = 0;
    for (const validator of validators) {
        validatorsCount++;
        const lastValidator = validatorsCount === validators.length;

        if (!validator.shouldValidate(fieldValue)) {
            continue;
        }
        const validatorResult = validator.validate(fieldValue);

        if (validatorResult == null) {
            continue;
        }

        if (!isPromise(validatorResult)) {
            const modifiableFieldResults = fieldState.validation.results as ValidationResult[];
            const validationResults = validatorResult.map(x => resolveValidationResult(x));
            modifiableFieldResults.push(...validationResults);

            if (lastValidator) {
                fieldState.validation.validationStarted = undefined;
            }
            continue;
        }

        try {
            const results = await validatorResult;

            if (results.length === 0) {
                continue;
            }

            const validationResults = results.map(x => resolveValidationResult(x));
            pushValidationResultsAsync(
                helpers,
                fieldId,
                validationResults,
                {
                    validationStarted,
                    value: fieldValue
                },
                lastValidator
            );
        } catch (err) {
            console.error(err);
        }
    }
}
