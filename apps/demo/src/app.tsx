import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from "react";
import ReactDOM from "react-dom";
import {
    Form,
    useFieldContext,
    Text,
    Group,
    Number,
    RadioGroup,
    Radio,
    Checkbox,
    useStoreState,
    useFieldRef,
    FieldRef,
    ValidationResults
} from "@reactway/forms";
import { FieldState, Store, ValidationResultType } from "@reactway/forms-core";
import JSONTree from "react-json-tree";
import { FormsRegistry } from "./forms-registry";
import { ErrorBoundary } from "./error-boundary";
import { LengthValidator } from "./validators/length-validator";
import { UsernameValidator } from "./validators/username-validator";
import { WaitValidator } from "./validators/wait-validator";
import Loader from "./assets/loader.svg";

import "./app.scss";

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
    children: (state: FieldState<any, any>, store: Store<FieldState<any, any>>) => React.ReactNode;
}): JSX.Element => {
    const { state, store } = useStoreState();

    return <>{props.children(state, store)}</>;
};

const Layout = (props: { children: React.ReactNode }): JSX.Element => {
    // setTimeout(() => console.clear());
    return (
        <Form className="form-debug-container">
            <div className="form-container">
                <pre>
                    Form stores:
                    <FormsRegistry />
                </pre>
                {props.children}
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
    console.warn("=====================");
    const firstNameRef = useFieldRef();

    return (
        <Group name="hello">
            <Group name="person">
                <button type="button" onClick={onClick}>
                    Do it
                </button>
                <label>
                    First name
                    <Text fieldRef={firstNameRef} name="firstName" initialValue="Jane">
                        <LengthValidator min={5} max={10} />
                        <WaitValidator time={1000} />
                        <UsernameValidator wait={500} error="The username is already taken." takenUsernames={["jane", "janet"]} />
                        {/* <LengthValidatorAsync min={5} max={10} wait={500} /> */}
                    </Text>
                    <FormRender>
                        {(_state, store) => {
                            if (firstNameRef.fieldId == null) {
                                return null;
                            }

                            const fieldState = store.helpers.selectField(firstNameRef.fieldId);
                            if (fieldState == null) {
                                return null;
                            }

                            const warnings = fieldState.validation.results.filter(x => x.type === ValidationResultType.Warning);
                            const errors = fieldState.validation.results.filter(x => x.type === ValidationResultType.Error);
                            const loader =
                                fieldState.validation.validationStarted != null ? (
                                    <img key="validation-loader" src={Loader.src} width={25} />
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
                    <Number name="age" initialValue={"19"} />
                </label>
                <label>
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
                </label>
            </Group>
        </Group>
    );
};

const App = (): JSX.Element => {
    const firstNameRef = useFieldRef();

    return (
        <Layout>
            <Text name="firstName" fieldRef={firstNameRef}>
                <LengthValidator min={5} max={7} />
            </Text>
            <ValidationResults fieldId={firstNameRef.fieldId} />
            <StoreResult />
        </Layout>
    );
};

ReactDOM.render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>,
    document.getElementById("root")
);
