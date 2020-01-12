import React, { useEffect, useContext, useState } from "react";
import { FormContext } from "@reactway/forms";
import { JsonView } from "./pretty-diff";

export const FormStore = (): JSX.Element | null => {
    const { store } = useContext(FormContext);
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
    return <JsonView value={storeState as any} />;
};
