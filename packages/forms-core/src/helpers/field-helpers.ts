import {
    FieldHelpers,
    ValidationUpdater,
    ValidatorsFieldHelpers,
    ModifiersFieldHelpers,
    InputFieldHelpers,
    ValueUpdater
} from "../contracts";

type ValidationOrderGuard = Pick<ValidatorsFieldHelpers, "reportValidatorIndex">;
type ModifiersOrderGuard = Pick<ModifiersFieldHelpers, "reportModifierIndex">;

export function constructFieldHelpers(fieldId: string, orderGuards: ValidationOrderGuard): FieldHelpers {
    return {
        registerValidator: validator => registerHelpers => {
            const validationUpdater = registerHelpers.getUpdater<ValidationUpdater>("validation");
            return validationUpdater.registerValidator(fieldId, validator);
        },
        unregisterValidator: validator => unregisterHelpers => {
            const validationUpdater = unregisterHelpers.getUpdater<ValidationUpdater>("validation");
            validationUpdater.unregisterValidator(fieldId, validator);
        },
        reportValidatorIndex: orderGuards.reportValidatorIndex
    };
}

export function constructInputFieldHelpers(fieldId: string, orderGuards: ValidationOrderGuard & ModifiersOrderGuard): InputFieldHelpers {
    return {
        ...constructFieldHelpers(fieldId, orderGuards),
        ...orderGuards,
        registerModifier: modifier => registerHelpers => {
            const valueUpdater = registerHelpers.getUpdater<ValueUpdater>("value");
            return valueUpdater.registerModifier(fieldId, modifier);
        },
        unregisterModifier: modifierId => unregisterHelpers => {
            const valueUpdater = unregisterHelpers.getUpdater<ValueUpdater>("value");
            valueUpdater.unregisterModifier(fieldId, modifierId);
        }
    };
}
