import { NestedDictionary } from "./type-helpers";
import { FieldState } from "./field-state";

export type FormState<TData extends FormData = FormData> = FieldState<{}, TData>;

export interface FormData {
    submitCallback?: () => void;
    isSubmitting: boolean;
    activeFieldId?: string;
    dehydratedState: NestedDictionary<unknown>;
}
