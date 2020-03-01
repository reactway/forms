import shortid from "shortid";
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
    ValidatorHelpers,
    Dictionary,
    FieldSelector
} from "../contracts";
import { assertFieldIsDefined, isPromise } from "../helpers/generic";
import { Store } from "../store";
import { CancellationTokenImpl } from "../helpers";

export function ValidationUpdaterFactory(
    helpers: UpdateStoreHelpers,
    state: FieldState<any, any>,
    store: Store<FieldState<any, any>>
): ValidationUpdater {
    return {
        id: "validation",
        validateField: async fieldSelector => {
            return validateField(state, helpers, store, fieldSelector);
        },
        registerValidator: (fieldSelector, validator) => {
            const fieldState = helpers.selectField(fieldSelector);
            assertFieldIsDefined(fieldState, fieldSelector);

            const id = shortid.generate();

            const mutableValidators = fieldState.validation.validators as Dictionary<FieldValidator<any>>;
            mutableValidators[id] = {
                ...validator,
                id: id
            };

            const mutableValidatorsOrder = fieldState.validation.validatorsOrder as string[];
            mutableValidatorsOrder.push(id);

            return id;
        },
        unregisterValidator: (fieldId, validatorId) => {
            const fieldState = helpers.selectField(fieldId);
            assertFieldIsDefined(fieldState, fieldId);

            if (fieldState.validation.validators[validatorId] == null) {
                // Gracefully return if the validator is not found, no need to throw.
                return;
            }

            const mutableValidators = fieldState.validation.validators as Dictionary<FieldValidator<any>>;

            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete mutableValidators[validatorId];

            const validatorOrderIndex = fieldState.validation.validatorsOrder.findIndex(x => x === validatorId);
            if (validatorOrderIndex === -1) {
                return;
            }

            const mutableValidatorsOrder = fieldState.validation.validatorsOrder as string[];
            mutableValidatorsOrder.splice(validatorOrderIndex, 1);
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
    fieldSelector: FieldSelector
): Promise<void> {
    const fieldState = helpers.selectField(fieldSelector);
    assertFieldIsDefined(fieldState, fieldSelector);

    if (fieldState.validation.currentValidation != null) {
        fieldState.validation.currentValidation.cancellationToken.cancel();
    }

    const validatorsKeys = Object.keys(fieldState.validation.validators);
    if (validatorsKeys.length === 0) {
        return;
    }

    // Copy validators because we're in an asynchronous context
    // and their proxy into current state might be revoked by immer.
    const validators = [];
    for (const validatorId of fieldState.validation.validatorsOrder) {
        const validator = fieldState.validation.validators[validatorId];

        if (validator == null) {
            // TODO: Should we throw if the validator is not found?
            continue;
        }

        validators.push({
            ...validator
        });
    }

    const fieldValue = fieldState.getValue(fieldState);

    // Indicate that the validation has started.
    const validationStarted = new Date();
    const cancellationToken = new CancellationTokenImpl(() => {
        store.update(asyncHelpers => {
            const asyncFieldState = asyncHelpers.selectField(fieldSelector);
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

        updateFieldAsync(fieldSelector, store, cancellationToken, state => {
            const mutableValidationResults = state.validation.results as ValidationResult[];
            mutableValidationResults.push(...validationResults);
        });
    }

    updateFieldAsync(fieldSelector, store, cancellationToken, state => {
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
    fieldSelector: FieldSelector,
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
        store.update(helpers => {
            const fieldState = helpers.selectField(fieldSelector);
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

        field.validation.results = validationResults;
    }
}
