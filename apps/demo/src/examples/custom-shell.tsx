import { useState, useRef, useLayoutEffect } from "react";
import React from "react";
import { parseNumber } from "@reactway/forms/src";

export type InputState = {
    currentValue: number;
    transientValue?: string;
    caretPosition?: number;
};

export const CustomShell = (): JSX.Element => {
    const [state, setState] = useState<InputState>({
        currentValue: 123.4567,
        caretPosition: 0
    });

    const inputRef = useRef<HTMLInputElement>(null);

    useLayoutEffect(() => {
        if (state.caretPosition != null) {
            inputRef.current?.setSelectionRange(state.caretPosition, state.caretPosition);
        }
    }, [state.caretPosition]);

    const onChange: React.ChangeEventHandler<HTMLInputElement> = event => {
        const value = event.currentTarget.value;
        const caretPosition = event.currentTarget.selectionStart ?? value.length;

        const result = parseNumber(
            {
                value: value,
                caretPosition: caretPosition
            },
            {
                value: state.currentValue.toString(),
                caretPosition: state.caretPosition
            },
            ".",
            ","
        );

        setState({
            ...state,
            currentValue: result.currentValue,
            caretPosition: result.caretPosition,
            transientValue: result.transientValue
        });
    };

    return (
        <>
            <label>
                Number
                <input ref={inputRef} value={state.transientValue ?? state.currentValue} onChange={onChange} />
            </label>
            <pre>{JSON.stringify(state, null, 4)}</pre>
        </>
    );
};
