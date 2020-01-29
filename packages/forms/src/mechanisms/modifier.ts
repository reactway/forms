import {
    ModifierMechanism,
    InputFieldState,
    InputFieldData,
    UpdateFieldStoreHelpers,
    assertFieldIsDefined,
    ParseResult,
    FieldStoreHelpers,
    FieldState
} from "@reactway/forms-core";
import { isInputFieldState } from "../helpers/is";

export class ModifierMechanismImplementation<TValue, TRenderValue> implements ModifierMechanism<TValue, TRenderValue> {
    public id: "field-modifier" = "field-modifier";

    public parse(
        state: InputFieldState<InputFieldData<unknown, unknown>>,
        helpers: UpdateFieldStoreHelpers,
        fieldId: string,
        nextValue: TValue
    ): void {
        const fieldState = helpers.selectField(fieldId) as any;
        assertFieldIsDefined(fieldState, fieldId);

        if (!isInputFieldState(fieldState) || fieldState.data.modifiers.length === 0) {
            return;
        }

        const result: ParseResult<TValue, TRenderValue> = {
            currentValue: fieldState.data.currentValue
        };

        for (const modifier of fieldState.data.modifiers) {
            const parseResult = modifier.parse(nextValue);
            result.currentValue = parseResult.currentValue;

            // Only populate the transientValue of the result if it's still null.
            // First transientValue wins principle.
            if (result.transientValue == null && parseResult.transientValue != null) {
                result.transientValue = parseResult.transientValue;
            }
        }

        fieldState.data.currentValue = result.currentValue;
        fieldState.data.transientValue = result.transientValue;
    }

    public format(state: FieldState<any, any>, helpers: FieldStoreHelpers, fieldId: string): TRenderValue {
        const fieldState = helpers.selectField(fieldId) as any;
        assertFieldIsDefined(fieldState, fieldId);

        if (!isInputFieldState(fieldState) || fieldState.data.modifiers.length === 0) {
            throw new Error("Modifiers are only supported for input fields.");
        }

        let currentValue = fieldState.data.currentValue;
        for (const modifier of fieldState.data.modifiers) {
            currentValue = modifier.format(currentValue);
        }
        return currentValue;
    }
}
