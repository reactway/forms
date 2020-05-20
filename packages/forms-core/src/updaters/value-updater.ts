import shortid from "shortid";
import { ValueUpdater, UpdateStoreHelpers, FieldModifier, Dictionary, TextSelection, ParseValue } from "../contracts";
import { assertFieldIsDefined, isInputFieldData } from "../helpers/generic";
import { formsLogger } from "../logger";

const logger = formsLogger.extend("value-updater");

export function ValueUpdaterFactory(helpers: UpdateStoreHelpers): ValueUpdater {
    const valueUpdater: ValueUpdater = {
        id: "value",
        updateFieldValue: (fieldId, value, selection?: TextSelection) => {
            const fieldState = helpers.selectField(fieldId);
            assertFieldIsDefined(fieldState, fieldId);

            if (!isInputFieldData(fieldState.data)) {
                // TODO: Review
                throw new Error("Not implemented.");
            }

            fieldState.validation.results = [];

            const modifiers = fieldState.data.modifiers;
            const modifiersKeys = Object.keys(modifiers);
            if (modifiersKeys.length === 0) {
                // No modifiers found, thus a value is set directly to currentValue.
                fieldState.data.currentValue = value;
                fieldState.data.selection = selection;

                helpers.updateFieldStatus(fieldId, status => {
                    status.touched = true;
                    status.pristine = value === fieldState.data.initialValue;
                });
                return;
            }

            // Modifiers found, firing up the modifiers mechanism.
            const previousParseValue: ParseValue<any> = {
                value: fieldState.data.transientValue ?? fieldState.data.currentValue,
                caretPosition: fieldState.data.selection?.selectionStart
            };

            let newValue = value;
            let transientValue: unknown | undefined = undefined;

            let newCaretPosition: number | undefined = selection?.selectionStart;

            for (const modifierKey of modifiersKeys) {
                const modifier = modifiers[modifierKey];

                if (modifier == null) {
                    throw new Error("Should never happen.");
                }

                const newParseValue: ParseValue<any> = {
                    value: newValue,
                    caretPosition: newCaretPosition
                };

                const result = modifier.parse(newParseValue, previousParseValue);
                newValue = result.currentValue;

                // If modifier returned selection
                if (result.caretPosition != null) {
                    // It becomes our newSelection.
                    newCaretPosition = result.caretPosition;
                }

                // If transientValue was is null or was already set before
                if (transientValue != null || result.transientValue == null) {
                    // Do nothing.
                    continue;
                }

                // When first transientValue is encountered, it wins until it is resolved.
                transientValue = result.transientValue;
            }

            let newSelection: TextSelection | undefined = undefined;

            if (newCaretPosition != null) {
                newSelection = {
                    selectionStart: newCaretPosition,
                    selectionEnd: newCaretPosition,
                    selectionDirection: "none"
                };
            }

            fieldState.data.currentValue = newValue;
            fieldState.data.transientValue = transientValue;
            logger("Setting new selection to:", Object.assign({}, newSelection));
            fieldState.data.selection = newSelection;
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
            if (fieldState == null) {
                return;
            }

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
