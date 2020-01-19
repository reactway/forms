import React, { useEffect, useContext, useState } from "react";
import { FormContext } from "@reactway/forms";
import { FieldState } from "@reactway/forms-core/src";

interface FormRenderProps {
    children: (state: FieldState<any, any>) => JSX.Element | null;
}

export const FormRender = (props: FormRenderProps): JSX.Element | null => {
    const { store, parentId } = useContext(FormContext);
    const [storeState, setStoreState] = useState(store.getState());

    useEffect(() => {
        // The listener is added asynchronously, thus a manual initial update is needed.
        setStoreState(store.getState());

        return store.addListener(() => {
            setStoreState(store.getState());
        });
    }, [store]);

    if (storeState == null) {
        return null;
    }

    console.log("Rendering children...");
    return props.children(storeState);
};
