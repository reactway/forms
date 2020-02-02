import { TinyEmitter } from "@reactway/tiny-emitter";
import produce, { Draft } from "immer";
import { FieldState, StoreHelpers, UpdateStoreHelpers } from "./contracts";
import { constructStoreHelpers, constructUpdateStoreHelpers } from "./store-helpers";

export class Store<TState extends FieldState<any>> extends TinyEmitter {
    constructor(initialStateFactory: () => TState) {
        super();

        this.state = produce<TState>(initialStateFactory(), () => {});
    }

    private _state!: TState;
    private _helpers!: StoreHelpers;

    private get state(): TState {
        return this._state;
    }

    private set state(value: TState) {
        this._state = value;
        this._helpers = constructStoreHelpers(this._state, {});
    }

    public get helpers(): StoreHelpers {
        return this._helpers;
    }

    public getState(): TState {
        return this.state;
    }

    public update(updater: (draft: Draft<TState>, helpers: UpdateStoreHelpers) => void): void {
        const newState = produce(this.state, draft => {
            return updater(draft, constructUpdateStoreHelpers(this, draft, {}));
        });

        if (this.state === newState) {
            return;
        }

        this.state = newState;
        this.emit();
    }
}
