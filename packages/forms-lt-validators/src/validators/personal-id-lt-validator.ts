import { ValidatorResult } from "@reactway/forms-core";
import { useValidator } from "@reactway/forms";

interface PersonalIdValidatorPops {
    errorMsg?: string;
}

export function getLtChecksumDigit(code: string): number {
    let b = 1,
        c = 3,
        d = 0,
        e = 0,
        i,
        digit;
    for (i = 0; i < 10; i++) {
        digit = Number(code[i]);
        d += digit * b;
        e += digit * c;
        b++;
        if (b === 10) b = 1;
        c++;
        if (c === 10) c = 1;
    }
    d = d % 11;
    e = e % 11;
    if (d < 10) return d;
    else if (e < 10) return e;
    else return 0;
}

export const PersonalIdLtValidator = (props: PersonalIdValidatorPops): null => {
    const errorMessage = props.errorMsg ?? "Incorrect personal code";

    useValidator<string>(
        PersonalIdLtValidator.name,
        () => {
            return {
                shouldValidate: value => {
                    return value != null && value !== "";
                },
                validate: (value): ValidatorResult => {
                    if (!/^\d{11}$/.test(value)) {
                        return [errorMessage];
                    }
                    const isCodeValid = getLtChecksumDigit(value) === Number(value[10]);
                    if (isCodeValid) {
                        return undefined;
                    }

                    return [errorMessage];
                }
            };
        },
        []
    );

    return null;
};
