import { FieldState, Initial, FieldStatus } from "./field-state";

export interface StoreHelpers {
    selectField(fieldId: string): FieldState<any> | undefined;
}

export interface UpdateStoreHelpers extends StoreHelpers {
    registerField<TFieldState extends FieldState<any, any>>(id: string, initialFieldState: Initial<TFieldState>): void;
    unregisterField(id: string): void;

    updateFieldStatus(fieldId: string, updater: (status: FieldStatus) => void): void;
}
