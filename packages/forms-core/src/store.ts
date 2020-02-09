import { TinyEmitter } from "@reactway/tiny-emitter";
import produce, { Draft } from "immer";
import { FieldState, StoreHelpers, UpdateStoreHelpers, StoreUpdatersFactories } from "./contracts";
import { constructStoreHelpers, constructUpdateStoreHelpers } from "./store-helpers";
import { getDefaultUpdatersFactories } from "./helpers";

export class Store<TState extends FieldState<any, any>> extends TinyEmitter {
    constructor(initialStateFactory: () => TState, updatersFactories?: StoreUpdatersFactories) {
        super();

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.state = produce<TState>(initialStateFactory(), () => {});
        this.updaters = updatersFactories != null ? { ...updatersFactories } : getDefaultUpdatersFactories();
    }

    private _state!: TState;
    private _helpers!: StoreHelpers;
    private readonly updaters: StoreUpdatersFactories;

    private get state(): TState {
        return this._state;
    }

    private set state(value: TState) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        if ((window as any).debugState === true) {
            const err = new Error();
            /* eslint-disable no-console */
            console.groupCollapsed("State being updated:", Object.assign({}, value));
            console.log(err.stack?.split("\n")[3]);
            console.groupEnd();
            /* eslint-enable no-console */
        }
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
            updater(draft, constructUpdateStoreHelpers(this, draft, this.updaters, {}));
        });

        if (this.state === newState) {
            return;
        }

        this.state = newState;
        this.emit();
    }
}
