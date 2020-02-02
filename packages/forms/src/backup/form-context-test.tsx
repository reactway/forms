import { useContext } from "react";
import { FormContext } from "./form-context";

export const FormContextTest = (): null => {
    const { parentId: parentId, store, permanent } = useContext(FormContext);
    console.log(parentId, store, permanent);
    return null;
};
