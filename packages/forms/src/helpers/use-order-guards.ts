import { useEffect, DependencyList, useMemo } from "react";
import { ValidationUpdater, assertFieldIsDefined, FieldOrderGuards, OrderGuard } from "@reactway/forms-core";
import { useFieldContext } from "../components";

export function useOrderGuards(fieldId: string): FieldOrderGuards {
    const { store } = useFieldContext();

    const { reportIndex: updateIndex } = useOrderGuard(() => {
        return {
            getCurrentOrder: () => {
                const currentFieldState = store.helpers.selectField(fieldId);
                assertFieldIsDefined(currentFieldState, fieldId);
                return currentFieldState.validation.validatorsOrder;
            },
            orderUpdater: newOrder => {
                if (fieldId == null) {
                    return;
                }

                store.update((_, helpers) => {
                    const fieldState = helpers.selectField(fieldId);
                    assertFieldIsDefined(fieldState, fieldId);
                    fieldState.validation.validatorsOrder = newOrder;

                    const validationUpdater = helpers.getUpdater<ValidationUpdater>("validation");
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    validationUpdater.validateField(fieldId);
                });
            }
        };
    }, [fieldId, store]);

    return {
        reportValidatorIndex: updateIndex
    };
}

interface OrderGuardCallbacks {
    getCurrentOrder: () => readonly string[] | void;
    orderUpdater: (newOrder: readonly string[]) => void;
}

function useOrderGuard(callbacksFactory: () => OrderGuardCallbacks, deps: DependencyList): OrderGuard {
    const callbacks = useMemo(callbacksFactory, deps);

    const mutableOrder: string[] = [];
    const updateIndex = (id: string): void => {
        mutableOrder.push(id);
    };

    useEffect(() => {
        const currentOrder = callbacks.getCurrentOrder();

        if (currentOrder == null) {
            return;
        }

        // TODO: Review
        if (mutableOrder.length === 0) {
            return;
        }

        if (isOrderUpToDate(currentOrder, mutableOrder)) {
            return;
        }

        callbacks.orderUpdater([...mutableOrder]);
    });

    return {
        reportIndex: updateIndex
    };
}

function isOrderUpToDate(currentOrder: readonly string[], newOrder: readonly string[]): boolean {
    if (currentOrder.length !== newOrder.length) {
        return false;
    }

    return currentOrder.every((value, index) => value === newOrder[index]);
}
