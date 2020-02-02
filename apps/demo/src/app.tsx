import React from "react";
import ReactDOM from "react-dom";
import { Form, useFieldContext, Text } from "@reactway/forms";
import { FormsRegistry } from "./forms-registry";

const StoreStateJson = (): JSX.Element => {
    const { store } = useFieldContext();

    return <pre>{JSON.stringify(store.getState(), null, 4)}</pre>;
};

const App = (): JSX.Element => {
    return (
        <div>
            <pre>
                Form stores:
                <FormsRegistry />
            </pre>
            <Form>
                <label>
                    <Text name="firstName" />
                </label>
                <StoreStateJson />
            </Form>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById("root"));
