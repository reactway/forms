import { ValueUpdater, FieldState, UpdateStoreHelpers } from "../contracts";
import { assertFieldIsDefined } from "../helpers";

// export class ValueUpdaterClass implements ValueUpdater {
//     public id: "value" = "value";

//     constructor(protected state: FieldState<any>) {}

//     public updateFieldValue(helpers: UpdateStoreHelpers, fieldId: string, value: unknown): void {
//         const fieldState = helpers.selectField(fieldId);
//         assertFieldIsDefined(fieldState, fieldId);

//         // TODO: modifiers, validation...
//         fieldState.values.currentValue = value;

//         helpers.updateFieldStatus(fieldId, status => {
//             status.touched = true;
//             status.pristine = value === fieldState.values.initialValue;
//         });
//     }
// }

export function ValueUpdaterFactory(state: FieldState<any>, helpers: UpdateStoreHelpers): ValueUpdater {
    return {
        id: "value",
        updateFieldValue: (fieldId, value) => {
            const fieldState = helpers.selectField(fieldId);
            assertFieldIsDefined(fieldState, fieldId);

            // TODO: modifiers, validation...
            fieldState.values.currentValue = value;

            // helpers.updateFieldStatus(fieldId, status => {
            //     status.touched = true;
            //     status.pristine = value === fieldState.values.initialValue;
            // });
        }
    };
}
