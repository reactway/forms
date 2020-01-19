import { TinyEmitter } from "@reactway/tiny-emitter";
import produce, { Draft } from "immer";

import { FieldState } from "../contracts/field-state";
import { UpdateFieldStoreHelpers, fieldStoreHelpers } from "./field-store-helpers";

export class FieldStore<TFieldState extends FieldState<any, any>> extends TinyEmitter {
    constructor(initialStateFactory: () => TFieldState) {
        super();

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.state = produce<TFieldState>(initialStateFactory(), () => {});
    }

    private state: TFieldState;

    public getState(): TFieldState {
        return this.state;
    }

    // TODO: Draft with readonly `status`
    public update(updater: (draft: Draft<TFieldState>, helpers: UpdateFieldStoreHelpers) => void): void {
        const newState = produce(this.state, draft => {
            return updater(draft, fieldStoreHelpers(this, draft, {}));
        });

        if (this.state === newState) {
            return;
        }

        this.state = newState;
        this.emit();
    }
}
