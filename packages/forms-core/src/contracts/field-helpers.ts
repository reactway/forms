import { StoreUpdater } from "../store";
import { Validator } from "./validation";
import { Modifier } from "./modifiers";
import { FieldState } from "./field-state";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FieldHelpers extends ValidatorsFieldHelpers {}

export interface InputFieldHelpers extends FieldHelpers, ModifiersFieldHelpers {}

type StoreUpdateParameters = Parameters<StoreUpdater<FieldState<any, any>>>;

export interface ValidatorsOrderGuard {
    reportValidatorIndex: (validatorId: string) => void;
}

export interface ValidatorsFieldHelpers extends ValidatorsOrderGuard {
    registerValidator<TValue>(validator: Validator<TValue>): (...args: StoreUpdateParameters) => string;
    unregisterValidator(validatorId: string): StoreUpdater<FieldState<any, any>>;
}

export interface ModifiersOrderGuard {
    reportModifierIndex: (modifierId: string) => void;
}

export interface ModifiersFieldHelpers extends ModifiersOrderGuard {
    registerModifier<TValue, TRenderValue>(modifier: Modifier<TValue, TRenderValue>): (...args: StoreUpdateParameters) => string;
    unregisterModifier(modifierId: string): StoreUpdater<FieldState<any, any>>;
}
