import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Form, useFieldContext, Text, Group } from "@reactway/forms";
import { FormsRegistry } from "./forms-registry";
import { ErrorBoundary } from "./error-boundary";
import JSONTree from "react-json-tree";

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

const Layout = (props: { children: React.ReactNode }): JSX.Element => {
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
                        <Text name="firstName" initialValue="Hello" />
                    </label>
                    <label>
                        Last name
                        <Text name="lastName" />
                    </label>
                </Group>
            </Group>
        </Layout>
    );
};

ReactDOM.render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>,
    document.getElementById("root")
);
