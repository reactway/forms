// These comments originated in the v4 codebase and are kept for historical purpose:
// https://github.com/SimplrJS/react-forms/blame/e8443591f215fbd3fa76898520c8490d5c6673b6/packages/simplr-forms/src/contracts/error.ts

// 2017-04-09 Future-self might love usage of an object with message property instead of a plain string.

export interface Validator<TValue> {
    validate: (value: TValue) => ValidationResult;

    // E.g. only validate non-empty and non-null values.
    shouldValidate: (value: TValue) => boolean;
}

export interface FieldError {
    message: string;
    // 2017-05-08 Told you so.
    origin?: FieldErrorOrigin;
}

export enum FieldErrorOrigin {
    None = 0,
    Validation = 1,
    Submit = 2
}

export type ValidationError<TTemplateFunc = (...args: any[]) => void> = string | FieldError | TTemplateFunc;

export type ValidationResult = Promise<void> | ValidationError | undefined;
