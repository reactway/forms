import { ValidationResultOrString } from "@reactway/forms-core";
import { useValidator } from "@reactway/forms";

export type WaitValidatorProps = {
    time?: number;
};

export const WaitValidator = (props: WaitValidatorProps): null => {
    const { time = 250 } = props;

    useValidator<string>(
        WaitValidator.name,
        () => {
            return {
                validate: async (_): Promise<ValidationResultOrString[]> => {
                    await new Promise(resolve => setTimeout(resolve, time));
                    return [];
                }
            };
        },
        [time]
    );

    return null;
};
