import { useState, useEffect } from "react";
import { Modifier } from "@reactway/forms-core";
import { useModifier } from "../use-modifier";

export type BaseModifierProps<TValue, TRenderValue> = Modifier<TValue, TRenderValue>;

export const BaseModifier = <TValue, TRenderValue>(props: BaseModifierProps<TValue, TRenderValue>): null => {
    const [modifier, setModifier] = useState({ format: props.format, parse: props.parse });
    useModifier<TValue, TRenderValue>(modifier);

    useEffect(() => {
        setModifier({ format: props.format, parse: props.parse });
    }, [props.format, props.parse]);
    return null;
};
