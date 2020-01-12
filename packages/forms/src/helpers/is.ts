import { InputFieldState, InputFieldData } from "@reactway/forms-core";

export function isInputFieldState(state: any): state is InputFieldState<InputFieldData<any, any>> {
    const inputData = state.data as InputFieldData<any>;
    return inputData.currentValue != null && inputData.defaultValue != null && inputData.initialValue != null;
}
