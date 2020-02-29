import { FieldStatus, Updater } from "./field-state";
import { Validator, ValidationResultOrString } from "./validation";
import { Modifier } from "./modifiers";
import { NestedDictionary } from "./type-helpers";

export const ValueUpdater = "value" as const;
export interface ValueUpdater extends Updater<typeof ValueUpdater> {
    updateFieldValue(fieldId: string, value: any): void;
    resetFieldValue(fieldId: string): void;
    clearFieldValue(fieldId: string): void;
    registerModifier<TValue, TRenderValue>(fieldId: string, modifier: Modifier<TValue, TRenderValue>): string;
    unregisterModifier(fieldId: string, modifierId: string): void;
}

export const StatusUpdater = "status" as const;
export interface StatusUpdater extends Updater<typeof StatusUpdater> {
    updateFieldStatus(fieldId: string, updater: (status: FieldStatus) => void): void;
}

export const ValidationUpdater = "validation" as const;
export interface ValidationUpdater extends Updater<typeof ValidationUpdater> {
    registerValidator<TValue>(fieldId: string, validator: Validator<TValue>): string;
    unregisterValidator(fieldId: string, validatorId: string): void;
    validateField(fieldId: string): Promise<void>;
    setFormErrors(errors: NestedDictionary<ValidationResultOrString[]>): void;
}
