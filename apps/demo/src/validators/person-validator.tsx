import { useValidator } from "@reactway/forms";

export const PersonContactsValidator = (): null => {
    type PersonGroup = { firstName?: string; lastName?: string };
    useValidator<PersonGroup>(
        PersonContactsValidator.name,
        () => {
            return {
                validate: async value => {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    console.log("Running person validation....");
                    const defaultValue = "";
                    if (value.firstName !== defaultValue || value.lastName !== defaultValue) {
                        console.log("done");
                        return [];
                    }
                    console.log("done with errors");
                    return ["Enter firstName or lastName."];
                }
            };
        },
        []
    );

    return null;
};
