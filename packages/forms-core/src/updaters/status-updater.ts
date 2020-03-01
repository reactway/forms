import { StatusUpdater, FieldStatus, FieldState, UpdateStoreHelpers, FieldSelector } from "../contracts";
import { assertFieldIsDefined } from "../helpers/generic";
import produce, { Patch } from "immer";

export function StatusUpdaterFactory(state: FieldState<any, any>, helpers: UpdateStoreHelpers): StatusUpdater {
    return {
        id: "status",
        updateFieldStatus: (fieldSelector, updater) => {
            const fieldState = helpers.selectField(fieldSelector);

            assertFieldIsDefined(fieldState, fieldSelector);

            const prevStatus = produce(fieldState.status, () => {});

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

            updater(fieldState.status);

            const statusChanged = (statusKey: keyof FieldStatus): boolean => {
                return statusPatches.find(x => x.path.includes(statusKey)) != null;
            };

            if (newStatus.touched && statusChanged("touched")) {
                updateDependentStatusUpwards(state, helpers, fieldSelector, status => {
                    status.touched = true;
                });
            }

            if (statusChanged("pristine")) {
                updateDependentStatusUpwards(state, helpers, fieldSelector, status => {
                    status.pristine = newStatus.pristine;
                });
            }

            if (statusChanged("readonly")) {
                updateDependentStatusDownwards(fieldState, status => {
                    status.readonly = newStatus.readonly;
                });
            }

            if (prevStatus === newStatus) {
                return;
            }

            // TODO: Recalculate all statuses
        }
    };
}

function updateDependentStatusDownwards(fieldState: FieldState<any, any>, updater: (status: FieldStatus) => void): void {
    // TODO: Review
    for (const key of Object.keys(fieldState.fields)) {
        const child = fieldState.fields[key];
        if (child == null) {
            continue;
        }
        updater(child.status);
        updateDependentStatusDownwards(child, updater);
    }
}

function updateDependentStatusUpwards(
    state: FieldState<any, any>,
    helpers: UpdateStoreHelpers,
    fieldSelector: FieldSelector,
    updater: (status: FieldStatus) => void
): void {
    const fieldState = helpers.selectField(fieldSelector);
    assertFieldIsDefined(fieldState, fieldSelector);

    // Update all parents (that have id) statuses.
    let parentId: FieldSelector | undefined = fieldSelector;
    while ((parentId = helpers.getFieldParentId(parentId)) != null) {
        const field = helpers.selectField(parentId);
        assertFieldIsDefined(field, fieldSelector);

        updater(field.status);
    }

    // Update form (upper-most) status too.
    updater(state.status);
}
