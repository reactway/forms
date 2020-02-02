import React from "react";

import { JsonBaseProps } from "../../contracts";

const functionStyles: React.CSSProperties = {
    userSelect: "none",
    backgroundColor: "lightgrey",
    padding: "0 5px",
    marginLeft: "4px",
    borderRadius: "5px"
};

export type FunctionViewProps = JsonBaseProps<Function>;

export const FunctionView = (props: FunctionViewProps): JSX.Element => {
    let functionName: string | undefined;
    if (typeof props.value === "function" && props.value != null) {
        functionName = `${props.value.name}()`;
    }

    return (
        <>
            <span style={functionStyles}>{functionName}</span>
        </>
    );
};
