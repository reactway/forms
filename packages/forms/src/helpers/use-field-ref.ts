import { useState } from "react";
import { FieldSelector, FieldState, Store } from "@reactway/forms-core";

type AnyFieldStore = Store<FieldState<any, any>>;

/** @internal */
export interface InternalFieldRef {
    __internal__store: AnyFieldStore | undefined;
}

export interface MutableFieldRef<TFieldState extends FieldState<any, any>> extends FieldRef<TFieldState> {
    setFieldId: (id: string | undefined, store: AnyFieldStore | undefined) => void;
}

export interface FieldRef<TFieldState extends FieldState<any, any>> {
    readonly fieldSelector?: FieldSelector;
    readonly _internal_stub_state_do_not_use_this?: TFieldState;
}

interface State {
    fieldId: string | undefined;
    store: AnyFieldStore | undefined;
}

export function useFieldRef<TFieldState extends FieldState<any, any>>(): FieldRef<TFieldState> {
    const [state, setState] = useState<State>(() => ({ fieldId: undefined, store: undefined }));

    const mutableFieldRef: MutableFieldRef<TFieldState> & InternalFieldRef = {
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
