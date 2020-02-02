import React from "react";
import { JsonBoolean, JsonBaseProps } from "../../contracts";

export type BooleanViewProps = JsonBaseProps<JsonBoolean>;

export const BooleanView = (props: BooleanViewProps): JSX.Element => {
    return <span className="json-boolean">{props.value.toString()}</span>;
};
