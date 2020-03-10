import React from "react";
import { useFieldContext, FieldContext } from "./field-context";

interface Props {
    children: React.ReactNode;
    nonPermanent?: boolean;
}

export const Permanent = (props: Props): JSX.Element => {
    const { children, nonPermanent = false } = props;
    const context = useFieldContext();

    return <FieldContext.Provider value={{ ...context, permanent: !nonPermanent }}>{children}</FieldContext.Provider>;
};
