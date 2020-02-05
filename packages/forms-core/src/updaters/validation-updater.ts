import {
    FieldState,
    UpdateStoreHelpers,
    ValidationUpdater,
    ValidationResult,
    ValidationResultType,
    ValidationResultOrigin
} from "../contracts";
import { assertFieldIsDefined, isPromise } from "../helpers";

export class ValidationUpdaterClass implements ValidationUpdater {
    public id: "validation" = "validation";

    public async validateField(state: FieldState<any>, helpers: UpdateStoreHelpers, fieldId: string): Promise<void> {
        await validateField(state, helpers, fieldId);
    }
}

async function validateField(_draft: FieldState<any, any>, helpers: UpdateStoreHelpers, fieldId: string): Promise<void> {
    const fieldState = helpers.selectField(fieldId);
    assertFieldIsDefined(fieldState, fieldId);

    const validators = fieldState.validation.validators;

    if (validators.length === 0) {
        return;
    }

    const fieldValue = fieldState.getValue(fieldState);

    // Indicate that the validation has started.
    const validationStarted = new Date();
    fieldState.validation.validationStarted = validationStarted;
    fieldState.validation.results = [];

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
            const mutableFieldResults = fieldState.validation.results as ValidationResult[];
            const validationResults = validatorResult.map(x => resolveValidationResult(x));
            mutableFieldResults.push(...validationResults);

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
    helpers: UpdateStoreHelpers,
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

    const mutableResults = fieldState.validation.results as ValidationResult[];
    mutableResults.push(...validationResults);

    if (validationFinished) {
        fieldState.validation.validationStarted = undefined;
    }
}
