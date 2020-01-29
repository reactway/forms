import {
    StatusesMechanism,
    ResetMechanism,
    ClearMechanism,
    SubmitMechanism} from "@reactway/forms-core";
export { ValidationMechanismImplementation } from "./mechanisms/validation";
export { ModifierMechanismImplementation } from "./mechanisms/modifier";

export class ResetMechanismImplementation<TValue> implements ResetMechanism<TValue> {
    public id: "field-reset" = "field-reset";
}

export class ClearMechanismImplementation<TValue> implements ClearMechanism<TValue> {
    public id: "field-clear" = "field-clear";
}

export class SubmitMechanismImplementation<TValue> implements SubmitMechanism<TValue> {
    public id: "field-submit" = "field-submit";
}
