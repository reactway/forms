import { FieldState, Initial, Updater, FieldStatus, UpdatersFactories, UpdaterId } from "./field-state";
import { Store } from "..";

export interface StoreHelpers {
    selectField(fieldId: string): FieldState<any, any> | undefined;
    selectFieldParent(fieldId: string): FieldState<any, any> | undefined;
    getActiveFieldId(): string | undefined;
    getFieldParentId(fieldId: string): string | undefined;
    getFormValue(): {};
}

export type GetUpdaterReturnType<
    TUpdaterId extends string,
    TUpdater extends Updater<string>
> = undefined extends UpdatersFactories[TUpdaterId] ? TUpdater | undefined : TUpdater;

export interface UpdateStoreHelpers extends StoreHelpers {
    registerField<TFieldState extends FieldState<any, any>>(fieldId: string, initialFieldState: Initial<TFieldState>): void;
    unregisterField(fieldId: string): void;

    setActiveFieldId(fieldId: string | undefined): void;
    updateFieldStatus(fieldId: string, updater: (status: FieldStatus) => void): void;

    // TODO: Add registerUpdater.
    getUpdater<TUpdater extends Updater<string>>(updaterId: UpdaterId<TUpdater>): GetUpdaterReturnType<typeof updaterId, TUpdater>;

    enqueueUpdate: Store<FieldState<any, any>>["update"];
}
