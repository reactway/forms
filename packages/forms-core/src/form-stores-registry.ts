import { TinyEmitter } from "@reactway/tiny-emitter";
import { Dictionary, FormState } from "./contracts";
import { Store } from "./store";

class StoresRegistry extends TinyEmitter {
    private storesRegistry: Dictionary<Store<FormState>> = {};

    public registerStore(formId: string, store: Store<FormState>): void {
        if (this.storesRegistry[formId] != null) {
            throw new Error(`Form with formId "${formId}" is already registered.`);
        }

        this.storesRegistry[formId] = store;
        this.emit();
    }

    public unregisterStore(formId: string): void {
        this.storesRegistry[formId] = undefined;
        this.emit();
    }

    public getStore(formId: string): Store<FormState> | undefined {
        return this.storesRegistry[formId];
    }

    public getStoresIds(): string[] {
        return Object.keys(this.storesRegistry);
    }
}

class FormsStoresClass {
    private instance: StoresRegistry | undefined;

    public setFormStoresHandler(newHandler: StoresRegistry, disposeOldOne = true): void {
        if (disposeOldOne) {
            if (this.instance != null) {
                delete this.instance;
            }
        }
        this.instance = newHandler;
    }

    public get registry(): StoresRegistry {
        this.instance = this.instance ?? new StoresRegistry();
        return this.instance;
    }
}

export const FormsStores = new FormsStoresClass();
