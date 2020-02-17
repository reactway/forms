import {
    FieldState,
    Initial,
    ValueUpdater,
    ValidationUpdater,
    InputFieldData,
    RenderValue,
    FieldStateData,
    FieldStateValue
} from "@reactway/forms-core";
import { useCallback } from "react";
import { useFieldContext } from "../components";
import { UseFieldResult, useField } from "./use-field";
import { FieldRef } from ".";

export interface InputElementProps<TElement, TFieldState extends FieldState<any, any>> {
    value: FieldStateValue<TFieldState> | RenderValue<FieldStateData<TFieldState>>;

    // Form events
    onChange: React.ChangeEventHandler<TElement>;
    // onBeforeInput?: React.FormEventHandler<TElement>;
    // onInput?: React.FormEventHandler<TElement>;
    // onReset?: React.FormEventHandler<TElement>;
    // onSubmit: React.FormEventHandler<TElement>;
    // onInvalid?: React.FormEventHandler<TElement>;

    // Focus events
    onFocus: React.FocusEventHandler<TElement>;
    onBlur: React.FocusEventHandler<TElement>;

    // Keyboard events
    onKeyDown?: React.KeyboardEventHandler<TElement>;
    onKeyPress?: React.KeyboardEventHandler<TElement>;
    onKeyUp?: React.KeyboardEventHandler<TElement>;

    // Mouse events
    onClick?: React.MouseEventHandler<TElement>;
    // onContextMenu?: React.MouseEventHandler<TElement>;
    // onDoubleClick?: React.MouseEventHandler<TElement>;
    // onDrag?: React.DragEventHandler<TElement>;
    // onDragEnd?: React.DragEventHandler<TElement>;
    // onDragEnter?: React.DragEventHandler<TElement>;
    // onDragExit?: React.DragEventHandler<TElement>;
    // onDragLeave?: React.DragEventHandler<TElement>;
    // onDragOver?: React.DragEventHandler<TElement>;
    // onDragStart?: React.DragEventHandler<TElement>;
    // onDrop?: React.DragEventHandler<TElement>;
    // onMouseDown?: React.MouseEventHandler<TElement>;
    // onMouseEnter?: React.MouseEventHandler<TElement>;
    // onMouseLeave?: React.MouseEventHandler<TElement>;
    // onMouseMove?: React.MouseEventHandler<TElement>;
    // onMouseOut?: React.MouseEventHandler<TElement>;
    // onMouseOver?: React.MouseEventHandler<TElement>;
    // onMouseUp?: React.MouseEventHandler<TElement>;

    // Selection Events
    onSelect?: React.ReactEventHandler<TElement>;

    // Touch Events
    onTouchCancel?: React.TouchEventHandler<TElement>;
    onTouchCancelCapture?: React.TouchEventHandler<TElement>;
    onTouchEnd?: React.TouchEventHandler<TElement>;
    onTouchEndCapture?: React.TouchEventHandler<TElement>;
    onTouchMove?: React.TouchEventHandler<TElement>;
    onTouchMoveCapture?: React.TouchEventHandler<TElement>;
    onTouchStart?: React.TouchEventHandler<TElement>;
    onTouchStartCapture?: React.TouchEventHandler<TElement>;

    // UI Events
    onScroll?: React.UIEventHandler<TElement>;

    // Wheel Events
    onWheel?: React.WheelEventHandler<TElement>;
}

export interface UseInputFieldResult<TElement, TFieldState extends FieldState<any, any>> extends UseFieldResult<TElement, TFieldState> {
    inputElementProps: InputElementProps<TElement, TFieldState>;
}

export type InputElement = HTMLInputElement;

export interface UseInputFieldEventHooks<TElement> {
    getValueFromChangeEvent?: (event: React.ChangeEvent<TElement>) => any;
}

export function getRenderValue<TFieldState extends FieldState<any, any>>(
    fieldState: TFieldState
): RenderValue<FieldStateData<TFieldState>> {
    if (fieldState.data.transientValue != null) {
        return fieldState.data.transientValue;
    }

    const modifiers = fieldState.data.modifiers;
    if (modifiers.length === 0) {
        return fieldState.data.currentValue;
    }

    let renderValue = fieldState.data.currentValue;

    for (const modifier of modifiers) {
        renderValue = modifier.format(renderValue);
    }

    return renderValue;
}

export function useInputField<TElement extends InputElement, TFieldState extends FieldState<any, InputFieldData<any, any>>>(
    fieldName: string,
    fieldRef: FieldRef | undefined,
    initialStateFactory: () => Initial<TFieldState>,
    eventHooks?: UseInputFieldEventHooks<TElement>
): UseInputFieldResult<TElement, TFieldState> {
    type Result = UseInputFieldResult<TElement, TFieldState>["inputElementProps"];
    const fieldResult = useField(fieldName, fieldRef, initialStateFactory);
    const { state: fieldState, id: fieldId } = fieldResult;

    const { store } = useFieldContext();
    (window as any).store = store;

    type EventHooks = NonNullable<typeof eventHooks>;
    const getValueFromEventDefault: EventHooks["getValueFromChangeEvent"] = event => {
        return event.currentTarget.value;
    };

    const getValueFromChangeEvent = eventHooks?.getValueFromChangeEvent ?? getValueFromEventDefault;

    const onChange = useCallback<Result["onChange"]>(
        event => {
            const value = getValueFromChangeEvent(event);
            store.update((draft, helpers) => {
                const valueUpdater = helpers.getUpdater<ValueUpdater>("value");
                valueUpdater.updateFieldValue(fieldId, value);

                const validationUpdater = helpers.getUpdater<ValidationUpdater>("validation");
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                validationUpdater.validateField(fieldId);
            });
        },
        [fieldId, getValueFromChangeEvent, store]
    );

    const onFocus = useCallback<Result["onFocus"]>(
        _event => {
            console.log("Focusing field.");
            store.update((draft, helpers) => {
                helpers.setActiveFieldId(fieldId);
                helpers.updateFieldStatus(fieldId, status => {
                    status.touched = true;
                });
            });
        },
        [fieldId, store]
    );

    const onBlur = useCallback<Result["onBlur"]>(
        _event => {
            store.update((_draft, helpers) => {
                helpers.setActiveFieldId(undefined);
            });
        },
        [store]
    );

    const value = getRenderValue<TFieldState>(fieldState);

    return {
        ...fieldResult,
        inputElementProps: {
            onChange,
            onFocus,
            onBlur,
            value
        }
    };
}
