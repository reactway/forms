import { useCallback, useState, useEffect } from "react";
import { Format, Parse } from "@reactway/forms-core";
import { useModifier } from "@reactway/forms";

export const PercentageModifier = (): null => {
    const format = useCallback<Format<number, number>>(currentValue => {
        return currentValue / 100;
    }, []);

    const parse = useCallback<Parse<number, number>>(value => {
        // TODO: After implementing "first transient value wins" check if this is still needed.
        if (typeof value !== "number") {
            return {
                currentValue: 0
            };
        }
        return {
            currentValue: value * 100
        };
    }, []);

    const [modifier, setModifier] = useState({ format, parse });

    useModifier<number, number>(modifier);

    useEffect(() => {
        setModifier({ format, parse });
    }, [format, parse]);
    return null;
};
