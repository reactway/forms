import {
    FieldState,
    UpdateStoreHelpers,
    ValidationUpdater,
    ValidationResult,
    ValidationResultType,
    ValidationResultOrigin,
    FieldValidator,
    ValidationResultOrString,
    CancellationToken,
    NestedDictionary,
    ValidatorHelpers
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
        },
        setFormErrors: errors => {
            setFormErrors(state, errors);
        }
    };
}

async function validateField(
    _draft: FieldState<any, any>,
    helpers: UpdateStoreHelpers,
    store: Store<FieldState<any, any>>,
    fieldId: string
): Promise<void> {
    const fieldState = helpers.selectField(fieldId);
    assertFieldIsDefined(fieldState, fieldId);

    if (fieldState.validation.currentValidation != null) {
        fieldState.validation.currentValidation.cancellationToken.cancel();
    }

    if (fieldState.validation.validators.length === 0) {
        return;
    }

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
    const cancellationToken = new CancellationTokenImpl(() => {
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

        const validatorResult = validator.validate(
            fieldValue,
            constructValidatorHelpers(ValidationResultOrigin.Validation, validator.name)
        );
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
        const validationResults = results.map(x => resolveValidationResult(x, validator.name));

        updateFieldAsync(fieldId, store, cancellationToken, state => {
            const mutableValidationResults = state.validation.results as ValidationResult[];
            mutableValidationResults.push(...validationResults);
        });
    }

    updateFieldAsync(fieldId, store, cancellationToken, state => {
        state.validation.currentValidation = undefined;
    });
}

export function constructValidatorHelpers(origin: ValidationResultOrigin.FormSubmit, validatorName?: string | undefined): ValidatorHelpers;
export function constructValidatorHelpers(
    origin: ValidationResultOrigin.Validation | ValidationResultOrigin.Unknown,
    validatorName: string
): ValidatorHelpers;
export function constructValidatorHelpers(origin: ValidationResultOrigin, validatorName: string | undefined): ValidatorHelpers {
    return {
        error: (message, code) => ({
            type: ValidationResultType.Error,
            message: message,
            code: code,
            origin: origin,
            validatorName: validatorName
        }),
        warning: (message, code) => ({
            type: ValidationResultType.Warning,
            message: message,
            code: code,
            origin: origin,
            validatorName: validatorName
        })
    };
}

function updateFieldAsync(
    fieldId: string,
    store: Store<FieldState<any, any>>,
    cancellationToken: CancellationToken,
    updater: (fieldState: FieldState<any, any>) => void
): void {
    // Check for cancellation right away.
    if (cancellationToken.cancellationRequested) {
        return;
    }
    setTimeout(() => {
        // Check for cancellation again at the start of asynchronous scope.
        if (cancellationToken.cancellationRequested) {
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

function setFormErrors(state: FieldState<any, any>, errors: NestedDictionary<ValidationResultOrString[]>): void {
    for (const key of Object.keys(errors)) {
        const fieldError = errors[key];

        const field = state.fields[key];

        if (field == null || fieldError == null) {
            continue;
        }

        if (typeof fieldError === "object" && !Array.isArray(fieldError)) {
            setFormErrors(field, fieldError);
            continue;
        }

        const validationResults: ValidationResult[] = [];
        for (const error of fieldError) {
            let validationResult: ValidationResult;
            if (typeof error !== "string") {
                validationResult = error;
            } else {
                validationResult = {
                    message: error,
                    type: ValidationResultType.Error,
                    origin: ValidationResultOrigin.FormSubmit
                };
            }
            validationResults.push(validationResult);
        }
        console.log("validationResults");
        console.log(validationResults);

        field.validation.results = validationResults;
    }
}
