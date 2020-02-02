import { createContext, useContext } from "react";
import { Store, FieldState, getDefaultStatuses } from "@reactway/forms-core";

export const StubId = "This is not the field you're looking for.";
export const StubStore = new Store<FieldState<null>>(() => ({
    id: StubId,
    name: StubId,
    data: {},
    fields: {},
    status: getDefaultStatuses(),
    values: {
        currentValue: null,
        defaultValue: null,
        initialValue: null
    }
}));

export interface FieldContextData {
    parentId: string;
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
