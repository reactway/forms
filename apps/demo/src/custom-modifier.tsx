import { useCallback, useContext } from "react";
import { Format, Parse } from "@reactway/forms-core";
import { FormContext, useModifier } from "@reactway/forms";

export enum Modification {
    Uppercase,
    Lowercase
}

// export type BaseModifierProps<TValue, TRenderValue> = Modifier<TValue, TRenderValue>;
export interface CustomModifierProps<TValue, TRenderValue> {
    modification: Modification;
}

export const CustomModifier = (props: CustomModifierProps<string, string>): null => {
    const { modification } = props;

    const format = useCallback<Format<string, string>>(
        (currentValue, _transientValue) => {
            switch (modification) {
                case Modification.Lowercase:
                    return currentValue.toLowerCase();
                case Modification.Uppercase:
                    return currentValue.toUpperCase();
            }
        },
        [modification]
    );

    const parse = useCallback<Parse<string, string>>(
        value => {
            switch (modification) {
                case Modification.Lowercase:
                    return {
                        currentValue: value.toLowerCase(),
                        transientValue: undefined
                    };
                case Modification.Uppercase:
                    return {
                        currentValue: value.toUpperCase(),
                        transientValue: undefined
                    };
            }
        },
        [modification]
    );

    useModifier<string, string>(format, parse);

    return null;
};
