import { FieldState, Initial, StoreUpdater, FieldStatus } from "./field-state";

export interface StoreHelpers {
    selectField(fieldId: string): FieldState<any> | undefined;
    selectFieldParent(fieldId: string): FieldState<any> | undefined;
    getActiveFieldId(): string | undefined;
    getFieldParentId(fieldId: string): string | undefined;
}

export interface UpdateStoreHelpers extends StoreHelpers {
    registerField<TFieldState extends FieldState<any, any>>(fieldId: string, initialFieldState: Initial<TFieldState>): void;
    unregisterField(fieldId: string): void;

    setActiveFieldId(fieldId: string | undefined): void;
    updateFieldStatus(fieldId: string, updater: (status: FieldStatus) => void): void;

    // TODO: Add registerUpdater.
    getUpdater<TUpdater extends StoreUpdater<string>>(
        updaterId: TUpdater extends StoreUpdater<infer TId> ? TId : never
    ): TUpdater | undefined;
}
