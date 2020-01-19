<Text>
    <Percentage />
    <Thousands />
</Text>

M1 = Percentage<number, number>
f(value) => value * 100
p(changedValue) => value / 100

M2 = Thousands<number, string>
f(value) => {
    // e.g. value = 12345.1
    ...
    return "12,345.10";
}
p(value) => {
    // e.g. value = "12,345.12"
    ...
    return 12345.12;
}

"|" shows cursor position

f1 => 1.23 => 123
f2 => 123 => "123|.00"

ch => "4"

p2 => "1234.00" => 1234
p1 => 1234 => 12.34

f1 => 12.34 => 1234
f2 => 1234 => "1,234|.00"

ch => delete

p2 => "1,23400" => 123400
p1 => 123400 => 1234

f1 => 1234 => 123400
f2 => 123400 => "123,400|.00"

