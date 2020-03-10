import React from "react";
import { useFieldContext, FieldContext } from "./field-context";

interface Props {
    children: React.ReactNode;
    permanent?: boolean;
}

export const Permanent = (props: Props): JSX.Element => {
    const { children, permanent = true } = props;
    const context = useFieldContext();

    return <FieldContext.Provider value={{ ...context, permanent: permanent }}>{children}</FieldContext.Provider>;
};
