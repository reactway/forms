import { useState, useEffect, DependencyList, useMemo } from "react";
import { FieldState } from "@reactway/forms-core";
import { useFieldContext } from "../components";

export function useStoreState<TFieldState extends FieldState<any, any>>(
    fieldDepsFactory: () => string[],
    deps: DependencyList
): {
    state: FieldState<any, any>;
} {
    const { store } = useFieldContext();
    const [state, setState] = useState<TFieldState>(store.getState() as TFieldState);

    const fieldDeps = useMemo(fieldDepsFactory, deps);

    useEffect(() => {
        const update = (): void => {
            setState(store.getState() as TFieldState);
        };

        return store.addListener(() => {
            update();
        }, fieldDeps);
    }, [fieldDeps, store]);

    return {
        state
    };
}
