import * as React from "react";
import { useState } from "react";
import { Input } from "./input";

export function CurrencyInput({
  id,
  name,
  defaultValue = 0,
  required,
  className,
}: {
  id?: string;
  name: string;
  defaultValue?: number;
  required?: boolean;
  className?: string;
}) {
  const [value, setValue] = useState<number>(defaultValue);
  const [displayValue, setDisplayValue] = useState<string>(
    defaultValue ? `Rp ${defaultValue.toLocaleString("id-ID")}` : "",
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    const num = parseInt(rawValue, 10);
    if (!isNaN(num) && rawValue !== "") {
      setValue(num);
      setDisplayValue(`Rp ${num.toLocaleString("id-ID")}`);
    } else {
      setValue(0);
      setDisplayValue("");
    }
  };

  return (
    <>
      <Input
        type="text"
        id={id}
        value={displayValue}
        onChange={handleChange}
        required={required}
        placeholder="Rp 0"
        className={className}
      />
      <input type="hidden" name={name} value={value} />
    </>
  );
}
