import { TinyEmitter } from "@reactway/tiny-emitter";
import produce, { Draft } from "immer";

import { FieldState } from "../contracts/form-state";
import { Dictionary } from "../contracts/helpers";
import { FieldStoreHelpers, fieldStoreHelpers } from "./field-store-helpers";

export class FieldStore<TFieldState extends FieldState<any, any>> extends TinyEmitter {
    constructor(initialStateFactory: () => TFieldState) {
        super();

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this._state = produce<TFieldState>(initialStateFactory(), () => {});
    }

    private _state: TFieldState;
    protected fieldsSelectorCache: Dictionary<FieldState<any, any>> = {};

    private get state(): TFieldState {
        return this._state;
    }

    private set state(newState: TFieldState) {
        this._state = newState;
        this.fieldsSelectorCache = {};
    }

    public getState(): TFieldState {
        return this.state;
    }

    // TODO: Draft with readonly `status`
    public update(updater: (draft: Draft<TFieldState>, helpers: FieldStoreHelpers) => void): void {
        const newState = produce(this.state, draft => {
            return updater(draft, fieldStoreHelpers(draft, this.fieldsSelectorCache));
        });

        if (this.state === newState) {
            return;
        }

        this.state = newState;
        this.emit();
    }
}
