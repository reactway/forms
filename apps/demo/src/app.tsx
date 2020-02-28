import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import {
    Form,
    useFieldContext,
    Text,
    Group,
    Number,
    useStoreState,
    useFieldRef,
    RadioGroup,
    Radio,
    Checkbox,
    Reset,
    ValidationResults,
    Submit,
    FormProps,
    Clear
} from "@reactway/forms";
import {
    FieldState,
    Store,
    ValidationResultType,
    ValidationUpdater,
    ValidationResultOrigin,
    NestedDictionary,
    ValidationResultOrString
} from "@reactway/forms-core";
import JSONTree from "react-json-tree";
import { FormsRegistry } from "./forms-registry";
import { ErrorBoundary } from "./error-boundary";
import { LengthValidator } from "./validators/length-validator";
import { UsernameValidator } from "./validators/username-validator";
import { WaitValidator } from "./validators/wait-validator";
import Loader from "./assets/loader.svg";

import "./app.scss";
import { PersonContactsValidator } from "./validators/person-validator";
import { GroupValidator } from "./validators/group-validator";
import { Validator } from "./validators/validator";

// (window as any).debugState = true;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Stringify = (props: { state: {} }): JSX.Element => {
    return (
        <div className="pre">
            {JSON.stringify(
                props.state,
                (key, value) => {
                    const skip = ["validation", "getStatus", "setValue", "name"];

                    if (skip.includes(key)) {
                        return;
                    }

                    if (typeof value === "function") {
                        const functionValue = value as Function;
                        if (functionValue.name !== "") {
                            return `${functionValue.name}() => {}`;
                        }
                        return "<anonymous>() => {}";
                    }
                    return value;
                },
                2
            )}
        </div>
    );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StoreStateJson = (props: any): JSX.Element => {
    const { store } = useFieldContext();
    const [state, setState] = useState(store.getState());

    useEffect(() => {
        const update = (): void => {
            setState(store.getState());
        };

        update();

        return store.addListener(() => {
            update();
        });
    }, [store]);

    useEffect(() => {
        setInterval(() => {
            // store.update((_, helpers) => {
            //     console.log("Hello?");
            //     helpers.setActiveFieldId("hello.person.firstName");
            // });
            // store.update((_, helpers) => {
            //     helpers.updateFieldStatus("hello.person", status => {
            //         status.touched = true;
            //     });
            // });
        }, 1000);
    }, []);

    return (
        <div {...props}>
            <div className="fields">
                <JSONTree
                    data={state}
                    theme="bright"
                    invertTheme
                    shouldExpandNode={() => true}
                    hideRoot
                    // labelRenderer={(keyPath: string[], nodeType?: string, expanded?: boolean, expandable?: boolean): JSX.Element => {
                    //     return <div>{nodeType}</div>;
                    // }}
                    valueRenderer={(displayValue, value) => {
                        if (typeof value === "function") {
                            const functionValue = value as Function;
                            if (functionValue.name !== "") {
                                return <span>{`${functionValue.name}() => {}`}</span>;
                            }
                            return <span>{"<anonymous>() => {}"}</span>;
                        }
                        return <span>{displayValue}</span>;
                    }}
                />
            </div>
        </div>
    );
};

const StoreResult = (): JSX.Element => {
    const { state } = useStoreState();
    return <pre className="store-result">{JSON.stringify(state.getValue(state), null, 4)}</pre>;
};

const FormRender = (props: {
    fieldDeps?: string[];
    children: (state: FieldState<any, any>, store: Store<FieldState<any, any>>) => React.ReactNode;
}): JSX.Element => {
    const { state, store } = useStoreState();

    return <>{props.children(state, store)}</>;
};

const Layout = (props: FormProps & { children: React.ReactNode }): JSX.Element => {
    const { children, ...restProps } = props;
    // setTimeout(() => console.clear());
    return (
        <Form className="form-debug-container" {...restProps}>
            <div className="form-container">
                <pre>
                    Form stores:
                    <FormsRegistry />
                </pre>
                {children}
            </div>
            <StoreStateJson className="form-store-container" />
        </Form>
    );
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useForceUpdate(): () => void {
    const [, setTick] = useState(0);
    const update = useCallback(() => {
        setTick(tick => tick + 1);
    }, []);
    return update;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Print = (props: { name: string; refObj: any; result?: string }): JSX.Element => {
    const [, set] = useState();
    useEffect(() => {
        console.log(`${name}: Print effect:`, props.refObj);
        set("");
    }, [props.refObj]);
    console.log(`${name}: Print render`, props.refObj);
    return (
        <div>
            {/* <pre>FieldRef: {JSON.stringify(props.refObj)}</pre>
            <pre>FieldRef fieldId: {JSON.stringify(props.refObj?.fieldId)}</pre> */}
        </div>
    );
};

const Test = (): JSX.Element => {
    const [value, setValue] = useState(0);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const onClick = (): void => {
        setValue(value + 1);
    };

    // const firstNameRef = useRef<string>(null);
    const firstNameRef = useFieldRef();
    const personGroupRef = useFieldRef();

    return (
        <Group name="hello">
            <Group name="person" fieldRef={personGroupRef}>
                <PersonContactsValidator />
                <button type="button" onClick={onClick}>
                    Do it
                </button>
                <label>
                    First name
                    <Text fieldRef={firstNameRef} name="firstName" initialValue="Jane">
                        <LengthValidator min={5} max={10} />
                        <WaitValidator time={250} />
                        <UsernameValidator wait={500} error="The username is already taken." takenUsernames={["jane", "janet"]} />
                        {/* <LengthValidatorAsync min={5} max={10} wait={500} /> */}
                    </Text>
                    <Reset />
                    <FormRender fieldDeps={firstNameRef.fieldId == null ? undefined : [firstNameRef.fieldId]}>
                        {(_state, store) => {
                            {
                                /* <FormRender fieldDeps={personGroupRef.fieldId == null ? undefined : [personGroupRef.fieldId]}> */
                            }
                            if (firstNameRef.fieldId == null) {
                                return null;
                            }

                            const fieldState = store.helpers.selectField(firstNameRef.fieldId);
                            if (fieldState == null) {
                                return null;
                            }

                            const warnings = fieldState.validation.results.filter(x => x.type === ValidationResultType.Warning);
                            const errors = fieldState.validation.results.filter(x => x.type === ValidationResultType.Error);

                            const cancelButton = (
                                <button
                                    type="button"
                                    onClick={() => {
                                        fieldState.validation.currentValidation?.cancellationToken.cancel();
                                    }}
                                >
                                    Cancel validation
                                </button>
                            );

                            const loader =
                                fieldState.validation.currentValidation != null ? (
                                    <>
                                        <img key="validation-loader" src={Loader.src} width={25} />
                                        {cancelButton}
                                    </>
                                ) : null;

                            return (
                                <div>
                                    {loader}
                                    {warnings.length === 0 ? null : (
                                        <div>
                                            Warnings:
                                            {warnings.map((warning, index) => (
                                                <div key={`warning-${index}`}>{warning.message}</div>
                                            ))}
                                        </div>
                                    )}
                                    {errors.length === 0 ? null : (
                                        <div>
                                            Errors:
                                            {errors.map((error, index) => (
                                                <div key={`error-${index}`}>{error.message}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }}
                    </FormRender>
                </label>
                <label>
                    Last name
                    <Text name="lastName" initialValue="Doe" />
                </label>
                <label>
                    Age
                    <Number name="age" initialValue={19} />
                </label>
                {/* <label>
                    Sex
                    <RadioGroup name="sex" initialValue="female">
                        <label>
                            <Radio value="female" />
                            Female
                        </label>
                        <label>
                            <Radio value="male" />
                            Male
                        </label>
                    </RadioGroup>
                </label>
                <label>
                    Hobbies
                    <Group name="hobbies">
                        <label>
                            <Checkbox name="rugby" initialValue />
                            Rugby
                        </label>
                        <label>
                            <Checkbox name="basketball" />
                            Basketball
                        </label>
                        <label>
                            <Checkbox name="football" initialValue />
                            Football
                        </label>
                    </Group>
                </label> */}
            </Group>
        </Group>
    );
};

const TestApp1 = (): JSX.Element => {
    const items = Array(1)
        .fill(0)
        .map((_, index) => {
            return (
                <Group key={`test${index}`} name={`test${index}`}>
                    <Test />
                </Group>
            );
        });
    return (
        <Layout>
            {items}
            {/* <Text name="firstName" fieldRef={firstNameRef}>
    <WaitValidator time={1000} />
    <LengthValidator min={5} max={7} />
</Text> */}
            {/* <div>
    <button
        type="button"
        onClick={() => {
            setInitialValue("Jane");
        }}
    >
        Jane
    </button>
</div> */}
            {/* <ValidationResults fieldId={firstNameRef.fieldId} /> */}
            <StoreResult />
        </Layout>
    );
};

const ValidatorsOrderTest = (): JSX.Element => {
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

    const [testValidators, setTestValidators] = useState<JSX.Element[]>();

    const onClickOrder1 = (): void => {
        // console.group("Validating Order #1...");
        setTestValidators([errorValidator, waitValidator, warningValidator]);
        // setTimeout(() => {
        //     console.groupEnd();
        // }, 0);
    };

    const onClickOrder2 = (): void => {
        // console.group("Validating Order #2...");
        setTestValidators([warningValidator, waitValidator, errorValidator]);
        // setTimeout(() => {
        //     console.groupEnd();
        // }, 0);
    };

    const onClickValidate = useCallback(() => {
        store.update((_, helpers) => {
            if (testFieldRef.fieldId == null) {
                throw new Error("testFieldRef.fieldId is undefined.");
            }
            const validationUpdater = helpers.getUpdater<ValidationUpdater>("validation");
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            validationUpdater.validateField(testFieldRef.fieldId);
        });
    }, [store, testFieldRef.fieldId]);

    return (
        <>
            <label>
                Test:
                <Text name="test" fieldRef={testFieldRef} initialValue="Holla">
                    {testValidators}
                </Text>
                <button type="button" onClick={onClickOrder1}>
                    Order #1
                </button>
                <button type="button" onClick={onClickOrder2}>
                    Order #2
                </button>
                <button type="button" onClick={onClickValidate}>
                    Validate
                </button>
                <ValidationResults fieldId={testFieldRef.fieldId} />
            </label>
            {/* <Group name="person" fieldRef={personFieldRef}>
                <label>
                    First name
                    <Text name="firstName" initialValue="Jane" fieldRef={firstNameRef}>
                        <WaitValidator time={800} />
                        <Validator<string>
                            shouldValidate={value => value != null && value.length > 0}
                            validate={(value, helpers) => {
                                if (value !== "Jane") {
                                    return [
                                        helpers.error(`First name ${value} is already taken.`),
                                        helpers.warning(
                                            `Going for a walk is a good way to boost your creativity. You consider trying that.`
                                        )
                                    ];
                                }

                                return [];
                            }}
                        />
                    </Text>
                    <ValidationResults fieldId={firstNameRef.fieldId} />
                </label>
                <label>
                    Last name
                    <Text name="lastName" initialValue="Doe" fieldRef={lastNameRef} />
                    <ValidationResults fieldId={lastNameRef.fieldId} />
                </label>
            </Group>

            <ValidationResults fieldId={personFieldRef.fieldId} /> */}

            <Reset />
            <Clear />
            <Submit />

            <StoreResult />
        </>
    );
};

const App = (): JSX.Element => {
    type FormValue = {
        person: {
            firstName: string;
            lastName: string;
        };
    };
    return (
        <>
            <Form
                className="form-debug-container"
                onSubmit={async (event, store, validationHelpers) => {
                    const formValue = store.helpers.getFormValue() as FormValue;
                    console.log(JSON.stringify(formValue, null, 4));

                    await new Promise(resolve => setTimeout(resolve, 1000));

                    const errorsFromServer: NestedDictionary<ValidationResultOrString[]> = {
                        person: {
                            // firstName: [`First name ${formValue.person.firstName}`],
                            firstName: [validationHelpers.warning(`First name ${formValue.person.firstName}`, "925")],
                            lastName: [validationHelpers.warning(`Last name ${formValue.person.lastName}`)]
                        }
                    };

                    console.log("Errors from server:", errorsFromServer);

                    store.update((_, helpers) => {
                        const validationUpdater = helpers.getUpdater<ValidationUpdater>("validation");
                        validationUpdater.setFormErrors(errorsFromServer);
                    });
                }}
            >
                <div className="form-container">
                    {/* <pre>
                        Form stores:
                        <FormsRegistry />
                    </pre> */}
                    <ValidatorsOrderTest />
                </div>
                <StoreStateJson className="form-store-container" />
            </Form>
        </>
    );
};

ReactDOM.render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>,
    document.getElementById("root")
);
