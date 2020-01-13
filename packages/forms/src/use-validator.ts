import { useContext, useEffect } from "react";
import { Validator } from "@reactway/forms-core";
import { FormContext } from "./form-context";

export function useValidator<TValue>(validator: Validator<TValue>): void {
    const { parentId, store } = useContext(FormContext);

    useEffect(() => {
        if (parentId == null) {
            return;
        }

        let validatorId: string;
        store.update((_draft, helpers) => {
            validatorId = helpers.registerValidator(parentId, validator);
        });

        return () => {
            store.update((_draft, helpers) => {
                helpers.unregisterValidator(parentId, validatorId);
            });
        };
    }, [store, parentId, validator]);
}
