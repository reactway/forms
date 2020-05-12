import React, { useState, useEffect } from "react";
import JSONTree from "react-json-tree";
import { useFieldContext } from "@reactway/forms";

export const StoreStateJson = (props: any): JSX.Element => {
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

    const jsonState = state;

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
        <div {...props}>
            <div className="fields">
                {jsonState == null ? null : (
                    <JSONTree
                        data={jsonState}
                        theme="bright"
                        invertTheme
                        shouldExpandNode={() => true}
                        hideRoot
                        // labelRenderer={(keyPath: string[], nodeType?: string, expanded?: boolean, expandable?: boolean): JSX.Element => {
                        //     return <div>{nodeType}</div>;
                        // }}
                        valueRenderer={(displayValue, value) => {
                            if (typeof value === "function") {
                                const functionValue = value as Function;
                                if (functionValue.name !== "") {
                                    return <span>{`${functionValue.name}() => {}`}</span>;
                                }
                                return <span>{"<anonymous>() => {}"}</span>;
                            }
                            return <span>{displayValue}</span>;
                        }}
                    />
                )}
            </div>
        </div>
    );
};
