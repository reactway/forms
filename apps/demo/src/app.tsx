import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Form, useFieldContext, Text, Group } from "@reactway/forms";
import { FormsRegistry } from "./forms-registry";
import { ErrorBoundary } from "./error-boundary";

import "./app.scss";

// (window as any).debugState = true;

const StoreStateJson = (): JSX.Element => {
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
        <pre>
            {JSON.stringify(
                state,
                (_key, value) => {
                    if (typeof value === "function") {
                        const functionValue = value as Function;
                        if (functionValue.name !== "") {
                            return functionValue.name;
                        }
                        return "anonymous () => {}";
                    }
                    return value;
                },
                2
            )}
        </pre>
    );
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
                            <Text name="firstName" initialValue="Hello" />
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
