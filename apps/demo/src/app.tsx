import React, { useState } from "react";
import { StateInspector } from "reinspect";
import ReactDOM from "react-dom";
import { Text, Form, Group, FormProps } from "@reactway/forms";
import { getFieldValue } from "@reactway/forms-core";

import { DebugContainer } from "./debug-container";

import { CustomModifier, Modification } from "./custom-modifier";
import { TestButton } from "./test-button";
import { FormStore } from "./form-store";

import "./app.scss";

const App: React.FC = () => {
    const [toggle, setToggle] = useState(false);

    const onSubmit: FormProps["onSubmit"] = store => {
        const value = getFieldValue(store.getState());
        console.info(JSON.stringify(value, null, 4));
    };

    return (
        <StateInspector name="App">
            <Form onSubmit={onSubmit}>
                <div className="form-debug-container">
                    <div className="form-container">
                        <Group name="person">
                            <label>
                                First name:
                                <Text name="firstName" initialValue="John">
                                    <CustomModifier modification={toggle ? Modification.Lowercase : Modification.Uppercase} />
                                </Text>
                            </label>
                            <label>
                                Last name:
                                <Text name="lastName" initialValue="Smith">
                                    <CustomModifier modification={!toggle ? Modification.Lowercase : Modification.Uppercase} />
                                </Text>
                            </label>
                        </Group>
                        <button type="submit">Submit</button>
                        <button type="button" onClick={() => setToggle(prevValue => !prevValue)}>
                            Toggle Render
                        </button>
                        <TestButton fieldId={"person.firstName"} />
                    </div>

                    <div className="form-store-container">
                        <FormStore />
                    </div>
                </div>
                <DebugContainer />
            </Form>
        </StateInspector>
    );
};

ReactDOM.render(<App />, document.getElementById("root"));
