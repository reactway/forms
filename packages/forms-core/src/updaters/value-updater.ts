import { ValueUpdater, FieldState, UpdateStoreHelpers, FieldModifier } from "../contracts";
import { assertFieldIsDefined, isInputFieldData } from "../helpers";
import shortid from "shortid";

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

            if (!isInputFieldData(fieldState.data)) {
                throw new Error("Not implemented.");
            }

            const modifiers = fieldState.data.modifiers;

            if (modifiers.length === 0) {
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

            for (const modifier of modifiers) {
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

            const mutableModifiers = modifiers as FieldModifier<any, any>[];
            mutableModifiers.push({
                ...modifier,
                id
            });

            return id;
        },
        unregisterModifier: (fieldId, modifierId) => {
            const fieldState = helpers.selectField(fieldId);
            assertFieldIsDefined(fieldState, fieldId);

            if (!isInputFieldData(fieldState.data)) {
                throw new Error("Not implemented.");
            }

            const modifiers = fieldState.data.modifiers;

            const modifierIndex = modifiers.findIndex(x => x.id === modifierId);

            if (modifierIndex === -1) {
                // Gracefully return if the modifier is not found, no need to throw.
                return;
            }

            const mutableValidators = modifiers as FieldModifier<any, any>[];
            mutableValidators.splice(modifierIndex, 1);
        }
    };

    return valueUpdater;
}
