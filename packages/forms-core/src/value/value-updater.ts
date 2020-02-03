import { ValueUpdater, FieldState, UpdateStoreHelpers } from "../contracts";
import { assertFieldIsDefined } from "../helpers";

export class ValueUpdaterClass<TValue> implements ValueUpdater<TValue> {
    public id: "value" = "value";
    public updateFieldValue(state: FieldState<any>, helpers: UpdateStoreHelpers, fieldId: string, value: TValue): void {
        const fieldState = helpers.selectField(fieldId);
        assertFieldIsDefined(fieldState, fieldId);

        // TODO: modifiers, validation...
        fieldState.values.currentValue = value;

        helpers.updateFieldStatus(fieldId, status => {
            status.touched = true;
            status.pristine = value !== fieldState.values.initialValue;
        });
    }
}
