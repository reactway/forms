import { FieldStatus, Updater, TextSelection } from "./field-state";
import { Validator, ValidationResultOrString } from "./validation";
import { Modifier } from "./modifiers";
import { NestedDictionary } from "./type-helpers";
import { FieldSelector } from "./store-helpers";

export const ValueUpdater = "value" as const;
export interface ValueUpdater extends Updater<typeof ValueUpdater> {
    updateFieldValue(fieldSelector: FieldSelector, value: any, selection?: TextSelection): void;
    resetFieldValue(fieldSelector: FieldSelector): void;
    clearFieldValue(fieldSelector: FieldSelector): void;
    registerModifier<TValue, TRenderValue>(fieldSelector: FieldSelector, modifier: Modifier<TValue, TRenderValue>): string;
    unregisterModifier(fieldSelector: FieldSelector, modifierId: string): void;
}

export const StatusUpdater = "status" as const;
export interface StatusUpdater extends Updater<typeof StatusUpdater> {
    updateFieldStatus(fieldSelector: FieldSelector, updater: (status: FieldStatus) => void): void;
}

export const ValidationUpdater = "validation" as const;
export interface ValidationUpdater extends Updater<typeof ValidationUpdater> {
    registerValidator<TValue>(fieldSelector: FieldSelector, validator: Validator<TValue>): string;
    unregisterValidator(fieldSelector: FieldSelector, validatorId: string): void;
    validateField(fieldSelector: FieldSelector): Promise<void>;
    setFormErrors(errors: NestedDictionary<ValidationResultOrString[]>): void;
}
