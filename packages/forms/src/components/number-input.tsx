import React from "react";
import { NumberModifierProps, NumberModifier } from "../modifiers";
import { TextInput, TextInputProps } from "./text-input";

export interface NumberFieldProps extends Omit<TextInputProps, "initialValue" | "defaultValue">, NumberModifierProps {
    initialValue?: number;
    defaultValue?: number;
    inputMode?: "decimal" | "numeric";
}

export const NumberInput = (props: NumberFieldProps): JSX.Element => {
    const { initialValue, defaultValue = 0, inputMode = "decimal", ...restProps } = props;

    return (
        <TextInput defaultValue={defaultValue.toString()} initialValue={initialValue?.toString()} inputMode={inputMode} {...restProps}>
            <NumberModifier />
        </TextInput>
    );
};
