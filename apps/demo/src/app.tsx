import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import JSONTree from "react-json-tree";

import { FormProps, Form, Text, Number, useFieldContext, useStoreState, useFieldRef, ValidationResults } from "@reactway/forms";

import { ErrorBoundary } from "./error-boundary";
import { FormsRegistry } from "./forms-registry";

import "./app.scss";
import { LengthValidator } from "./validators/length-validator";

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

    const jsonState = state;

    return (
        <div {...props}>
            <div className="fields">
                {jsonState == null ? null : (
                    <JSONTree
                        data={jsonState}
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
                )}
            </div>
        </div>
    );
};

const StoreResult = (): JSX.Element => {
    const { state } = useStoreState();
    return <pre className="store-result">{JSON.stringify(state.getValue(state), null, 4)}</pre>;
};

const App = (): JSX.Element => {
    const firstNameRef = useFieldRef();
    return (
        <Layout>
            <label>
                First name
                <Text name="firstName" fieldRef={firstNameRef}>
                    <LengthValidator min={5} max={10} />
                </Text>
                <ValidationResults fieldSelector={firstNameRef.fieldId} />
            </label>
            <label>
                Age
                <Number name="age" />
            </label>
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
