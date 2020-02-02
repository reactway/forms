// import { Dictionary, JsonValue } from "./helpers";

// export interface FieldState<TValue, TData extends {}> extends FieldValue<TValue>, HydrationState<FieldState<TValue, TData>> {
//     id: string;
//     name: string;

//     data: TData;

//     fields: Dictionary<FieldState<unknown, any>>;
// }

// export interface FieldValue<TValue, THydrationValue extends JsonValue = JsonValue> {
//     toValue(fieldState: THydrationValue): TValue;
//     fromValue(fieldState: THydrationValue, value: TValue): THydrationValue;
// }

// export interface HydrationState<TState extends FieldState<any, any>, THydrationValue extends JsonValue = JsonValue> {
//     dehydrate: (state: TState) => THydrationValue;
//     hydrate: (value: THydrationValue) => TState;
// }

// export interface RadioGroupFieldState extends FieldState<string, {}> {}

// interface RadioFieldState extends FieldState<boolean, { value: string; checked: boolean }> {}

// declare const radioGroup: RadioFieldState;
