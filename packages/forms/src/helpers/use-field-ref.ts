import { useState } from "react";
import { FieldSelector, FieldState, Store } from "@reactway/forms-core";

type AnyFieldStore = Store<FieldState<any, any>>;


/** @internal */
export interface InternalFieldRef {
    __internal__store: AnyStore | undefined;
}

export interface MutableFieldRef extends FieldRef<FieldState<any, any>> {
    setFieldId: (id: string | undefined, store: AnyStore | undefined) => void;
}

export interface FieldRef<TFieldState extends FieldState<any, any>> {
    readonly fieldSelector?: FieldSelector;
}

interface State {
    fieldId: string | undefined;
    store: AnyStore | undefined;
}

export function useFieldRef<TFieldState extends FieldState<any, any> = FieldState<any, any>>(): FieldRef<TFieldState> {
    const [state, setState] = useState<State>(() => ({ fieldId: undefined, store: undefined }));

    const mutableFieldRef: MutableFieldRef & InternalFieldRef = {
        fieldSelector: state.fieldId,
        // eslint-disable-next-line @typescript-eslint/camelcase
        __internal__store: state.store,
        setFieldId: (id, store) => {
            if (state.fieldId !== id || state.store !== store) {
                setState({ fieldId: id, store: store });
            }
        }
    };

    return mutableFieldRef;
}
