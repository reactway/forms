import { useState, useEffect, DependencyList, useMemo } from "react";
import { FieldState, StoreHelpers } from "@reactway/forms-core";
import { useFieldContext } from "../components";

export interface UseStoreStateResult {
    state: FieldState<any, any>;
    helpers: StoreHelpers;
}

export function useStoreState(fieldDepsFactory: () => string[], deps: DependencyList): UseStoreStateResult {
    const { store } = useFieldContext();
    const [state, setState] = useState<UseStoreStateResult>(() => ({ state: store.getState(), helpers: store.helpers }));

    const fieldDeps = useMemo(fieldDepsFactory, deps);

    useEffect(() => {
        const update = (): void => {
            setState({
                state: store.getState(),
                helpers: store.helpers
            });
        };

        return store.addListener(() => {
            update();
        }, fieldDeps);
    }, [fieldDeps, store]);

    return state;
}
