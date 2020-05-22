import { useEffect, useState } from "react";
import { FieldState, FormSelector } from "@reactway/forms-core";
import { FieldRef, InternalFieldRef } from "./use-field-ref";

export function useFieldState(fieldRef: FieldRef): FieldState<any, any> | undefined {
    const [fieldState, setFieldState] = useState<FieldState<any, any> | undefined>();
    const internalFieldRef = fieldRef as InternalFieldRef & FieldRef;

    useEffect(() => {
        const store = internalFieldRef.__internal__store;
        const fieldId = internalFieldRef.fieldSelector;
        if (store == null || fieldId == null) {
            return;
        }

        setFieldState(store.helpers.selectField(fieldId));

        const storeListenerDeps = fieldId === FormSelector ? [] : [fieldId];

        return store.addListener(() => {
            setFieldState(store.helpers.selectField(fieldId));
        }, storeListenerDeps);
    }, [internalFieldRef.fieldSelector, internalFieldRef.__internal__store]);

    return fieldState;
}
