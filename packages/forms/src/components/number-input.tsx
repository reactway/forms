import React from "react";
import { ValueUpdater } from "@reactway/forms-core";
import { NumberModifierProps, NumberModifier } from "../modifiers";
import { useFieldRef } from "../helpers";
import { TextInput, TextInputProps, TextInputState } from "./text-input";
import { useFieldContext } from "./field-context";

export interface NumberFieldProps extends Omit<TextInputProps, "initialValue" | "defaultValue">, NumberModifierProps {
    initialValue?: number;
    defaultValue?: number;
    inputMode?: "decimal" | "numeric";
}

export const NumberInput = (props: NumberFieldProps): JSX.Element => {
    const { initialValue, defaultValue = 0, inputMode = "decimal", ...restProps } = props;
    const textFieldRef = useFieldRef();
    const { store } = useFieldContext();

    const onBlur: React.FocusEventHandler<HTMLInputElement> = () => {
        store.update(blurHelpers => {
            if (textFieldRef.fieldSelector == null) {
                return;
            }

            const blurFieldState = blurHelpers.selectField(textFieldRef.fieldSelector);
            if (blurFieldState == null) {
                return;
            }

            const textState = blurFieldState as TextInputState;

            const valueUpdater = blurHelpers.getUpdater<ValueUpdater>("value");
            valueUpdater.updateFieldValue(textFieldRef.fieldSelector, textState.data.currentValue);
        });
    };

    return (
        <TextInput
            fieldRef={textFieldRef}
            defaultValue={defaultValue.toString()}
            initialValue={initialValue?.toString()}
            inputMode={inputMode}
            onBlur={onBlur}
            {...restProps}
        >
            <NumberModifier />
        </TextInput>
    );
};
