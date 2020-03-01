import { createContext, useContext } from "react";
import { Store, FieldState, getDefaultState, FieldHelpers } from "@reactway/forms-core";

export const StubId = `This is not the field you're looking for. What you found is a StubStore.`;

const throwError = (): never => {
    throw new Error("StubStore should not be used.");
};

export const StubStore = new Store<FieldState<unknown, {}>>(() => ({
    ...getDefaultState(),
    computedValue: false,
    id: StubId,
    name: StubId,
    data: {},
    getValue: throwError,
    setValue: throwError
}));

export interface FieldContextData {
    parentId: string | undefined;
    store: Store<FieldState<any, any>>;
    permanent: boolean;
    parentHelpers: FieldHelpers;
}

export const FieldContext = createContext<FieldContextData>({
    parentId: StubId,
    store: StubStore,
    permanent: false,
    parentHelpers: {
        reportValidatorIndex: throwError,
        registerValidator: throwError,
        unregisterValidator: throwError
    }
});

export const useFieldContext = (): FieldContextData => {
    return useContext(FieldContext);
};
