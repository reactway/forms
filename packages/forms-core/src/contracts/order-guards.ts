export interface OrderGuard {
    reportIndex: (id: string) => void;
}

export interface FieldOrderGuards {
    reportValidatorIndex: (validatorId: string) => void;
}
