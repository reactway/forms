import { useEffect } from "react";
import { useFieldContext } from "../components";

export function useFieldFocusEffect(fieldId: string, elementRef: React.RefObject<HTMLInputElement>): void {
    const { store } = useFieldContext();

    useEffect(() => {
        const focusWhenActive = (): void => {
            if (elementRef.current == null) {
                return;
            }

            const activeFieldId = store.helpers.getActiveFieldId();
            if (activeFieldId === fieldId) {
                elementRef.current.focus();
            }
        };

        focusWhenActive();

        return store.addListener(() => {
            focusWhenActive();
        }, ["data.activeFieldId"]);
    }, [elementRef, fieldId, store]);
}
