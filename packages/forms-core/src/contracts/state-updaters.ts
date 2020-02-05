import { StateUpdater, FieldState, FieldStatus } from "./field-state";
import { UpdateStoreHelpers } from "./store-helpers";

export const ValueUpdater = "value" as const;
export interface ValueUpdater<TValue> extends StateUpdater<typeof ValueUpdater, TValue> {
    updateFieldValue(state: FieldState<any>, helpers: UpdateStoreHelpers, fieldId: string, value: TValue): void;
}

export const StatusUpdater = "status" as const;
export interface StatusUpdater extends StateUpdater<typeof StatusUpdater> {
    updateFieldStatus(state: FieldState<any>, helpers: UpdateStoreHelpers, fieldId: string, updater: (status: FieldStatus) => void): void;
}

export const ValidationUpdater = "validation" as const;
export interface ValidationUpdater extends StateUpdater<typeof ValidationUpdater> {
    validateField(state: FieldState<any>, helpers: UpdateStoreHelpers, fieldId: string): Promise<void>;
}
