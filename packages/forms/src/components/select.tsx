import React, { useRef, useMemo, useCallback } from "react";
import { FieldState, InputFieldData } from "@reactway/forms-core";
import { FieldRef, useFieldHelpers, useInputField, UseInputFieldEventHooks, InitialInput } from "../helpers";
import { useFieldContext, FieldContext } from "./field-context";

export type SelectValue = string | string[];
type SelectData = InputFieldData<SelectValue, SelectValue>;
export type SelectState = FieldState<SelectValue, SelectData>;

const initialState = (): InitialInput<SelectState> => {
    return {
        computedValue: false,
        data: {},
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

function resolveOptionValuesFromChildren(children: React.ReactNode): Array<{ value: string; selected: boolean }> {
    return React.Children.toArray(children)
        .filter(isOptionComponent)
        .map(x => ({ value: x.props.value, selected: x.props.selected ?? false }));
}

interface SelectMultiple {
    multiple: true;
    defaultValue?: string[];
    initialValue?: string[];
    value?: string[];
}

interface SelectNotMultiple {
    multiple?: false;
    defaultValue?: string;
    initialValue?: string;
    value?: string;
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
        defaultValue: propsDefaultValue,
        initialValue: propsInitialValue,
        value,
        fieldRef,
        multiple = false,
        ...restProps
    } = props;
    const defaultValue = useMemo(() => {
        if (propsDefaultValue == null) {
            return props.multiple === true ? [] : "";
        }
        return propsDefaultValue;
    }, [propsDefaultValue, props.multiple]);

    const selectOptions = resolveOptionValuesFromChildren(props.children);
    const cachedOptions = useMemo(() => {
        console.log("cachedOptions");
        return selectOptions;
    }, [JSON.stringify(selectOptions)]);

    const initialValue = useMemo(() => {
        console.log("initialValue");

        if (propsInitialValue != null) {
            return propsInitialValue;
        }

        if (multiple) {
            return cachedOptions.filter(x => x.selected).map(x => x.value);
        }

        if (cachedOptions.length === 0) {
            return defaultValue;
        }

        return cachedOptions[0].value;
    }, [cachedOptions, defaultValue, multiple, propsInitialValue]);

    const selectRef = useRef<HTMLSelectElement>(null);
    const { store, permanent } = useFieldContext();

    const { id: fieldId, inputElementProps } = useInputField<HTMLSelectElement, SelectState>({
        fieldName: name,
        fieldRef: fieldRef,
        elementRef: selectRef,
        initialStateFactory: () => initialState(),
        eventHooks,
        defaultValue: defaultValue,
        initialValue: initialValue,
        currentValue: value
    });
    const helpers = useFieldHelpers(fieldId);

    return (
        <select multiple={multiple} {...inputElementProps} {...restProps} ref={selectRef}>
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
