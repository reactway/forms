import { useEffect, DependencyList, useMemo } from "react";
import {
    ValidationUpdater,
    assertFieldIsDefined,
    OrderGuard,
    ValidatorsOrderGuard,
    ModifiersOrderGuard,
    StoreHelpers,
    FieldState,
    isInputFieldData,
    ValueUpdater,
    FieldSelector
} from "@reactway/forms-core";
import { useFieldContext } from "../components";

export function useValidatorsOrderGuard(fieldSelector: FieldSelector): ValidatorsOrderGuard {
    const { store } = useFieldContext();

    const { reportIndex } = useOrderGuard(() => {
        return {
            getCurrentOrder: helpers => {
                const currentFieldState = helpers.selectField(fieldSelector);
                assertFieldIsDefined(currentFieldState, fieldSelector);
                return currentFieldState.validation.validatorsOrder;
            },
            orderUpdater: newOrder => {
                store.update(helpers => {
                    const fieldState = helpers.selectField(fieldSelector);
                    assertFieldIsDefined(fieldState, fieldSelector);
                    fieldState.validation.validatorsOrder = newOrder;

                    const validationUpdater = helpers.getUpdater<ValidationUpdater>("validation");
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    validationUpdater.validateField(fieldSelector);
                });
            }
        };
    }, [fieldSelector, store]);

    return {
        reportValidatorIndex: reportIndex
    };
}

export function useModifiersOrderGuard(fieldId: string): ModifiersOrderGuard {
    const { store } = useFieldContext();

    const { reportIndex } = useOrderGuard(() => {
        return {
            getCurrentOrder: helpers => {
                const currentFieldState = helpers.selectField(fieldId);
                assertFieldIsDefined(currentFieldState, fieldId);

                if (!isInputFieldData(currentFieldState.data)) {
                    throw new Error("Only input fields support modifiers.");
                }

                return currentFieldState.data.modifiersOrder;
            },
            orderUpdater: newOrder => {
                store.update(helpers => {
                    const fieldState = helpers.selectField(fieldId);
                    assertFieldIsDefined(fieldState, fieldId);

                    if (!isInputFieldData(fieldState.data)) {
                        throw new Error("Only input fields support modifiers.");
                    }

                    fieldState.data.modifiersOrder = newOrder;

                    const value = fieldState.data.transientValue ?? fieldState.data.currentValue;
                    const valueUpdater = helpers.getUpdater<ValueUpdater>("value");
                    valueUpdater.updateFieldValue(fieldId, value);
                });
            }
        };
    }, [fieldId, store]);

    return {
        reportModifierIndex: reportIndex
    };
}

interface OrderGuardCallbacks {
    getCurrentOrder: (helpers: StoreHelpers, state: FieldState<any, any>) => readonly string[] | void;
    orderUpdater: (newOrder: readonly string[]) => void;
}

function useOrderGuard(callbacksFactory: () => OrderGuardCallbacks, deps: DependencyList): OrderGuard {
    const { store } = useFieldContext();
    const callbacks = useMemo(callbacksFactory, deps);

    const mutableOrder: string[] = [];
    const reportIndex = (id: string): void => {
        mutableOrder.push(id);
    };

    useEffect(() => {
        const currentOrder = callbacks.getCurrentOrder(store.helpers, store.getState());

        if (currentOrder == null || isOrderUpToDate(currentOrder, mutableOrder)) {
            return;
        }

        callbacks.orderUpdater([...mutableOrder]);
    });

    return {
        reportIndex
    };
}

function isOrderUpToDate(currentOrder: readonly string[], newOrder: readonly string[]): boolean {
    if (currentOrder.length !== newOrder.length) {
        return false;
    }

    return currentOrder.every((value, index) => value === newOrder[index]);
}
