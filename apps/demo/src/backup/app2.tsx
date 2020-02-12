import "./string-helpers";
import React, { useState } from "react";
import { StateInspector } from "reinspect";
import ReactDOM from "react-dom";
import { Text, Form, Group, FormProps } from "@reactway/forms";
import { getFieldValue, selectField } from "@reactway/forms-core";

import { DebugContainer } from "./debug-container";

import { CustomModifier, Modification } from "./custom-modifier";
import { TestButton } from "./test-button";
import { LengthValidator } from "./length-validator";
import { FormRender } from "./form-render";
import { parseNumber, NumberModifier } from "./number-modifier";

import "./app.scss";
import { PercentageModifier } from "./percentage-modifier";

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
                                <Text name="firstName" initialValue="123.45">
                                    {/* <LengthValidator min={3} max={10} /> */}
                                    {/* {toggle ? <CustomModifier modification={Modification.Uppercase} /> : null} */}
                                    <NumberModifier />
                                </Text>
                                <FormRender>
                                    {state => {
                                        const fieldState = selectField(state, "person.firstName");

                                        if (fieldState == null) {
                                            return null;
                                        }

                                        const validationResults = fieldState.validation.results;

                                        if (validationResults.length === 0) {
                                            return null;
                                        }

                                        return (
                                            <>
                                                {validationResults.map((x, index) => (
                                                    <span key={`person.firstName-validation-results-${index}`}>{x.message}</span>
                                                ))}
                                            </>
                                        );
                                    }}
                                </FormRender>
                                <FormRender>
                                    {state => {
                                        const fieldState = selectField(state, "person.firstName");

                                        if (fieldState == null) {
                                            return null;
                                        }

                                        const fieldValue = fieldState.getValue(fieldState);

                                        return (
                                            <div>
                                                <pre>{JSON.stringify(parseNumber(fieldValue, ".", ","), null, 4)}</pre>
                                                <pre>{JSON.stringify(fieldState, null, 4)}</pre>
                                            </div>
                                        );
                                    }}
                                </FormRender>
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

                    {/* <div className="form-store-container"><FormStore /></div> */}
                </div>
                <DebugContainer />
            </Form>
        </StateInspector>
    );
};

ReactDOM.render(<App />, document.getElementById("root"));