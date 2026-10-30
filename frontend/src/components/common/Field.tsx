import type { InputHTMLAttributes, ReactNode } from "react";

type FieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "className"
> & {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  leadingIcon?: ReactNode;
};

export default function Field({
  id,
  label,
  error,
  hint,
  className = "",
  labelClassName = "",
  inputClassName = "",
  leadingIcon,
  required,
  "aria-describedby": externalDescribedBy,
  ...inputProps
}: FieldProps) {
  const hasHint = Boolean(hint?.trim());
  const hasError = Boolean(error?.trim());

  const hintId = hasHint ? `${id}-hint` : undefined;
  const errorId = hasError ? `${id}-error` : undefined;

  const describedBy = [
    externalDescribedBy,
    hintId,
    errorId,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  const inputClasses = [
    "block w-full rounded-lg border bg-white px-3 py-2.5 text-gray-900",
    "placeholder:text-gray-400",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500",
    hasError
      ? "border-red-600 focus-visible:ring-red-600"
      : "border-gray-300",
    leadingIcon ? "pl-10" : "",
    inputClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={`w-full ${className}`.trim()}>
      <label
        htmlFor={id}
        className={`mb-1.5 block text-sm font-medium text-gray-700 ${labelClassName}`.trim()}
      >
        {label}

        {required && (
          <>
            <span aria-hidden="true" className="ml-1 text-red-600">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>

      <div className="relative">
        {leadingIcon && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500"
          >
            {leadingIcon}
          </span>
        )}

        <input
          {...inputProps}
          id={id}
          required={required}
          aria-invalid={hasError ? true : undefined}
          aria-describedby={describedBy}
          className={inputClasses}
        />
      </div>

      {hasHint && (
        <p id={hintId} className="mt-1.5 text-sm text-gray-600">
          {hint}
        </p>
      )}

      {hasError && (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}