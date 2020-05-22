import React from "react";
import { Link, LinkGetProps, LinkProps } from "@reach/router";

import "./navigation-bar.scss";

const activeProps = (props: LinkGetProps) => {
    return {
        className: props.isCurrent ? "active" : undefined
    };
};

const NavLink = (props: Omit<LinkProps<any>, "ref">): JSX.Element => <Link<any> {...props} getProps={activeProps} />;

export const NavigationBar = (): JSX.Element => {
    return (
        <div className="navigation-bar">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/all-fields">All Fields</NavLink>
            <NavLink to="/validation">Validation</NavLink>
            <NavLink to="/field-ref">Field Ref</NavLink>
        </div>
    );
};
