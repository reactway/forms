import { ParseResult, TextSelection } from "@reactway/forms-core";
import { useModifier } from "../helpers";

export interface NumberModifierProps {
    decimalSeparator?: string;
    thousandsSeparator?: string;
}

function parseNumber(
    value: string,
    selection: TextSelection | undefined,
    decimalSeparator: string,
    thousandsSeparator: string,
    takeLastSeparator = true
): ParseResult<string, number> {
    if (typeof value !== "string") {
        // This might need rethinking or just leaving it as a fail-safe.
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        value = value.toString();
    }

    console.log(`Number modifier got selection: ${JSON.stringify(selection, null, 4)}`);

    let parsedValue: number;

    // What should we do when an error happens?
    // Does modifier care about an incorrectness of the value? E.g. 123.a
    // Or should it just replace all invalid characters and leave only the valid ones?
    // E.g. "123.a" => "123." => "123"

    // TODO: Benchmark trying Number(value) usage in every step
    // vs
    // Fixing up what can be fixed and then giving it to JS Number class to do its work.

    console.group(`Number modifier: ${value}`);

    console.log("Parsing as number...");
    // Short version of trying to parse he number and return if it's done successfully.
    if (!Number.isNaN((parsedValue = Number(value)))) {
        console.log("Succeeded!");
        console.log(parsedValue);
        console.groupEnd();
        return {
            currentValue: parsedValue,
            transientValue: parsedValue.toString() !== value ? value : undefined,
            selection: selection
        };
    }

    console.log("Let's try regex.");
    // TODO: Use given separator.
    const regex = new RegExp("[-0-9.,]+", "g");

    console.log(typeof value);
    const matches = value.match(regex);

    if (matches == null) {
        console.log("Matches == null");
        console.log(0);
        console.groupEnd();
        return {
            currentValue: 0
        };
    }

    value = matches.join("").replaceAll(thousandsSeparator, "");
    console.log(`Value joined: ${value}`);

    let negativeValue = false;
    if (value.substring(0, 1) === "-") {
        negativeValue = true;
    }

    console.log(`Value is ${negativeValue ? "negative" : "positive"}`);
    // Add leading minus sign if needed and remove all other ones, if any.
    value = `${negativeValue ? "-" : ""}${value.replaceAll("-", "")}`;

    if (!Number.isNaN((parsedValue = Number(value)))) {
        console.log(parsedValue);
        console.log(JSON.stringify(selection));
        console.groupEnd();
        return {
            currentValue: parsedValue,
            selection: selection
        };
    }

    // Maybe there are multiple separators?

    console.log(`Maybe there are multiple separators?`);
    const parts = value.split(decimalSeparator);
    console.log(`Parts:`, parts);
    if (takeLastSeparator) {
        value = parts.slice(0, -1).join("") + decimalSeparator + parts.slice(-1);
    } else {
        // Take first separator otherwise.
        value = parts.slice(0, 1) + decimalSeparator + parts.slice(1).join("");
    }

    const lastValueIsSeparator = value[value.length - 1] === ".";
    console.log(`Resolved value: ${value}`);

    if (!Number.isNaN((parsedValue = Number(value)))) {
        console.log(parsedValue);
        console.groupEnd();
        return {
            currentValue: parsedValue,
            transientValue: lastValueIsSeparator ? value : undefined,
            selection: selection
        };
    }
    console.log(0);
    console.groupEnd();
    return {
        currentValue: 0
    };
}

export const NumberModifier = (props: NumberModifierProps): null => {
    if (props.thousandsSeparator != null) {
        throw new Error("thousandsSeparator is not implemented.");
    }
    const { decimalSeparator = ".", thousandsSeparator = "," } = props;

    useModifier<number, string>(() => {
        return {
            format: currentValue => {
                return currentValue.toString();
            },
            parse: (value, selection) => {
                return parseNumber(value, selection, decimalSeparator, thousandsSeparator);
            }
        };
    }, [decimalSeparator, thousandsSeparator]);

    return null;
};
