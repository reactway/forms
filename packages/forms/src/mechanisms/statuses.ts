import { Draft } from "immer";
import { StatusesMechanism, FieldState } from "@reactway/forms-core";

export class StatusesMechanismImplementation implements StatusesMechanism {
    public id: "field-statuses" = "field-statuses";
    public updateFieldStatus(draft: Draft<FieldState<any, any>>, fieldId: string, updater: (status: FieldStatus) => void): void {
        
    }
}
