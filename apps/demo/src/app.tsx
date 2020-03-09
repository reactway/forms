import React from "react";
import ReactDOM from "react-dom";
import { Router } from "@reach/router";

import { ErrorBoundary } from "./error-boundary";
import { NavigationBar } from "./components/navigation-bar";
// Routes
import { Index } from "./routes/index";
import { AllFields } from "./routes/all-fields";

import "./app.scss";

const App = (): JSX.Element => {
    return (
        <ErrorBoundary>
            <NavigationBar />
            <Router>
                <Index path="/" />
                <AllFields path="/all-fields" />
            </Router>
        </ErrorBoundary>
    );
};

ReactDOM.render(<App />, document.getElementById("root"));
