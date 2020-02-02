import { StateUpdater, FieldState } from "./field-state";
import { UpdateStoreHelpers } from "./store-helpers";

export const ValidationUpdater = "validation-updater" as const;
export interface ValidationUpdater<TValue> extends StateUpdater<typeof ValidationUpdater, TValue> {
    validateField(state: FieldState<any>, helpers: UpdateStoreHelpers, fieldId: string): Promise<void>;
}
