import { TinyEmitter } from "@reactway/tiny-emitter";
import { Dictionary } from "../contracts/helpers";
import { FormState } from "../contracts/field-state";
import { FieldStore } from "./field-store";

export class StoresRegistry extends TinyEmitter {
    private storesRegistry: Dictionary<FieldStore<FormState>> = {};

    public registerStore(formId: string, store: FieldStore<FormState>): void {
        if (this.storesRegistry[formId] != null) {
            throw new Error(`Form with formId "${formId}" is already registered.`);
        }

        this.storesRegistry[formId] = store;
    }

    public unregisterStore(formId: string): void {
        this.storesRegistry[formId] = undefined;
    }

    public getStore(formId: string): FieldStore<FormState> | undefined {
        return this.storesRegistry[formId];
    }
}

export class FormsStoresClass {
    private instance: StoresRegistry | undefined;

    public setFormStoresHandler(newHandler: StoresRegistry, disposeOldOne = true): void {
        if (disposeOldOne) {
            if (this.instance != null) {
                delete this.instance;
            }
        }
        this.instance = newHandler;
    }

    public get Registry(): StoresRegistry {
        this.instance = this.instance ?? new StoresRegistry();
        return this.instance;
    }
}

export const FormsStores = new FormsStoresClass();
