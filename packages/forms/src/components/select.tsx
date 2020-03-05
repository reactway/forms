import React, { useRef } from "react";
import { FieldState, Initial, getInitialInputData, InputFieldData } from "@reactway/forms-core";
import { FieldRef, useFieldHelpers, useInputField, UseInputFieldEventHooks } from "../helpers";
import { useFieldContext, FieldContext } from "./field-context";

export type SelectValue = string | string[];
type SelectData = InputFieldData<SelectValue, SelectValue>;
export type SelectState = FieldState<SelectValue, SelectData>;

const initialState = (defaultValue: SelectValue, initialValue: SelectValue | undefined): Initial<SelectState> => {
    return {
        computedValue: false,
        data: {
            ...getInitialInputData(defaultValue, initialValue)
        },
        getValue: state => {
            return state.data.currentValue;
        },
        setValue: (state, value) => {
            throw new Error("Not implemented.");
        }
    };
};

const eventHooks: UseInputFieldEventHooks<HTMLSelectElement> = {
    getValueFromChangeEvent: event => {
        const multiple = event.currentTarget.multiple;

        if (multiple) {
            const newValue: string[] = [];

            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < event.currentTarget.options.length; i++) {
                const option = event.currentTarget.options[i];
                if (option.selected) {
                    newValue.push(option.value);
                }
            }

            return newValue;
        }

        return event.currentTarget.value;
    }
};

function isOptionComponent(component: React.ReactNode): component is React.ReactElement<{ value: string; selected?: boolean }> {
    const x = component as any;
    return typeof x === "object" && x != null && x.type != null && typeof x.props.value === "string";
}

function resolveValueFromChildren(children: React.ReactNode, multiple = false): string | string[] | undefined {
    const options = React.Children.toArray(children)
        .filter(isOptionComponent)
        .map(x => ({ value: x.props.value, selected: x.props.selected }));

    if (multiple) {
        return options.filter(x => x.selected === true).map(x => x.value);
    }

    if (options.length === 0) {
        return undefined;
    }

    // If select does not have multiple options, then we need to get the first option value.
    return options[0].value;
}

interface SelectMultiple {
    multiple: true;
    defaultValue?: string[];
    initialValue?: string[];
}

interface SelectNotMultiple {
    multiple?: false;
    defaultValue?: string;
    initialValue?: string;
}

interface SelectBaseProps {
    name: string;
    fieldRef?: FieldRef;
    children?: React.ReactNode;
}

export type SelectProps = SelectBaseProps & (SelectMultiple | SelectNotMultiple);

export const Select = (props: SelectProps): JSX.Element => {
    // TODO: Check, where to put empty array.
    const {
        name,
        defaultValue = props.multiple === true ? [] : "",
        initialValue = resolveValueFromChildren(props.children, props.multiple),
        fieldRef,
        ...restProps
    } = props;

    const selectRef = useRef<HTMLSelectElement>(null);
    const { store, permanent } = useFieldContext();

    const { id: fieldId, inputElementProps } = useInputField({
        fieldName: name,
        fieldRef: fieldRef,
        elementRef: selectRef,
        initialStateFactory: () => initialState(defaultValue, initialValue),
        eventHooks
    });
    const helpers = useFieldHelpers(fieldId);

    return (
        <select {...inputElementProps} {...restProps} ref={selectRef}>
            <FieldContext.Provider
                value={{
                    store: store,
                    parentId: fieldId,
                    permanent,
                    parentHelpers: helpers
                }}
            >
                {props.children}
            </FieldContext.Provider>
        </select>
    );
};
