import { createContext, useContext } from "react";
import { Store, FieldState, getDefaultState } from "@reactway/forms-core";

export const StubId = `This is not the field you're looking for. What you found is a StubStore.`;
export const StubStore = new Store<FieldState<unknown, {}>>(() => ({
    ...getDefaultState(),
    computedValue: false,
    id: StubId,
    name: StubId,
    data: {},
    getValue: () => {
        throw new Error("StubStore should not be used.");
    },
    setValue: () => {
        throw new Error("StubStore should not be used.");
    }
}));

export interface FieldContextData {
    parentId: string | undefined;
    store: Store<FieldState<any, any>>;
    permanent: boolean;
}

export const FieldContext = createContext<FieldContextData>({
    parentId: StubId,
    store: StubStore,
    permanent: false
});

export const useFieldContext = (): FieldContextData => {
    return useContext(FieldContext);
};
