import { useCallback, useState, useEffect } from "react";
import { Format, Parse } from "@reactway/forms-core";
import { useModifier } from "@reactway/forms";

export interface NumberModifierProps {
    decimalSeparator?: string;
    thousandsSeparator?: string;
}

// TODO: Should be non-exported function?
export function parseNumber(value: string, decimalSeparator: string, thousandsSeparator: string, takeLastSeparator = true): number {
    let parsedValue: number;

    // What should we do when an error happens?
    // Does modifier care about an incorrectness of the value? E.g. 123.a
    // Or should it just replace all invalid characters and leave only the valid ones?
    // E.g. "123.a" => "123." => "123"

    // TODO: Benchmark trying Number(value) usage in every step
    // vs
    // Fixing up what can be fixed and then giving it to JS Number class to do its work.

    // Short version of trying to parse he number and return if it's done successfully.
    if (!Number.isNaN((parsedValue = Number(value)))) {
        return parsedValue;
    }

    // TODO: Use given separator.
    const regex = new RegExp("^[-0-9.,]+", "g");

    const matches = value.match(regex);

    if (matches == null) {
        return 0;
    }

    value = matches.join("").replaceAll(thousandsSeparator, "");

    let negativeValue = false;
    if (value.substring(0, 1) === "-") {
        negativeValue = true;
    }

    // Add leading minus sign if needed and remove all other ones, if any.
    value = `${negativeValue ? "-" : ""}${value.replaceAll("-", "")}`;

    if (!Number.isNaN((parsedValue = Number(value)))) {
        return parsedValue;
    }

    // Maybe there are multiple separators?

    const parts = value.split(decimalSeparator);
    if (takeLastSeparator) {
        value = parts.slice(0, -1).join("") + decimalSeparator + parts.slice(-1);
    } else {
        // Take first separator otherwise.
        value = parts.slice(0, 1) + decimalSeparator + parts.slice(1).join("");
    }

    if (!Number.isNaN((parsedValue = Number(value)))) {
        return parsedValue;
    }

    return 0;
}

export const NumberModifier = (props: NumberModifierProps): null => {
    const { decimalSeparator = ".", thousandsSeparator = "," } = props;
    const format = useCallback<Format<number, string>>(currentValue => {
        return currentValue.toString();
    }, []);

    const parse = useCallback<Parse<string, number>>(
        value => {
            // Old value should be provided?
            // Otherwise, we need to definitely successfully parse the value,
            // Which I'm not sure is what we intend with transientValue.

            const currentValue = parseNumber(value, decimalSeparator, thousandsSeparator);

            return {
                currentValue: currentValue
            };
        },
        [decimalSeparator, thousandsSeparator]
    );

    const [modifier, setModifier] = useState({ format, parse });

    useModifier<number, string>(modifier);

    useEffect(() => {
        setModifier({ format, parse });
    }, [format, parse]);
    return null;
};
