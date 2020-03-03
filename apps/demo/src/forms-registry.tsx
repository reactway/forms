import React, { useState, useEffect } from "react";
import { FormsStores } from "@reactway/forms-core";

export const FormsRegistry = (): JSX.Element => {
    const [storesIds, setStores] = useState<string[]>([]);
    useEffect(() => {
        const update = (): void => {
            setStores(FormsStores.registry.getStoresIds());
        };

        update();

        return FormsStores.registry.addListener(update);
    }, []);

    return (
        <>
            {storesIds.map(id => (
                <div key={id}>{id}</div>
            ))}
        </>
    );
};
