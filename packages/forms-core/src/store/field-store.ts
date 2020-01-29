import { TinyEmitter } from "@reactway/tiny-emitter";
import produce, { Draft } from "immer";

import { FieldState } from "../contracts/field-state";
import {
    UpdateFieldStoreHelpers,
    constructUpdateFieldStoreHelpers,
    FieldStoreHelpers,
    constructFieldStoreHelpers
} from "./field-store-helpers";

export class FieldStore<TFieldState extends FieldState<any, any>> extends TinyEmitter {
    constructor(initialStateFactory: () => TFieldState) {
        super();

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.state = produce<TFieldState>(initialStateFactory(), () => {});
    }

    // Both values will be set in constructor via this.state setter.
    private _state!: TFieldState;
    private _helpers!: FieldStoreHelpers;

    private get state(): TFieldState {
        return this._state;
    }

    private set state(value: TFieldState) {
        this._state = value;
        this._helpers = constructFieldStoreHelpers(this._state, {});
    }

    public get helpers(): FieldStoreHelpers {
        return this._helpers;
    }

    public getState(): TFieldState {
        return this.state;
    }

    public select(selector: (state: TFieldState, helpers: FieldStoreHelpers) => void): void {
        selector(this.getState(), this.helpers);
    }

    // TODO: Draft with readonly `status`
    public update(updater: (draft: Draft<TFieldState>, helpers: UpdateFieldStoreHelpers) => void): void {
        const newState = produce(this.state, draft => {
            return updater(draft, constructUpdateFieldStoreHelpers(this, draft, {}));
        });

        if (this.state === newState) {
            return;
        }

        this.state = newState;
        this.emit();
    }
}
