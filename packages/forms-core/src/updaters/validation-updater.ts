import {
    FieldState,
    UpdateStoreHelpers,
    ValidationUpdater,
    ValidationResult,
    ValidationResultType,
    ValidationResultOrigin,
    FieldValidator,
    ValidationResultOrString,
    CancellationToken
} from "../contracts";
import { assertFieldIsDefined, isPromise } from "../helpers";
import shortid from "shortid";
import { Store } from "../store";
import { CancellationTokenImpl } from "../cancellation-token";

export function ValidationUpdaterFactory(
    state: FieldState<any, any>,
    helpers: UpdateStoreHelpers,
    store: Store<FieldState<any, any>>
): ValidationUpdater {
    return {
        id: "validation",
        validateField: async fieldId => {
            return validateField(state, helpers, store, fieldId);
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

let count = 0;
async function validateField(
    _draft: FieldState<any, any>,
    helpers: UpdateStoreHelpers,
    store: Store<FieldState<any, any>>,
    fieldId: string
): Promise<void> {
    const fieldState = helpers.selectField(fieldId);
    assertFieldIsDefined(fieldState, fieldId);

    console.group(`Validation for ${fieldId}`);
    console.log(fieldState.validation.currentValidation);
    if (fieldState.validation.currentValidation != null) {
        console.error(`Cancelling previous validation for ${fieldId}`);
        fieldState.validation.currentValidation.cancellationToken.cancel();
    }

    if (fieldState.validation.validators.length === 0) {
        return;
    }

    const validationNumber = ++count;

    console.log(`Running validation #${validationNumber}`);
    console.groupEnd();

    // Copy validators because we're in an asynchronous context
    // and their proxy into current state might be revoked by immer.
    const validators = [];
    for (const validator of fieldState.validation.validators) {
        validators.push({
            ...validator
        });
    }

    const fieldValue = fieldState.getValue(fieldState);

    // Indicate that the validation has started.
    const validationStarted = new Date();
    const cancellationToken = new CancellationTokenImpl(`${validationNumber} for ${fieldId}`, () => {
        store.update((_, asyncHelpers) => {
            const asyncFieldState = asyncHelpers.selectField(fieldId);
            if (asyncFieldState == null) {
                return;
            }

            const validation = asyncFieldState.validation;
            if (validation.currentValidation == null) {
                return;
            }

            // Start times are different, thus a new validation is already in progress.
            if (validation.currentValidation.started.getTime() !== validationStarted.getTime()) {
                return;
            }

            validation.currentValidation = undefined;
        });
    });

    // Set current validation and reset results synchronously
    // for other validations to not clutter the results and find the cancellation token.
    fieldState.validation.currentValidation = {
        started: validationStarted,
        cancellationToken: cancellationToken
    };
    fieldState.validation.results = [];

    for (const validator of validators) {
        if (!validator.shouldValidate(fieldValue)) {
            continue;
        }

        // Check for cancellation before executing possibly costy validate function.
        if (cancellationToken.cancellationRequested) {
            return;
        }

        const validatorResult = validator.validate(fieldValue);
        if (validatorResult == null) {
            continue;
        }

        // Gather results.
        let results: ValidationResultOrString[] | undefined = undefined;
        if (!isPromise(validatorResult)) {
            results = validatorResult;
        } else {
            results = await validatorResult;
        }

        if (results.length === 0) {
            continue;
        }

        // Construct proper ValidationResults in case any strings are in results.
        let validationResults = results.map(x => resolveValidationResult(x, validator.name));

        validationResults = validationResults.map(x => {
            x.message += ` #${validationNumber}`;
            return x;
        });

        updateFieldAsync(fieldId, store, cancellationToken, state => {
            const mutableValidationResults = state.validation.results as ValidationResult[];
            mutableValidationResults.push(...validationResults);
        });
    }

    updateFieldAsync(fieldId, store, cancellationToken, state => {
        state.validation.currentValidation = undefined;
    });
}

function updateFieldAsync(
    fieldId: string,
    store: Store<FieldState<any, any>>,
    cancellationToken: CancellationToken,
    updater: (fieldState: FieldState<any, any>) => void
): void {
    // Check for cancellation right away.
    if (cancellationToken.cancellationRequested) {
        console.log("Cancelled.");
        return;
    }
    setTimeout(() => {
        // Check for cancellation at the start of asynchronous scope.
        if (cancellationToken.cancellationRequested) {
            console.log("Cancelled in async context.");
            return;
        }
        store.update((_, helpers) => {
            const fieldState = helpers.selectField(fieldId);
            if (fieldState == null) {
                return;
            }

            updater(fieldState);
        });
    }, 0);
}

function resolveValidationResult(value: string | ValidationResult, validatorName: string | undefined): ValidationResult {
    if (typeof value !== "string") {
        return value;
    }
    return {
        message: value,
        validatorName: validatorName,
        type: ValidationResultType.Error,
        origin: ValidationResultOrigin.Validation
    };
}
