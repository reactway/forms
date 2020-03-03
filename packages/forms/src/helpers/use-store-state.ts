import { useState, useEffect } from "react";
import { FieldState, Store } from "@reactway/forms-core";
import { useFieldContext } from "../components";

export function useStoreState<TFieldState extends FieldState<any, any>>(
    fieldDeps?: string[]
): {
    state: FieldState<any, any>;
    store: Store<FieldState<any, any>>;
} {
    const { store } = useFieldContext();
    const [state, setState] = useState<TFieldState>(store.getState() as TFieldState);

    useEffect(() => {
        const update = (): void => {
            setState(store.getState() as TFieldState);
        };

        return store.addListener(() => {
            update();
        }, fieldDeps);
    }, [fieldDeps, store]);

    return {
        state,
        store
    };
}
