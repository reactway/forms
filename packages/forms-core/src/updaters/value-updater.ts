import { ValueUpdater, FieldState, UpdateStoreHelpers, FieldModifier, Dictionary } from "../contracts";
import { assertFieldIsDefined, isInputFieldData } from "../helpers/generic";
import shortid from "shortid";

export function ValueUpdaterFactory(helpers: UpdateStoreHelpers, _state: FieldState<any, any>): ValueUpdater {
    const valueUpdater: ValueUpdater = {
        id: "value",
        updateFieldValue: (fieldId, value) => {
            const fieldState = helpers.selectField(fieldId);
            assertFieldIsDefined(fieldState, fieldId);

            if (!isInputFieldData(fieldState.data)) {
                // TODO: Review
                throw new Error("Not implemented.");
            }

            const modifiers = fieldState.data.modifiers;

            const modifiersKeys = Object.keys(modifiers);
            if (modifiersKeys.length === 0) {
                // No modifiers found, thus a value is set directly to currentValue.
                fieldState.data.currentValue = value;

                helpers.updateFieldStatus(fieldId, status => {
                    status.touched = true;
                    status.pristine = value === fieldState.data.initialValue;
                });
                return;
            }

            let newValue = value;
            let transientValue: unknown | undefined = undefined;

            for (const modifierKey of modifiersKeys) {
                const modifier = modifiers[modifierKey];

                if (modifier == null) {
                    throw new Error("Should never happen");
                }

                const result = modifier.parse(newValue);
                newValue = result.currentValue;

                if (transientValue != null || result.transientValue == null) {
                    continue;
                }

                // When first transientValue is encountered, it wins until it is resolved.
                transientValue = result.transientValue;
            }

            fieldState.data.currentValue = newValue;
            fieldState.data.transientValue = transientValue;
        },
        resetFieldValue: fieldId => {
            const fieldState = helpers.selectField(fieldId);
            assertFieldIsDefined(fieldState, fieldId);

            if (!isInputFieldData(fieldState.data)) {
                throw new Error("Only input field can be reset.");
            }

            valueUpdater.updateFieldValue(fieldId, fieldState.data.initialValue);
        },
        clearFieldValue: fieldId => {
            const fieldState = helpers.selectField(fieldId);
            assertFieldIsDefined(fieldState, fieldId);

            if (!isInputFieldData(fieldState.data)) {
                throw new Error("Only input field can be cleared.");
            }

            valueUpdater.updateFieldValue(fieldId, fieldState.data.defaultValue);
        },
        registerModifier: (fieldId, modifier) => {
            const fieldState = helpers.selectField(fieldId);
            assertFieldIsDefined(fieldState, fieldId);

            if (!isInputFieldData(fieldState.data)) {
                throw new Error("Not implemented.");
            }

            const id = shortid.generate();

            const modifiers = fieldState.data.modifiers;

            const mutableModifiers = modifiers as Dictionary<FieldModifier<any, any>>;
            mutableModifiers[id] = {
                ...modifier,
                id
            };

            return id;
        },
        unregisterModifier: (fieldId, modifierId) => {
            const fieldState = helpers.selectField(fieldId);
            assertFieldIsDefined(fieldState, fieldId);

            if (!isInputFieldData(fieldState.data)) {
                throw new Error("Not implemented.");
            }

            const modifiers = fieldState.data.modifiers;

            if (modifiers[modifierId] == null) {
                // Gracefully return if the modifier is not found, no need to throw.
                return;
            }

            const modifierOrderIndex = fieldState.data.modifiersOrder.findIndex(x => x === modifierId);

            if (modifierOrderIndex === -1) {
                return;
            }

            const mutableModifiersOrder = fieldState.data.modifiersOrder as string[];
            mutableModifiersOrder.splice(modifierOrderIndex, 1);
        }
    };

    return valueUpdater;
}
