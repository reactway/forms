import { Validator } from "./validation";
import { FieldOrderGuards } from "./order-guards";

export interface FieldHelpers {
    registerValidator(validator: Validator<any>): string;
    unregisterValidator(validatorId: string): void;
    orderGuards: FieldOrderGuards;
}
