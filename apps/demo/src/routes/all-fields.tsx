import React, { useState } from "react";
import { RouteComponentProps } from "@reach/router";

import {
    Form,
    TextInput,
    TextareaInput,
    NumberInput,
    RadioGroup,
    RadioButton,
    Select,
    ClearButton,
    HiddenInput,
    FieldsArray,
    RequiredValidator
} from "@reactway/forms";
import { StoreResult } from "../components/store-result";
import { FieldWrapper } from "../components/field-wrapper";
import { LengthValidator } from "../validators/length-validator";

export const AllFields = (_props: RouteComponentProps): JSX.Element => {
    const [counter, setCounter] = useState(0);

    return (
        <div>
            <button type="button" onClick={() => setCounter(prevCount => prevCount + 1)}>
                Counter: {counter}
            </button>
            <Form>
                <HiddenInput name="hidden" value={counter} />
                <FieldWrapper label="First Name">
                    <TextInput name="firstName">
                        <RequiredValidator />
                        <LengthValidator max={10} errorMessages={{ tooLong: "FirstName is too long.", tooShort: "" }} />
                    </TextInput>
                </FieldWrapper>
                <FieldWrapper label="Password">
                    <TextInput type="password" name="password">
                        <LengthValidator
                            max={10}
                            errorMessages={{ tooLong: "Password is too long.", tooShort: "Password is too short." }}
                        />
                    </TextInput>
                </FieldWrapper>
                <FieldWrapper label="Amount">
                    <NumberInput name="amount" allowNegative={false} initialValue={4220} />
                </FieldWrapper>
                <FieldWrapper label="Sex">
                    <RadioGroup name="sex">
                        <label>
                            Male
                            <RadioButton value={"male"} />
                        </label>
                        <label>
                            Female
                            <RadioButton value={"female"} />
                        </label>
                    </RadioGroup>
                </FieldWrapper>
                <FieldWrapper label="Cars">
                    <Select name="cars">
                        <option value={1}>Volvo</option>
                        <option value={2}>Saab</option>
                        <option value="mercedes">Mercedes</option>
                        <option value="audi">Audi</option>
                    </Select>
                </FieldWrapper>
                <FieldWrapper label="Cars Multiple">
                    <Select name="carsMultiple" multiple>
                        <option value={1}>Volvo</option>
                        <option value={2}>Saab</option>
                        <option value="mercedes">Mercedes</option>
                        <option value="audi">Audi</option>
                    </Select>
                </FieldWrapper>
                <FieldsArray name="array">
                    {({ name }) => {
                        return (
                            <FieldWrapper key={name} label={`FieldArray (${name})`}>
                                <TextInput name={name} />
                            </FieldWrapper>
                        );
                    }}
                </FieldsArray>
                <FieldWrapper label="Notes">
                    <TextareaInput name="notes" />
                </FieldWrapper>
                <ClearButton />
                <StoreResult />
            </Form>
        </div>
    );
};
