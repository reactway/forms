import { useState } from "react";
import { FieldSelector } from "@reactway/forms-core";

export interface MutableFieldRef extends FieldRef {
    setFieldId: (id: string | undefined) => void;
}

export interface FieldRef {
    readonly fieldSelector?: FieldSelector;
}

export function useFieldRef(): FieldRef {
    const [fieldId, setFieldId] = useState<string>();

    const mutableFieldRef: MutableFieldRef = {
        fieldSelector: fieldId,
        setFieldId: setFieldId
    };

    return mutableFieldRef;
}
