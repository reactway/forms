import React from "react";
import { FieldRef, useFieldState } from "@reactway/forms";
import { FieldState } from "@reactway/forms-core";

interface Props {
    fieldRef: FieldRef<FieldState<any, any>>;
}

export const FieldValue = (props: Props) => {
    const fieldState = useFieldState(props.fieldRef);

    if (fieldState == null) {
        return <div>~No value~</div>;
    }

    return <div>{JSON.stringify(fieldState.getValue(fieldState), undefined, 4)}</div>;
};
