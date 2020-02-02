import { Draft } from "immer";
import { StatusesUpdater, FieldState } from "@reactway/forms-core";

export class StatusesUpdaterImplementation implements StatusesUpdater {
    public id: "field-statuses" = "field-statuses";
    public updateFieldStatus(draft: Draft<FieldState<any, any>>, fieldId: string, updater: (status: FieldStatus) => void): void {
        
    }
}
