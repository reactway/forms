import { FieldState, Initial, FieldStatus, StateUpdater } from "./field-state";

export interface StoreHelpers {
    selectField(fieldId: string): FieldState<any> | undefined;
    selectFieldParent(fieldId: string): FieldState<any> | undefined;
}

export interface UpdateStoreHelpers extends StoreHelpers {
    registerField<TFieldState extends FieldState<any, any>>(fieldId: string, initialFieldState: Initial<TFieldState>): void;
    unregisterField(id: string): void;

    updateFieldStatus(fieldId: string, updater: (status: FieldStatus) => void): void;

    // TODO: Add registerUpdater.
    getUpdater<TUpdater extends StateUpdater<string>>(
        updaterId: TUpdater extends StateUpdater<infer TId> ? TId : never
    ): TUpdater | undefined;
}
