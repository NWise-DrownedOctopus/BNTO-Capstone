import { useState } from "react";
import Field from "./Field";

type PasswordFieldProps = {
  id: string;
  label?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
};

export default function PasswordField({
  id,
  label = "Password",
  name = "password",
  value,
  onChange,
  required = true,
  autoComplete = "current-password",
  placeholder = "Enter your password",
  error,
  hint,
  disabled = false,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible((previousValue) => !previousValue);
  };

  return (
    <div className="relative">
      <Field
        id={id}
        label={label}
        name={name}
        type={isVisible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        error={error}
        hint={hint}
        disabled={disabled}
        inputClassName="pr-24"
      />

      <button
        type="button"
        onClick={toggleVisibility}
        disabled={disabled}
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
        className={[
          "absolute right-2 top-[34px]",
          "flex min-h-11 min-w-11 items-center justify-center",
          "rounded-md px-2 text-sm font-medium text-blue-700",
          "hover:text-blue-900",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-blue-600 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
        ].join(" ")}
      >
        {isVisible ? "Hide" : "Show"}
      </button>
    </div>
  );
}