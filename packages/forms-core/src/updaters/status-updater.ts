import { StatusUpdater, FieldStatus, FieldState, UpdateStoreHelpers } from "../contracts";
import { assertFieldIsDefined } from "../helpers";
import produce, { Patch } from "immer";

export class StatusUpdaterClass implements StatusUpdater {
    public id: "status" = "status";
    public updateFieldStatus(
        state: FieldState<any>,
        helpers: UpdateStoreHelpers,
        fieldId: string,
        updater: (status: FieldStatus) => void
    ): void {
        const fieldState = helpers.selectField(fieldId);

        assertFieldIsDefined(fieldState, fieldId);

        const prevStatus = fieldState.status;

        let statusPatches: Patch[];
        const newStatus = produce(
            prevStatus,
            status => {
                updater(status);
            },
            patches => {
                statusPatches = patches;
            }
        );

        const statusChanged = (statusKey: keyof FieldStatus): boolean => {
            return statusPatches.find(x => x.path.includes(statusKey)) != null;
        };

        if (statusChanged("touched")) {
            this.updateDependentStatusDownwards(fieldState, status => {
                status.touched = true;
            });
        }

        if (prevStatus === newStatus) {
            return;
        }

        // TODO: Recalculate all statuses
    }

    // function updateFieldStatus(state: Draft<FieldState<any>>, fieldId: string, updater: (status: FieldStatus) => void): void {

    // }

    protected updateDependentStatusDownwards(fieldState: FieldState<any>, updater: (status: FieldStatus) => void): void {
        updater(fieldState.status);
        for (const key of Object.keys(fieldState.fields)) {
            const child = fieldState.fields[key];
            if (child == null) {
                continue;
            }
            this.updateDependentStatusDownwards(child, updater);
        }
    }

    protected updateDependentStatusUpwards(
        state: FieldState<any>,
        helpers: UpdateStoreHelpers,
        fieldId: string,
        updater: (status: FieldStatus) => void
    ): void {
        const fieldState = helpers.selectField(fieldId);
        assertFieldIsDefined(fieldState, fieldId);

        updater(fieldState.status);

        
    }
}
