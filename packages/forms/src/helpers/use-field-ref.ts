import { useState } from "react";
import { FieldSelector } from "@reactway/forms-core";

export interface MutableFieldRef extends FieldRef {
    setFieldId: (id: string | undefined) => void;
}

export interface FieldRef {
    readonly fieldId?: FieldSelector;
}

export function useFieldRef(): FieldRef {
    const [fieldId, setFieldId] = useState<string>();

    const mutableFieldRef: MutableFieldRef = {
        fieldId: fieldId,
        setFieldId: setFieldId
    };

    return mutableFieldRef;
}
