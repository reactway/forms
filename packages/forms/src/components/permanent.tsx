import React from "react";
import { useFieldContext, FieldContext } from "./field-context";

interface Props {
    children: React.ReactNode;
}

export const Permanent = (props: Props): JSX.Element => {
    const context = useFieldContext();

    return <FieldContext.Provider value={{ ...context, permanent: true }}>{props.children}</FieldContext.Provider>;
};
