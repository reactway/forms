import { useValidator } from "@reactway/forms";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GroupValidatorProps {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const GroupValidator = (props: GroupValidatorProps): null => {
    useValidator(
        GroupValidator.name,
        () => {
            return {
                shouldValidate: () => true,
                validate: (value: any) => {
                    if (value.firstName === "Jane") {
                        return ["We can't accept another Jane."];
                    }
                    return [];
                }
            };
        },
        []
    );

    return null;
};
