import React from "react";
import { Link, LinkGetProps, LinkProps } from "@reach/router";

import "./navigation-bar.scss";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
        </div>
    );
};
