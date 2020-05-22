import { useState } from "react";
import { FieldSelector, FieldState } from "@reactway/forms-core";

export interface MutableFieldRef extends FieldRef<FieldState<any, any>> {
    setFieldId: (id: string | undefined) => void;
}

export interface FieldRef<TFieldState extends FieldState<any, any>> {
    readonly fieldSelector?: FieldSelector;
}

export function useFieldRef<TFieldState extends FieldState<any, any> = FieldState<any, any>>(): FieldRef<TFieldState> {
    const [fieldId, setFieldId] = useState<string>();

    const mutableFieldRef: MutableFieldRef = {
        fieldSelector: fieldId,
        setFieldId: setFieldId
    };

    return mutableFieldRef;
}
