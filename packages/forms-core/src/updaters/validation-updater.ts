import {
    FieldState,
    UpdateStoreHelpers,
    ValidationUpdater,
    ValidationResult,
    ValidationResultType,
    ValidationResultOrigin,
    FieldValidator,
    ValidationResultOrString,
    FieldValidation
} from "../contracts";
import { assertFieldIsDefined, isPromise } from "../helpers";
import shortid from "shortid";

export function ValidationUpdaterFactory(state: FieldState<any, any>, helpers: UpdateStoreHelpers): ValidationUpdater {
    return {
        id: "validation",
        validateField: async fieldId => {
            return validateField(state, helpers, fieldId);
        },
        registerValidator: (fieldId, validator) => {
            const fieldState = helpers.selectField(fieldId);
            assertFieldIsDefined(fieldState, fieldId);

            const id = shortid.generate();

            const mutableValidators = fieldState.validation.validators as FieldValidator<any>[];
            mutableValidators.push({
                ...validator,
                id: id
            });

            return id;
        },
        unregisterValidator: (fieldId, validatorId) => {
            const fieldState = helpers.selectField(fieldId);
            assertFieldIsDefined(fieldState, fieldId);

            const validatorIndex = fieldState.validation.validators.findIndex(x => x.id === validatorId);

            if (validatorIndex === -1) {
                // Gracefully return if the validator is not found, no need to throw.
                return;
            }

            const mutableValidators = fieldState.validation.validators as FieldValidator<any>[];
            mutableValidators.splice(validatorIndex, 1);
        }
    };
}

// TODO: Review the following implementation.

async function validateField(_draft: FieldState<any, any>, helpers: UpdateStoreHelpers, fieldId: string): Promise<void> {
    const fieldState = helpers.selectField(fieldId);
    assertFieldIsDefined(fieldState, fieldId);

    // Copy validators because we're in an asynchronous context
    // and their proxy into current state might be revoked by immer.
    const validators = [];
    for (const validator of fieldState.validation.validators) {
        validators.push({
            ...validator
        });
    }

    if (validators.length === 0) {
        return;
    }

    const fieldValue = fieldState.getValue(fieldState);

    // Indicate that the validation has started.
    const validationStarted = new Date();
    fieldState.validation.validationStarted = validationStarted;
    fieldState.validation.results = [];

    const previousValues = {
        value: fieldValue,
        validationStarted
    };

    let syncUpdates = true;
    let validationFinished = false;

    let validatorsProcessedCount = 0;
    for (const validator of validators) {
        validatorsProcessedCount += 1;
        if (!validator.shouldValidate(fieldValue)) {
            continue;
        }

        const validatorResult = validator.validate(fieldValue);

        if (validatorResult == null) {
            continue;
        }

        const lastValidator = validatorsProcessedCount === validators.length;

        // Gather results.
        let results: ValidationResultOrString[] | undefined = undefined;
        if (!isPromise(validatorResult)) {
            results = validatorResult;
        } else {
            // Promise has been encountered, thus remaining updates will have to be asynchronous.
            syncUpdates = false;

            try {
                const promiseResults = await validatorResult;

                if (promiseResults.length === 0) {
                    continue;
                }

                results = promiseResults;
            } catch (err) {
                console.error(err);
            }
        }

        if (results == null) {
            continue;
        }

        // Construct proper ValidationResults in case any strings are in results.
        const validationResults = results.map(x => resolveValidationResult(x));

        // TODO: Explain.
        validationFinished = lastValidator;

        updateState(
            updateFieldState => {
                pushValidationResults(updateFieldState.validation, validationResults, lastValidator);
            },
            syncUpdates,
            helpers,
            fieldId,
            previousValues
        );
    }

    if (validationFinished) {
        return;
    }

    updateState(
        updateFieldState => {
            updateFieldState.validation.validationStarted = undefined;
        },
        syncUpdates,
        helpers,
        fieldId,
        previousValues
    );
}

function updateState(
    updater: (fieldState: FieldState<any, any>, helpers: UpdateStoreHelpers) => void,
    syncUpdate: boolean,
    helpers: UpdateStoreHelpers,
    fieldId: string,
    previousValues: { value: any; validationStarted: Date }
): void {
    if (syncUpdate) {
        const fieldState = helpers.selectField(fieldId);
        assertFieldIsDefined(fieldState, fieldId);
        updater(fieldState, helpers);
    } else {
        helpers.enqueueUpdate((_, asyncHelpers) => {
            if (isValidationStale(asyncHelpers, fieldId, previousValues)) {
                return;
            }

            const fieldState = asyncHelpers.selectField(fieldId);
            if (fieldState == null) {
                return;
            }

            // All sanity checks passed.
            updater(fieldState, asyncHelpers);
        });
    }
}

function pushValidationResults(validation: FieldValidation<any>, validationResults: ValidationResult[], validationFinished: boolean): void {
    const mutableResults = validation.results as ValidationResult[];
    mutableResults.push(...validationResults);
    if (validationFinished) {
        validation.validationStarted = undefined;
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

function isValidationStale(
    helpers: UpdateStoreHelpers,
    fieldId: string,
    previousData: {
        value: any;
        validationStarted: Date;
    }
): boolean {
    const fieldState = helpers.selectField(fieldId);

    if (fieldState == null) {
        // Field has been unregistered or the fieldId is simply incorrect. Either way, there's nothing left to do.
        console.log("Field has been unregistered or the fieldId is simply incorrect. Either way, there's nothing left to do.");
        return true;
    }

    if (
        fieldState.validation.validationStarted == null ||
        fieldState.validation.validationStarted.getTime() !== previousData.validationStarted.getTime()
    ) {
        // Current validation has been canceled or new validation has already been started.
        console.log("Current validation has been canceled or new validation has already been started.");
        return true;
    }

    const fieldValue = fieldState.getValue(fieldState);
    if (fieldValue !== previousData.value) {
        // Value has changed since validation has started.
        console.log("Value has changed since validation has started.");
        return true;
    }

    return false;
}
