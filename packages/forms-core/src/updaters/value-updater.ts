import { ValueUpdater, FieldState, UpdateStoreHelpers } from "../contracts";
import { assertFieldIsDefined, isInputValues } from "../helpers";

// export class ValueUpdaterClass implements ValueUpdater {
//     public id: "value" = "value";

//     constructor(protected state: FieldState<any, any>) {}

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

export function ValueUpdaterFactory(state: FieldState<any, any>, helpers: UpdateStoreHelpers): ValueUpdater {
    const valueUpdater: ValueUpdater = {
        id: "value",
        updateFieldValue: (fieldId, value) => {
            const fieldState = helpers.selectField(fieldId);
            assertFieldIsDefined(fieldState, fieldId);

            if (!isInputValues(fieldState.data)) {
                throw new Error("Not implemented.");
            }

            fieldState.data.currentValue = value;
            // TODO: modifiers, validation...

            helpers.updateFieldStatus(fieldId, status => {
                status.touched = true;
                status.pristine = value === fieldState.data.initialValue;
            });
        },
        resetFieldValue: fieldId => {
            throw new Error("Not implemented.");
            // const fieldState = helpers.selectField(fieldId);
            // assertFieldIsDefined(fieldState, fieldId);

            // if (!isInputValues(fieldState.data)) {
            //     throw new Error("Not implemented.");
            // }
            // valueUpdater.updateFieldValue(fieldId, fieldState.data.initialValue);
        },
        clearFieldValue: fieldId => {
            throw new Error("Not implemented.");
            // const fieldState = helpers.selectField(fieldId);
            // assertFieldIsDefined(fieldState, fieldId);

            // if (!isInputValues(fieldState.data)) {
            //     throw new Error("Not implemented.");
            // }
            // valueUpdater.updateFieldValue(fieldId, fieldState.data.defaultValue);
        }
    };

    return valueUpdater;
}
