import { formsLogger } from "@reactway/forms-core";
import { useModifier } from "../helpers";

const logger = formsLogger.extend("ThousandsModifier");

export interface ThousandsModifierProps {
    thousandsSeparator?: string;
}

export const ThousandsModifier = (props: ThousandsModifierProps): null => {
    const { thousandsSeparator = "," } = props;

    console.error("DO NOT USE. FOR TESTING MODIFIERS ONLY. NOT PRODUCTION READY AT ALL.");

    useModifier<string, string>(() => {
        return {
            format: currentValue => {
                logger(ThousandsModifier.name, currentValue);
                const stringValue = currentValue.toString();
                const parts = stringValue.split(".");

                const thousands = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                if (parts.length === 1) {
                    return thousands;
                }
                return `${thousands}.${parts[1]}`;
            },
            parse: current => {
                let caretPosition: number | undefined = undefined;
                if (current.caretPosition != null) {
                    caretPosition = current.caretPosition;
                }
                return {
                    currentValue: current.value.toString().replaceAll(thousandsSeparator, ""),
                    caretPosition: caretPosition
                };
            }
        };
    }, [thousandsSeparator]);

    return null;
};
