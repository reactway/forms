import { Modifier } from "@reactway/forms-core";
import { useModifier } from "../use-modifier";

export type BaseModifierProps<TValue, TRenderValue> = Modifier<TValue, TRenderValue>;

export const BaseModifier = <TValue, TRenderValue>(props: BaseModifierProps<TValue, TRenderValue>): null => {
    useModifier<TValue, TRenderValue>(props.format, props.parse);
    return null;
};
