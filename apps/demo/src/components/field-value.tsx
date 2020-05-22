import React from "react";
import { FieldRef, useFieldState } from "@reactway/forms";

interface Props {
    fieldRef: FieldRef;
}

export const FieldValue = (props: Props) => {
    const fieldState = useFieldState(props.fieldRef);

    if (fieldState == null) {
        return <div>~No value~</div>;
    }

    return <div>{JSON.stringify(fieldState.getValue(fieldState), undefined, 4)}</div>;
};
