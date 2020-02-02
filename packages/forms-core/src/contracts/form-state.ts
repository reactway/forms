import { NestedDictionary } from "./type-helpers";
import { FieldState } from "./field-state";

export type FormState<TData extends FormData = FormData> = FieldState<null | never, null | never, TData>;

export interface FormData {
    submitCallback?: () => void;
    dehydratedState: NestedDictionary<unknown>;
}
