import React from "react";
import { JsonType } from "../contracts";
import { JsonTypeView } from "./json-type";

export interface JsonViewProps {
    value: JsonType;
}

export const JsonView = (props: JsonViewProps): JSX.Element => {
    return (
        <pre>
            <code>
                <JsonTypeView value={props.value} depth={0} />
            </code>
        </pre>
    );
};
