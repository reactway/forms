import {
    StatusesUpdater,
    ResetUpdater,
    ClearUpdater,
    SubmitUpdater} from "@reactway/forms-core";
export { ValidationUpdaterImplementation } from "./updaters/validation";
export { ModifierUpdaterImplementation } from "./updaters/modifier";

export class ResetUpdaterImplementation<TValue> implements ResetUpdater<TValue> {
    public id: "field-reset" = "field-reset";
}

export class ClearUpdaterImplementation<TValue> implements ClearUpdater<TValue> {
    public id: "field-clear" = "field-clear";
}

export class SubmitUpdaterImplementation<TValue> implements SubmitUpdater<TValue> {
    public id: "field-submit" = "field-submit";
}
