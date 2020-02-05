import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Form, useFieldContext, Text, Group } from "@reactway/forms";
import { FormsRegistry } from "./forms-registry";
import { ErrorBoundary } from "./error-boundary";

import "./app.scss";

const StoreStateJson = (): JSX.Element => {
    const { store } = useFieldContext();
    const [state, setState] = useState(store.getState());

    useEffect(() => {
        return store.addListener(() => {
            setState(store.getState());
        });
    }, [store]);

    return <pre>{JSON.stringify(state, null, 2)}</pre>;
};

const App = (): JSX.Element => {
    return (
        <div>
            <pre>
                Form stores:
                <FormsRegistry />
            </pre>
            <Form>
                <Group name="hello">
                    <Group name="person">
                        <label>
                            First name
                            <Text name="firstName" />
                        </label>
                        <label>
                            Last name
                            <Text name="lastName" />
                        </label>
                    </Group>
                </Group>
                <StoreStateJson />
            </Form>
        </div>
    );
};

ReactDOM.render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>,
    document.getElementById("root")
);
