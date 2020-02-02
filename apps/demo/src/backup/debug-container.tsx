import React, { useContext, useEffect } from "react";
import { useState } from "reinspect";
import { FormContext } from "@reactway/forms";

export const DebugContainer: React.FC = () => {
    const { store } = useContext(FormContext);
    const [, setDebugState] = useState(store.getState(), "form");

    useEffect(() => {
        return store.addListener(() => {
            setDebugState(store.getState());
        });
    }, [store]);

    return null;
};
