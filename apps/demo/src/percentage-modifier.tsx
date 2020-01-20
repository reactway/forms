import { useCallback, useState, useEffect } from "react";
import { Format, Parse } from "@reactway/forms-core";
import { useModifier } from "@reactway/forms";

export const PercentageModifier = (): null => {
    const format = useCallback<Format<number, number>>(currentValue => {
        return currentValue / 100;
    }, []);

    const parse = useCallback<Parse<number, number>>(value => {
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
