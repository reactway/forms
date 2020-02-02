import React from "react";
import { DEFAULT_JSON_COMPONENTS } from "../json-components";
import { JsonType } from "../contracts";

const { ArrayView, StringView, NumberView, ObjectView, BooleanView, NullView, FunctionView, UndefinedView } = DEFAULT_JSON_COMPONENTS;

export interface JsonTypeProps {
    value: JsonType;
    depth: number;
}

export const JsonTypeView = ({ value, depth }: JsonTypeProps): JSX.Element => {
    if (Array.isArray(value)) {
        return <ArrayView value={value} depth={depth} />;
    }

    switch (typeof value) {
        case "boolean": {
            return <BooleanView value={value} depth={depth} />;
        }
        case "bigint":
        case "number": {
            return <NumberView value={value} depth={depth} />;
        }
        case "object": {
            if (value != null) {
                return <ObjectView value={value} depth={depth} />;
            } else {
                return <NullView />;
            }
        }
        case "function": {
            return <FunctionView value={value} depth={depth} />;
        }
        case "string": {
            return <StringView value={value} depth={depth} />;
        }
        case "undefined": {
            return <UndefinedView />;
        }
    }

    throw new Error(`Not implemented for ${typeof value}`);
};
