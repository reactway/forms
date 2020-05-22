import React from "react";
import ReactDOM from "react-dom";
import { Router } from "@reach/router";
import Debug from "debug";

import { ErrorBoundary } from "./error-boundary";
import { NavigationBar } from "./components/navigation-bar";
// Routes
import { Index } from "./routes/index";
import { AllFields } from "./routes/all-fields";
import { Validation } from "./routes/validation";
import { FieldRef } from "./routes/field-ref";

import "./app.scss";

Debug.enable("*,-sockjs-client:*");

const App = (): JSX.Element => {
    return (
        <ErrorBoundary>
            <NavigationBar />
            <Router>
                <Index path="/" />
                <AllFields path="/all-fields" />
                <Validation path="/validation" />
                <FieldRef path="/field-ref" />
            </Router>
        </ErrorBoundary>
    );
};

ReactDOM.render(<App />, document.getElementById("root"));
