import { FieldStatus, StoreUpdater } from "./field-state";

export const ValueUpdater = "value" as const;
export interface ValueUpdater extends StoreUpdater<typeof ValueUpdater> {
    updateFieldValue(fieldId: string, value: any): void;
    resetFieldValue(fieldId: string): void;
    clearFieldValue(fieldId: string): void;
}

export const StatusUpdater = "status" as const;
export interface StatusUpdater extends StoreUpdater<typeof StatusUpdater> {
    updateFieldStatus(fieldId: string, updater: (status: FieldStatus) => void): void;
}

export const ValidationUpdater = "validation" as const;
export interface ValidationUpdater extends StoreUpdater<typeof ValidationUpdater> {
    validateField(fieldId: string): Promise<void>;
}
