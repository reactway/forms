import { FieldState, Initial, Updater, FieldStatus, UpdatersFactories, UpdaterId } from "./field-state";
import { FormSelector } from "../constants";
import { Store } from "..";

export type FieldSelector = string | typeof FormSelector;

export interface StoreHelpers {
    selectField(fieldSelector: FieldSelector): FieldState<any, any> | undefined;
    selectFieldParent(fieldSelector: FieldSelector): FieldState<any, any> | undefined;
    getActiveFieldId(): string | undefined;
    getFieldParentId(fieldSelector: FieldSelector): FieldSelector | undefined;
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
    updateFieldStatus(fieldSelector: FieldSelector, updater: (status: FieldStatus) => void): void;

    getUpdater<TUpdater extends Updater<string>>(updaterId: UpdaterId<TUpdater>): GetUpdaterReturnType<typeof updaterId, TUpdater>;

    enqueueUpdate: Store<FieldState<any, any>>["update"];
}
