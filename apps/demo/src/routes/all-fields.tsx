import React from "react";
import { RouteComponentProps } from "@reach/router";

import { Form, TextInput, NumberInput, RadioGroup, RadioButton, Select } from "@reactway/forms";
import { StoreResult } from "../components/store-result";
import { FieldWrapper } from "../components/field-wrapper";
import { LengthValidator } from "../validators/length-validator";

export const AllFields = (_props: RouteComponentProps): JSX.Element => {
    return (
        <div>
            <Form>
                <FieldWrapper label="First Name">
                    <TextInput name="firstName">
                        <LengthValidator max={10} errorMessages={{ tooLong: "FirstName is too long.", tooShort: "" }} />
                    </TextInput>
                </FieldWrapper>
                <FieldWrapper label="Password">
                    <TextInput type="password" name="password">
                        <LengthValidator max={10} errorMessages={{ tooLong: "FirstName is too long.", tooShort: "" }} />
                    </TextInput>
                </FieldWrapper>
                <FieldWrapper label="Amount">
                    <NumberInput name="amount" />
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
                        <option value="volvo">Volvo</option>
                        <option value="saab">Saab</option>
                        <option value="mercedes">Mercedes</option>
                        <option value="audi">Audi</option>
                    </Select>
                </FieldWrapper>
                <FieldWrapper label="Cars Multiple">
                    <Select name="carsMultiple" multiple>
                        <option value="volvo">Volvo</option>
                        <option value="saab">Saab</option>
                        <option value="mercedes">Mercedes</option>
                        <option value="audi">Audi</option>
                    </Select>
                </FieldWrapper>
                <StoreResult />
            </Form>
        </div>
    );
};
