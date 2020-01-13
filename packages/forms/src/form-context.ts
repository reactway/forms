import { createContext } from "react";
import { FieldStore, FieldState, getDefaultStatuses } from "@reactway/forms-core";

export const STUB_ID = "STUB_STORE";

export const StubStore = new FieldStore<FieldState<any, any>>(() => ({
    id: STUB_ID,
    name: STUB_ID,
    data: {},
    fields: {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    getValue: () => {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setValue: () => {},
    status: getDefaultStatuses(),
    validation: {
        results: []
    }
}));

export interface FormContextData {
    parentId: string | undefined;
    store: FieldStore<FieldState<any, any>>;
    permanent: boolean;
}

export const FormContext = createContext<FormContextData>({
    parentId: STUB_ID,
    store: StubStore,
    permanent: false
});
