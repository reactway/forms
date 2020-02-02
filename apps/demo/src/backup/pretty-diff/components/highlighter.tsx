import React, { useContext, createContext, PropsWithChildren } from "react";
import { animated } from "react-spring";
import { Keyframes } from "react-spring/renderprops";
import { isEqualTypes } from "../helpers";

export enum HighlighterState {
    None = "none",
    New = "new",
    Changed = "changed",
    Removed = "removed"
}

export function getHighlighterState(prev: unknown, current: unknown): HighlighterState {
    if (!isEqualTypes(prev, current)) {
        // Element has changed.
        return HighlighterState.Changed;
    }

    if (prev === undefined && current !== undefined) {
        // Current element is added.
        return HighlighterState.New;
    } else if (prev !== undefined && current === undefined) {
        // Current element is removed.
        return HighlighterState.Removed;
    }

    if (typeof current !== "object" && !Array.isArray(current) && JSON.stringify(prev) !== JSON.stringify(current)) {
        return HighlighterState.Changed;
    }

    return HighlighterState.None;
}

interface HighlighterContextData {
    state: HighlighterState;
    styles?: React.CSSProperties;
}

const HighlighterContext = createContext<HighlighterContextData>({
    state: HighlighterState.None
});

const HighlighterContainer = (Keyframes.Spring({
    [HighlighterState.None]: { backgroundColor: "white", color: "black" },
    [HighlighterState.Changed]: {
        backgroundColor: "#9E3699",
        color: "white"
    },
    [HighlighterState.New]: {
        backgroundColor: "#93AA64",
        color: "white"
    },
    [HighlighterState.Removed]: [
        {
            backgroundColor: "#D13532",
            color: "white"
        },
        { backgroundColor: "white", color: "black" }
    ]
}) as unknown) as (props: { state?: string; children: (styles: React.CSSProperties) => JSX.Element }) => JSX.Element;

export interface HighlighterProps {
    state: HighlighterState;
}

export const Highlighter = (props: PropsWithChildren<HighlighterProps>): JSX.Element => {
    const { children, state } = props;
    const parentStyles = useContext(HighlighterContext);

    if (parentStyles.styles != null && parentStyles.state !== HighlighterState.None) {
        return <animated.span style={parentStyles.styles}>{children}</animated.span>;
    }

    return (
        <HighlighterContainer state={state}>
            {styles => (
                <animated.span style={styles} data-state={state}>
                    <HighlighterContext.Provider value={{ state, styles }}>{children}</HighlighterContext.Provider>
                </animated.span>
            )}
        </HighlighterContainer>
    );
};
