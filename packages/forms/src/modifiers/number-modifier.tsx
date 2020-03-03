import { ParseResult, ParseValue, DeepReadonly } from "@reactway/forms-core";
import { useModifier } from "../helpers";

export interface NumberModifierProps {
    decimalSeparator?: string;
    thousandsSeparator?: string;
}

// TODO: Unexport
export function parseNumber(
    current: ParseValue<string>,
    previous: DeepReadonly<ParseValue<number | string>>,
    decimalSeparator: string,
    thousandsSeparator: string,
    takeLastSeparator = true
): ParseResult<string, number> {
    console.log("parseNumber got selection:", current.caretPosition, previous.caretPosition);
    if (typeof current.value !== "string") {
        // Fail-safe in case a number or something else comes.
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        current.value = value.toString();
    }

    // What should we do when an error happens?
    // Does modifier care about an incorrectness of the value? E.g. 123.a
    // Or should it just replace all invalid characters and leave only the valid ones?
    // E.g. "123.a" => "123." => "123"

    // We try to minimize the effort and get the best result.
    // 1. Start by simply parsing value as Number.
    // 2. Try matching valid characters with regex.
    // 2.1. Removing all thousands separators.
    // 2.2. Figuring out if the value is negative.
    // 3. Trying to find and eliminate multiple decimal separators.
    // 4. Bail out with a default value of 0.

    //#region Parsing as number

    let parsedResult: ParseResult<string, number> | undefined;

    console.log("1. Parsing as number...");
    //#endregion
    // Short version of trying to parse the number. Return it if the parse is successful.
    parsedResult = tryParsing(current.value, previous.value, current.caretPosition, previous.caretPosition);
    if (parsedResult != null) {
        return parsedResult;
    }

    console.log("2. Trying regex.");
    // TODO: Use given decimalSeparator.
    const regex = new RegExp("[-0-9.,]+", "g");

    const matches = current.value.match(regex);

    if (matches == null) {
        console.log("No characters matched...");
        return {
            currentValue: 0
        };
    }

    let result = matches.join("").replaceAll(thousandsSeparator, "");
    console.log(`Thousands separators removed: ${result}`);

    let negativeValue = false;
    if (result.substring(0, 1) === "-") {
        negativeValue = true;
    }

    console.log(`Value is ${negativeValue ? "negative" : "positive"}`);

    // Add leading minus sign if needed and remove all other ones, if any.
    result = `${negativeValue ? "-" : ""}${result.replaceAll("-", "")}`;

    parsedResult = tryParsing(result, previous.value, current.caretPosition, previous.caretPosition);
    if (parsedResult != null) {
        return parsedResult;
    }

    // Maybe there are multiple separators?

    console.log(`Maybe there are multiple separators?`);
    const parts = result.split(decimalSeparator);
    console.log(`Parts:`, parts);
    // TODO: Make opinionated choice.
    if (takeLastSeparator) {
        result = parts.slice(0, -1).join("") + decimalSeparator + parts.slice(-1);
    } else {
        // Take first separator otherwise.
        result = parts.slice(0, 1) + decimalSeparator + parts.slice(1).join("");
    }

    parsedResult = tryParsing(result, previous.value, current.caretPosition, previous.caretPosition);
    if (parsedResult != null) {
        if (parsedResult.caretPosition == null) {
            return parsedResult;
        }
        return {
            ...parsedResult,
            caretPosition: parsedResult.caretPosition - 1
        };
    }

    return {
        currentValue: 0
    };
}

function tryParsing(
    value: string,
    previousValue: string | number,
    currentCaretPosition: number | undefined,
    previousCaretPosition: number | undefined
): ParseResult<string, number> | undefined {
    let parsedValue: number;
    if (!Number.isNaN((parsedValue = Number(value)))) {
        if (previousValue.toString() === parsedValue.toString()) {
            return {
                currentValue: parsedValue,
                transientValue: parsedValue.toString() !== value ? value : undefined,
                caretPosition: previousCaretPosition
            };
        }

        return {
            currentValue: parsedValue,
            transientValue: parsedValue.toString() !== value ? value : undefined,
            caretPosition: currentCaretPosition
        };
    }
    return undefined;
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
            parse: (current, previous) => {
                console.group(`Number modifier: ${current.value}`);
                const result = parseNumber(current, previous, decimalSeparator, thousandsSeparator);
                console.log(`Parsed value:`);
                console.log(Object.assign({}, result));

                // const updatedPosition = updateCursorPosition(result, current);
                // if (updatedPosition != null) {
                //     console.log("Updated position:");
                //     console.log(updatedPosition);
                //     result.caretPosition = updatedPosition;
                // }

                console.groupEnd();

                return result;
            }
        };
    }, [decimalSeparator, thousandsSeparator]);

    return null;
};
