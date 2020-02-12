import { DependencyList, useMemo, useEffect, useLayoutEffect, useState } from "react";
import { Validator, ValidationUpdater } from "@reactway/forms-core";
import { useFieldContext } from "../components";

export function useValidator<TValue>(
    name: string,
    validatorFactory: () => Pick<Validator<TValue>, "validate"> & Partial<Pick<Validator<TValue>, "shouldValidate">>,
    deps: DependencyList
): void {
    const { store, parentId } = useFieldContext();
    const validator = useMemo(validatorFactory, deps);
    const [validatorId, setValidatorId] = useState<string>();

    useLayoutEffect(() => {
        if (parentId == null) {
            return;
        }

        store.update((_draft, helpers) => {
            const validationUpdater = helpers.getUpdater<ValidationUpdater>("validation");
            const shouldValidate = validator.shouldValidate ?? (() => true);

            const validatorToRegister: Validator<TValue> = {
                name: name,
                validate: validator.validate,
                shouldValidate: shouldValidate
            };

            const id = validationUpdater.registerValidator(parentId, validatorToRegister);
            setValidatorId(id);
        });
    }, [name, parentId, store, validator]);

    useEffect(() => {
        // console.log("useValidator, useEffect 1");
        // console.log(`ValidatorId: ${validatorId}`);

        if (parentId == null || validatorId == null) {
            return;
        }

        return () => {
            store.update((_draft, helpers) => {
                const validationUpdater = helpers.getUpdater<ValidationUpdater>("validation");
                validationUpdater.unregisterValidator(parentId, validatorId);
            });
        };
    }, [parentId, store, validator, validatorId]);

    useEffect(() => {
        // console.log("useValidator, useEffect 2");
        if (parentId == null) {
            return;
        }

        store.update((_draft, helpers) => {
            const validationUpdater = helpers.getUpdater<ValidationUpdater>("validation");
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            validationUpdater.validateField(parentId);
        });
    }, [parentId, store]);
}
