import { ParseResult, ParseValue, DeepReadonly, formsLogger } from "@reactway/forms-core";
import { useModifier } from "../helpers";

const logger = formsLogger.extend("number-modifier");

export interface NumberModifierProps {
    decimalSeparator?: string;
    thousandsSeparator?: string;
    allowNegative?: boolean;
}

// TODO: Unexport
export function parseNumber(
    current: ParseValue<string>,
    previous: DeepReadonly<ParseValue<number | string>>,
    decimalSeparator: string,
    thousandsSeparator: string,
    takeLastSeparator = true,
    allowNegative = true
): ParseResult<string, number> {
    logger("parseNumber got selection:", current.caretPosition, previous.caretPosition);
    if (typeof current.value !== "string") {
        // Fail-safe in case a number or something else comes.
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        current.value = current.value.toString();
    }

    // We try to minimize the effort and get the best result.
    // 1. Start by simply parsing value as Number.
    // 2. Try matching valid characters with regex.
    // 2.1. Removing all thousands separators.
    // 2.2. Figuring out if the value is negative.
    // 3. Trying to find and eliminate multiple decimal separators.
    // 4. Bail out with a default value of 0.

    let parsedResult: ParseResult<string, number> | undefined;

    logger("1. Parsing as number...");
    // Short version of trying to parse the number. Return it if the parse is successful.
    parsedResult = tryParsing(current.value, previous.value, current.caretPosition, previous.caretPosition, allowNegative);
    if (parsedResult != null) {
        return parsedResult;
    }

    logger("2. Trying regex.");
    // TODO: Use given decimalSeparator.
    const regex = new RegExp("[-+0-9.,]+", "g");

    const matches = current.value.match(regex);

    if (matches == null) {
        logger("No characters matched...");
        return {
            currentValue: 0
        };
    }

    let result = matches.join("").replaceAll(thousandsSeparator, "");
    logger(`Thousands separators removed: ${result}`);

    let negativeValue = false;
    let plusSign = false;
    if (result.substring(0, 1) === "-" && allowNegative) {
        negativeValue = true;
    } else if (result.substring(0, 1) === "+") {
        negativeValue = false;
        plusSign = true;
    }

    logger(`Value is ${negativeValue ? "negative" : "positive"}`);

    // Add leading minus sign if needed and remove all other ones, if any.
    result = `${negativeValue ? "-" : ""}${plusSign ? "+" : ""}${result.replaceAll("-", "").replaceAll("+", "")}`;

    if (
        result === decimalSeparator ||
        result === "-" ||
        result === `-${decimalSeparator}` ||
        result === "+" ||
        result === `+${decimalSeparator}`
    ) {
        return {
            currentValue: 0,
            transientValue: result,
            caretPosition: current.caretPosition
        };
    }

    parsedResult = tryParsing(result, previous.value, current.caretPosition, previous.caretPosition);
    if (parsedResult != null) {
        return parsedResult;
    }

    // Maybe there are multiple separators?

    logger(`Maybe there are multiple separators?`);
    const parts = result.split(decimalSeparator);
    logger(`Parts:`, parts);
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
    previousCaretPosition: number | undefined,
    allowNegative = true
): ParseResult<string, number> | undefined {
    let parsedValue = Number(value);
    if (!Number.isNaN(parsedValue)) {
        logger("tryParsing", typeof previousValue, previousValue, typeof parsedValue, parsedValue);

        if (!allowNegative) {
            parsedValue = Math.abs(parsedValue);
            value = value[0] === "-" ? value.substr(1) : value;
        }

        if (previousValue.toString() === parsedValue.toString() && value[value.length - 1] !== ".") {
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

function toFixed(value: number): string {
    logger(`toFixed:${typeof value}:${value}`);
    if (Math.abs(value) < 1.0) {
        const e = parseInt(value.toString().split("e-")[1]);
        if (!Number.isNaN(e)) {
            value *= Math.pow(10, e - 1);
            return `0.${new Array(e).join("0")}${value.toString().substring(2)}`;
        }
    } else {
        let e = parseInt(value.toString().split("+")[1]);
        if (e > 20) {
            e -= 20;
            value /= Math.pow(10, e);
            return value + new Array(e + 1).join("0");
        }
    }

    logger("Returning value.toString()");
    return value.toString();
}

export const NumberModifier = (props: NumberModifierProps): null => {
    if (props.thousandsSeparator != null) {
        throw new Error("thousandsSeparator is not implemented.");
    }
    const { decimalSeparator = ".", thousandsSeparator = ",", allowNegative } = props;

    useModifier<number, string>(() => {
        return {
            format: currentValue => {
                return toFixed(currentValue);
            },
            parse: (current, previous) => {
                logger(`Number modifier: ${current.value}`);
                const result = parseNumber(current, previous, decimalSeparator, thousandsSeparator, undefined, allowNegative);
                logger(`Parsed value:`);
                logger(Object.assign({}, result));

                // const updatedPosition = updateCursorPosition(result, current);
                // if (updatedPosition != null) {
                //     logger("Updated position:");
                //     logger(updatedPosition);
                //     result.caretPosition = updatedPosition;
                // }

                return result;
            }
        };
    }, [decimalSeparator, thousandsSeparator, allowNegative]);

    return null;
};
