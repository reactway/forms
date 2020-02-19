// These comments originated in the v4 codebase and are kept for historical purpose:
// https://github.com/SimplrJS/react-forms/blame/e8443591f215fbd3fa76898520c8490d5c6673b6/packages/simplr-forms/src/contracts/error.ts

// 2017-04-09 Future-self might love usage of an object with message property instead of a plain string.

export interface Validator<TValue> {
    name: string;
    validate: (value: TValue) => ValidatorResult;

    // E.g. only validate non-empty and non-null values.
    shouldValidate: (value: TValue) => boolean;
}

export interface ValidationResult {
    message: string;
    type: ValidationResultType;

    // 2017-05-08 Told you so.
    origin?: ValidationResultOrigin;
    validatorName?: string;
    code?: string;
}

export type ValidationResultOrString = ValidationResult | string;

export type ValidatorResult = Promise<ValidationResultOrString[]> | ValidationResultOrString[] | undefined;

export enum ValidationResultType {
    Error,
    Warning
}

export enum ValidationResultOrigin {
    Unknown = 0,
    Validation = 1,
    FormSubmit = 2
}

export interface CancellationToken {
    cancellationRequested: boolean;
    cancel: () => void;
}
