import React, { useContext } from "react";
import { FormContext } from "./form-context";

export const Permanent: React.FC = props => {
    const context = useContext(FormContext);

    return <FormContext.Provider value={{ ...context, permanent: true }}>{props.children}</FormContext.Provider>;
};
