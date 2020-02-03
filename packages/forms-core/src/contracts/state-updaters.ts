import { StateUpdater, FieldState } from "./field-state";
import { UpdateStoreHelpers } from "./store-helpers";

export const ValueUpdater = "value" as const;
export interface ValueUpdater<TValue> extends StateUpdater<typeof ValueUpdater, TValue> {
    updateFieldValue(state: FieldState<any>, helpers: UpdateStoreHelpers, fieldId: string, value: TValue): void;
}

export const ValidationUpdater = "validation" as const;
export interface ValidationUpdater<TValue> extends StateUpdater<typeof ValidationUpdater, TValue> {
    validateField(state: FieldState<any>, helpers: UpdateStoreHelpers, fieldId: string): Promise<void>;
}
