import { createContext, useContext } from "react";
import { Store, FieldState, getDefaultState, getDefaultValues } from "@reactway/forms-core";

export const StubId = "This is not the field you're looking for.";
export const StubStore = new Store<FieldState<null>>(() => ({
    ...getDefaultState(),
    id: StubId,
    name: StubId,
    data: {},
    values: getDefaultValues(null),
    getValue: () => {
        throw new Error("StubStore should not be used.");
    },
    setValue: () => {
        throw new Error("StubStore should not be used.");
    }
}));

export interface FieldContextData {
    parentId: string | undefined;
    store: Store<FieldState<any>>;
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
