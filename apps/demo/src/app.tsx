import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { Form, useFieldContext, Text, Group, Number, RadioGroup, Radio, Checkbox, useStoreState } from "@reactway/forms";
import JSONTree from "react-json-tree";
import { FormsRegistry } from "./forms-registry";
import { ErrorBoundary } from "./error-boundary";

import "./app.scss";

// (window as any).debugState = true;

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
    return <pre>{JSON.stringify(state.getValue(state), null, 4)}</pre>;
};

const Layout = (props: { children: React.ReactNode }): JSX.Element => {
    setTimeout(() => console.clear());
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

const App = (): JSX.Element => {
    return (
        <Layout>
            <Group name="hello">
                <Group name="person">
                    <label>
                        First name
                        <Text name="firstName" initialValue="Jane" />
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
