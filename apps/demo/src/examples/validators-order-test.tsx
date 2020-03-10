import React, { useState, useCallback } from "react";
import { useStoreState, useFieldRef, TextInput, ValidationResults, Group, ResetButton, ClearButton, SubmitButton } from "@reactway/forms";
import { ValidationUpdater } from "@reactway/forms-core";
import { StoreResult } from "../components/store-result";
import { Validator } from "../validators/validator";
import { WaitValidator } from "../validators/wait-validator";

export const ValidatorsOrderTest = (): JSX.Element => {
    const { store } = useStoreState(["test"]);

    const personFieldRef = useFieldRef();
    const firstNameRef = useFieldRef();
    const lastNameRef = useFieldRef();

    const errorValidator = (
        <Validator
            key="error-test-validator"
            validate={(validatorValue, helpers) => [helpers.error(`Error for ${validatorValue}`)]}
            name="ErrorValidator"
        />
    );

    const testFieldRef = useFieldRef();
    const waitValidator = <WaitValidator key="wait-test-validator" time={1000} />;
    const warningValidator = (
        <Validator
            key="warning-test-validator"
            validate={(validatorValue, helpers) => [helpers.warning(`Warning for ${validatorValue}`)]}
            name="WarningValidator"
        />
    );

    const [testValidators, setTestValidators] = useState<JSX.Element[]>([]);

    const onClickOrder1 = (): void => {
        setTestValidators([errorValidator, waitValidator, warningValidator]);
    };

    const onClickOrder2 = (): void => {
        setTestValidators([warningValidator, waitValidator, errorValidator]);
    };

    const onClickValidate = (): void => {
        store.update(helpers => {
            if (testFieldRef.fieldSelector == null) {
                return;
            }

            const validationUpdater = helpers.getUpdater<ValidationUpdater>("validation");
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            validationUpdater.validateField(testFieldRef.fieldSelector);
        });
    };

    const takenName = "Jane";

    return (
        <>
            <label>
                Test:
                <TextInput name="test" fieldRef={testFieldRef} initialValue="Holla">
                    {testValidators}
                </TextInput>
                <button type="button" onClick={onClickOrder1}>
                    Order #1
                </button>
                <button type="button" onClick={onClickOrder2}>
                    Order #2
                </button>
                <button type="button" onClick={onClickValidate}>
                    Validate
                </button>
                <ValidationResults fieldSelector={testFieldRef.fieldSelector} />
            </label>
            <Group name="person" fieldRef={personFieldRef}>
                <label>
                    First name
                    <TextInput name="firstName" initialValue="Jane" fieldRef={firstNameRef}>
                        <WaitValidator time={800} />
                        <Validator<string>
                            shouldValidate={useCallback(value => value != null && value.length > 0, [])}
                            validate={useCallback((value, helpers) => {
                                if (value !== takenName) {
                                    return [
                                        helpers.error(`First name ${value} is already taken.`),
                                        helpers.warning(`Going for a walk is a good way to boost your creativity. You should try that.`)
                                    ];
                                }

                                return [];
                            }, [])}
                        />
                    </TextInput>
                    <ValidationResults fieldSelector={firstNameRef.fieldSelector} />
                </label>
                <label>
                    Last name
                    <TextInput name="lastName" initialValue="Doe" fieldRef={lastNameRef} />
                    <ValidationResults fieldSelector={lastNameRef.fieldSelector} />
                </label>
            </Group>

            <ValidationResults fieldSelector={personFieldRef.fieldSelector} />

            <ResetButton />
            <ClearButton />
            <SubmitButton />

            <StoreResult />
        </>
    );
};
