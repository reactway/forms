import { FieldStatus, StoreUpdater } from "./field-state";
import { Validator, ValidationResultOrString } from "./validation";
import { Modifier } from "./modifiers";
import { NestedDictionary } from "./type-helpers";

export const ValueUpdater = "value" as const;
export interface ValueUpdater extends StoreUpdater<typeof ValueUpdater> {
    updateFieldValue(fieldId: string, value: any): void;
    resetFieldValue(fieldId: string): void;
    clearFieldValue(fieldId: string): void;
    registerModifier(fieldId: string, modifier: Modifier<any, any>): string;
    unregisterModifier(fieldId: string, modifierId: string): void;
}

export const StatusUpdater = "status" as const;
export interface StatusUpdater extends StoreUpdater<typeof StatusUpdater> {
    updateFieldStatus(fieldId: string, updater: (status: FieldStatus) => void): void;
}

export const ValidationUpdater = "validation" as const;
export interface ValidationUpdater extends StoreUpdater<typeof ValidationUpdater> {
    registerValidator(fieldId: string, validator: Validator<any>): string;
    unregisterValidator(fieldId: string, validatorId: string): void;
    validateField(fieldId: string): Promise<void>;
    setFormErrors(errors: NestedDictionary<ValidationResultOrString[]>): void;
}
