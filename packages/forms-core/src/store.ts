import { TinyEmitter } from "@reactway/tiny-emitter";
import produce, { Draft, Patch } from "immer";
import { FieldState, StoreHelpers, UpdateStoreHelpers, UpdatersFactories, Dictionary, SpecificKey } from "./contracts";
import { constructStoreHelpers, constructUpdateStoreHelpers } from "./helpers/store-helpers";
import { getDefaultUpdatersFactories } from "./helpers/generic";
import { IdSeparator } from "./constants";

export type StoreListener = (lastUpdatePatches: Patch[]) => void;

export type StoreUpdater<TState extends FieldState<any, any>> = (helpers: UpdateStoreHelpers, draft: Draft<TState>) => void;

let count = 0;
let handlerCallsCount = 0;
let handlersCount = 0;

setInterval(() => {
    console.log(`Total updates: ${count}, handlers: ${handlersCount}, handler calls: ${handlerCallsCount}`);
}, 1000);

export class Store<TState extends FieldState<any, any>> {
    constructor(initialStateFactory: () => TState, updatersFactories?: UpdatersFactories) {
        // super();

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.state = produce<TState>(initialStateFactory(), () => {});
        this.updaters = updatersFactories != null ? { ...updatersFactories } : getDefaultUpdatersFactories();

        this.emitter.addListener(this.fieldHandlersListener);
    }

    private readonly emitter = new TinyEmitter<StoreListener>();
    private _state!: TState;
    private _helpers!: StoreHelpers;
    private readonly updaters: UpdatersFactories;

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

    protected handlers: Dictionary<StoreListener> = {};
    protected handlerIdsByFieldId: Dictionary<string[]> = {};

    protected count = 0;
    public addListener(handler: StoreListener, dependentFields?: string[]): () => void {
        const handlerId = `h${this.count++}`;
        this.handlers[handlerId] = handler;

        handlersCount++;
        if (dependentFields == null || dependentFields.length === 0) {
            return this.emitter.addListener(patches => {
                handlerCallsCount++;
                handler(patches);
            });
        }

        const unregisterCallbacks: (() => void)[] = [];
        for (const fieldId of dependentFields) {
            let handlerIds = this.handlerIdsByFieldId[fieldId];
            if (handlerIds == null) {
                handlerIds = [];
                this.handlerIdsByFieldId[fieldId] = handlerIds;
            }

            if (handlerIds.includes(handlerId)) {
                continue;
            }

            // Register callback
            handlerIds.push(handlerId);
            const unregisterCallback = (): void => {
                if (this.handlerIdsByFieldId[fieldId] == null) {
                    return;
                }

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, no-shadow
                const handlerIds = this.handlerIdsByFieldId[fieldId]!;

                const index = handlerIds.indexOf(handlerId);
                if (index === -1) {
                    return;
                }

                handlerIds.splice(index, 1);
            };
            unregisterCallbacks.push(unregisterCallback);
        }

        return () => {
            for (const callback of unregisterCallbacks) {
                callback();
            }
        };
    }

    protected done = 0;
    protected fieldHandlersListener = (patches: Patch[]): void => {
        const fieldsKeys = Object.keys(this.handlerIdsByFieldId);
        if (fieldsKeys.length === 0) {
            return;
        }

        // Strongly type the key to catch an error if it changes.
        const fieldsKey: SpecificKey<FieldState<any, any>, "fields"> = "fields";

        const paths: string[] = [];
        patches.map(patch => {
            const idPath = patch.path.filter(x => x !== fieldsKey).join(IdSeparator);
            paths.push(idPath);
        });

        const fieldsToCall: string[] = [];
        for (const fieldKey of fieldsKeys) {
            // TODO: Is this check needed?
            if (fieldsToCall.includes(fieldKey)) {
                continue;
            }

            const fieldHandlersShouldBeCalled = paths.some(path => {
                if (!path.startsWith(fieldKey)) {
                    return false;
                }

                return path.charAt(fieldKey.length) === IdSeparator;
            });

            if (!fieldHandlersShouldBeCalled) {
                continue;
            }

            fieldsToCall.push(fieldKey);
        }

        const handlerIds = fieldsToCall
            .map(fieldId => {
                // We've accumulated the ids from this object, thus they exist.
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return this.handlerIdsByFieldId[fieldId]!;
            })
            .flatMap(x => x);

        for (const handlerId of handlerIds) {
            const handler = this.handlers[handlerId];
            if (handler == null) {
                continue;
            }
            handlerCallsCount++;
            handler(patches);
        }
    };

    public update(updater: StoreUpdater<TState>): void {
        const patches: Patch[] = [];

        count++;

        const newState = produce(
            this.state,
            draft => {
                updater(constructUpdateStoreHelpers(this.updaters, draft, this, {}), draft);
            },
            updatePatches => {
                patches.push(...updatePatches);
            }
        );

        if (this.state === newState) {
            return;
        }

        this.state = newState;
        this.emitter.emit(patches);
    }
}
