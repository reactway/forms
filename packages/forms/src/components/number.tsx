import React from "react";
import { NumberModifierProps, NumberModifier } from "../modifiers";
import { Text, TextProps } from "./text";

export interface NumberProps extends Omit<TextProps, "initialValue" | "defaultValue">, NumberModifierProps {
    initialValue?: number;
    defaultValue?: number;
}

export const Number = (props: NumberProps): JSX.Element => {
    const { initialValue, defaultValue = 0, ...restProps } = props;

    return (
        <Text defaultValue={defaultValue.toString()} initialValue={initialValue?.toString()} {...restProps}>
            <NumberModifier />
        </Text>
    );
};
