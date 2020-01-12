import React from "react";
import { JsonBaseProps, JsonNumber } from "../../contracts";

export type NumberViewProps = JsonBaseProps<JsonNumber>;

export const NumberView = (props: NumberViewProps): JSX.Element => {
    return <span>{props.value}</span>;
};
