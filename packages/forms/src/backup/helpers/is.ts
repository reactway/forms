import { InputFieldState, InputFieldData } from "@reactway/forms-core";

export function isInputFieldState(state: any): state is InputFieldState<InputFieldData<any, any>> {
    const inputData = state.data as InputFieldData<any>;
    return inputData.currentValue != null && inputData.defaultValue != null && inputData.initialValue != null;
}

export function isPromise(candidate: any): candidate is Promise<any> {
    return candidate.then != null && candidate.catch != null;
}
