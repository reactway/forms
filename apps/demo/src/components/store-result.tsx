import React from "react";
import { useStoreState } from "@reactway/forms";

export const StoreResult = (): JSX.Element => {
    const { state } = useStoreState(() => [], []);
    return <pre className="store-result">{JSON.stringify(state.getValue(state), null, 4)}</pre>;
};
