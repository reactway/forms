import { useState, useEffect } from "react";
import { FieldState, Store } from "@reactway/forms-core";
import { useFieldContext } from "../components";

export function useStoreState<TFieldState extends FieldState<any, any>>(): {
    state: FieldState<any, any>;
    store: Store<FieldState<any, any>>;
} {
    const { store } = useFieldContext();
    const [state, setState] = useState<TFieldState>(store.getState() as TFieldState);

    useEffect(() => {
        setState(store.getState() as TFieldState);

        return store.addListener(() => {
            setState(store.getState() as TFieldState);
        });
    }, [store]);

    return {
        state,
        store
    };
}
