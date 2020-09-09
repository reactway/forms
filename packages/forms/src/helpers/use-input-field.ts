import { useCallback } from "react";
import {
    FieldState,
    Initial,
    ValueUpdater,
    ValidationUpdater,
    InputFieldData,
    RenderValue,
    FieldStateData,
    FieldStateValue,
    constructInputFieldHelpers,
    InputFieldHelpers,
    TextSelection,
    TextSelectionDirection,
    assertFieldIsDefined,
    OmitStrict,
    PartialKeys,
    InputValues,
    getInitialInputData
} from "@reactway/forms-core";

// TODO: import type.
import { Optional } from "utility-types";

import { useFieldContext } from "../components";
import { UseFieldResult, useField } from "./use-field";
import { useValidatorsOrderGuard, useModifiersOrderGuard } from "./use-order-guards";
import { useFieldFocusEffect } from "./use-field-focus-effect";
import { useFieldSelectionEffect } from "./use-field-selection-effect";
import { FieldRef } from "./use-field-ref";
import { useFieldValueEffect } from "./use-field-value-effect";

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
    onSelect: React.ReactEventHandler<TElement>;

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
    selectionUpdateGuard: SingleUpdateGuard;
}

export type InputTextElement = HTMLInputElement | HTMLTextAreaElement;
export type InputElement = InputTextElement | HTMLSelectElement;

export function isInputTextElement(element: InputElement): element is InputTextElement {
    return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
}

export interface UseInputFieldEventHooks<TElement> {
    getValueFromChangeEvent?: (event: React.ChangeEvent<TElement>) => any;
}

export function getRenderValue<
    TFieldState extends FieldState<any, TData>,
    TData extends InputFieldData<any, any> = FieldStateData<TFieldState>
>(fieldState: TFieldState): RenderValue<FieldStateData<TFieldState>> {
    if (fieldState.data.transientValue != null) {
        return fieldState.data.transientValue;
    }

    const modifiersKeys = Object.keys(fieldState.data.modifiers);
    if (modifiersKeys.length === 0) {
        // Field has no modifiers, thus nothing to do here.
        return fieldState.data.currentValue;
    }

    let renderValue = fieldState.data.currentValue;

    for (const modifierKey of modifiersKeys) {
        const modifier = fieldState.data.modifiers[modifierKey];

        if (modifier == null) {
            throw new Error("Should never happen.");
        }

        renderValue = modifier.format(renderValue);
    }

    return renderValue;
}

type InitialInputData<TFieldData extends InputFieldData<any, any>> = OmitStrict<
    PartialKeys<TFieldData, keyof InputFieldData<any, any>>,
    keyof InputValues<any, any>
>;

export type InitialInput<
    TFieldState extends FieldState<any, TData>,
    TData extends InputFieldData<any, any> = FieldStateData<TFieldState>
> = Initial<OmitStrict<TFieldState, "data"> & { data: InitialInputData<TFieldState["data"]> }>;

export interface InputFieldOptions<
    TElement extends InputElement,
    TFieldState extends FieldState<any, TData>,
    TData extends InputFieldData<any, any> = FieldStateData<TFieldState>
    // TODO: Resolve TRenderValue.
    // TODO: Better to resolve what keys are optional.
> {
    fieldName: string;
    fieldRef: FieldRef<TFieldState> | undefined;
    elementRef: React.RefObject<TElement>;
    initialStateFactory: () => InitialInput<TFieldState, TData>;
    eventHooks?: UseInputFieldEventHooks<TElement>;
    values?: Optional<InputValues<FieldStateValue<TFieldState>, any>, "initialValue" | "currentValue">;
}

export function useInputField<
    TElement extends InputElement,
    TFieldState extends FieldState<any, TData>,
    TData extends InputFieldData<any, any> = FieldStateData<TFieldState>
>(options: InputFieldOptions<TElement, TFieldState, TData>): UseInputFieldResult<TElement, TFieldState> {
    const { fieldName, fieldRef, elementRef, initialStateFactory, eventHooks } = options;

    type Result = UseInputFieldResult<TElement, TFieldState>["inputElementProps"];
    const fieldResult = useField<TElement, TFieldState, TData>(fieldName, fieldRef, () => {
        const fieldState = initialStateFactory();

        fieldState.data = {
            ...getInitialInputData(
                options.values?.defaultValue,
                options.values?.initialValue,
                options.values?.currentValue,
                options.values?.transientValue
            ),
            ...fieldState.data
        };

        return fieldState;
    });
    const { state: fieldState, id: fieldId } = fieldResult;

    const { store } = useFieldContext();

    type EventHooks = NonNullable<typeof eventHooks>;
    const getValueFromEventDefault: EventHooks["getValueFromChangeEvent"] = event => {
        return event.currentTarget.value;
    };

    const getValueFromChangeEvent = eventHooks?.getValueFromChangeEvent ?? getValueFromEventDefault;

    const selectionUpdateGuard = new SingleUpdateGuard();
    const onChange = useCallback<Result["onChange"]>(
        event => {
            const value = getValueFromChangeEvent(event);

            store.update(helpers => {
                const valueUpdater = helpers.getUpdater<ValueUpdater>("value");
                const textSelection = isInputTextElement(event.currentTarget) ? extractTextSelection(event.currentTarget) : undefined;
                valueUpdater.updateFieldValue(fieldId, value, textSelection);
                selectionUpdateGuard.markAsUpdated();

                const validationUpdater = helpers.getUpdater<ValidationUpdater>("validation");
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                validationUpdater.validateField(fieldId);
            });
        },
        [fieldId, getValueFromChangeEvent, selectionUpdateGuard, store]
    );

    const onFocus = useCallback<Result["onFocus"]>(
        _event => {
            store.update(helpers => {
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
            store.update(helpers => {
                helpers.setActiveFieldId(undefined);
                const blurFieldState = helpers.selectField(fieldId);
                assertFieldIsDefined(blurFieldState, fieldId);

                const inputState = blurFieldState as TFieldState;
                inputState.data.selection = undefined;
            });
        },
        [fieldId, store]
    );

    const onSelect = useCallback<Result["onSelect"]>(
        event => {
            if (selectionUpdateGuard.updated) {
                return;
            }
            event.persist();
            store.update(updateHelpers => {
                const storeFieldState = updateHelpers.selectField(fieldId);
                assertFieldIsDefined(storeFieldState, fieldId);
                const newSelection = isInputTextElement(event.currentTarget) ? extractTextSelection(event.currentTarget) : undefined;
                const textState = storeFieldState;
                textState.data.selection = newSelection;
                selectionUpdateGuard.markAsUpdated();
            });
        },
        [fieldId, selectionUpdateGuard, store]
    );

    useFieldSelectionEffect(fieldId, elementRef);
    useFieldFocusEffect(fieldId, elementRef);
    useFieldValueEffect(fieldId, options.values?.defaultValue, options.values?.initialValue, options.values?.currentValue);

    const value = getRenderValue<TFieldState, TData>(fieldState);

    return {
        ...fieldResult,
        selectionUpdateGuard,
        inputElementProps: {
            onChange,
            onFocus,
            onBlur,
            onSelect,
            value
        }
    };
}

export function useInputFieldHelpers(fieldId: string): InputFieldHelpers {
    return constructInputFieldHelpers(fieldId, {
        ...useValidatorsOrderGuard(fieldId),
        ...useModifiersOrderGuard(fieldId)
    });
}

export function extractTextSelection(element: InputTextElement): TextSelection | undefined {
    if (element.type === "checkbox") {
        return undefined;
    }

    const selectionStart = element.selectionStart;
    const selectionEnd = element.selectionEnd;

    let selectionDirection: TextSelectionDirection = "none";

    if (element.selectionDirection != null) {
        selectionDirection = element.selectionDirection as TextSelectionDirection;
    }

    if (selectionStart == null || selectionEnd == null) {
        return undefined;
    }

    return {
        selectionStart: selectionStart,
        selectionEnd: selectionEnd,
        selectionDirection: selectionDirection
    };
}

export class SingleUpdateGuard {
    protected isUpdateHandled = false;

    public get updated(): boolean {
        return this.isUpdateHandled;
    }

    public markAsUpdated(): void {
        if (this.isUpdateHandled) {
            console.error("The update was applied more than once :(");
            return;
        }
        this.isUpdateHandled = true;
    }
}
