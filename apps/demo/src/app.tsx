import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import JSONTree from "react-json-tree";

import {
    FormProps,
    Form,
    TextInput,
    useFieldContext,
    useStoreState,
    useFieldRef,
    ValidationResults,
    NumberInput,
    Group
} from "@reactway/forms";

import { ErrorBoundary } from "./error-boundary";
import { FormsRegistry } from "./forms-registry";
import { LengthValidator } from "./validators/length-validator";
import { ValidatorsOrderTest } from "./examples/validators-order-test";

import "./app.scss";

const Layout = (props: FormProps & { children: React.ReactNode }): JSX.Element => {
    const { children, ...restProps } = props;

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
        <>
            <label>
                First name
                <TextInput name="firstName" fieldRef={firstNameRef}>
                    <LengthValidator min={5} max={10} />
                </TextInput>
                <ValidationResults fieldSelector={firstNameRef.fieldSelector} />
            </label>
            <label>
                Age
                <NumberInput name="age" initialValue={123.45} />
            </label>
            <StoreResult />
            <Group name="validatorsOrderTest">
                <ValidatorsOrderTest />
            </Group>
        </>
    );
};

const LayoutShell = (): JSX.Element => {
    return (
        <Layout>
            <App />
        </Layout>
    );
};

const FormShell = (): JSX.Element => {
    return (
        <Form>
            <App />
        </Form>
    );
};

ReactDOM.render(
    <ErrorBoundary>
        <FormShell />
    </ErrorBoundary>,
    document.getElementById("root")
);
