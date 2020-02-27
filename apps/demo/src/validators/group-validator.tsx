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
                    console.log("Group validator has been fired.");
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
