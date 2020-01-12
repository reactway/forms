export interface JsonBaseProps<TValue = JsonType> {
    value: TValue;
    depth: number;
}

export interface JsonObject {
    [key: string]: JsonType;
}
export type JsonArray = JsonType[];

export type JsonNull = null;
export type JsonNumber = number | bigint;
export type JsonString = string;
export type JsonBoolean = boolean;

export type JsonType = JsonObject | JsonArray | JsonNull | JsonNumber | JsonString | JsonBoolean;
