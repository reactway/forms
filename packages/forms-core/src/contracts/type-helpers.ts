export interface Dictionary<TValue> {
    [index: string]: TValue | undefined;
}

export interface NestedDictionary<TValue> {
    [index: string]: TValue | NestedDictionary<TValue> | undefined;
}

export type JsonValue = string | number | boolean | JsonValue[] | NestedDictionary<JsonValue> | null;

export type PartialKeys<T, TKeys extends keyof T> = Omit<T, TKeys> & Partial<Pick<T, TKeys>>;

export type SpecificKey<TType, TKey extends keyof TType> = TKey;
