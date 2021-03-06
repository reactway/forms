import { DependencyList, useMemo, useEffect, useLayoutEffect, useState } from "react";
import { Validator, ValidationUpdater, ValidatorFactory } from "@reactway/forms-core";
import { useFieldContext } from "../components";

export function useValidator<TValue>(name: string, validatorFactory: () => ValidatorFactory<TValue>, deps: DependencyList): void {
    const { store, parentId, parentHelpers } = useFieldContext();
    const validator = useMemo(validatorFactory, deps);
    const [validatorId, setValidatorId] = useState<string>();

    useLayoutEffect(() => {
        if (parentId == null) {
            return;
        }

        store.update(helpers => {
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
    }, [name, parentId, validator, store]);

    useEffect(() => {
        if (parentId == null || validatorId == null) {
            return;
        }

        return () => {
            store.update(helpers => {
                const validationUpdater = helpers.getUpdater<ValidationUpdater>("validation");
                validationUpdater.unregisterValidator(parentId, validatorId);
            });
        };
    }, [parentId, store, validator, validatorId]);

    useEffect(() => {
        if (parentId == null) {
            return;
        }

        store.update(helpers => {
            const validationUpdater = helpers.getUpdater<ValidationUpdater>("validation");
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            validationUpdater.validateField(parentId);
        });
    }, [parentId, store]);

    if (validatorId != null) {
        parentHelpers.reportValidatorIndex(validatorId);
    }
}
