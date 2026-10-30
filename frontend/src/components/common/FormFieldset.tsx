import type { FieldsetHTMLAttributes, ReactNode } from "react";

type FormFieldsetProps = Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  "children" | "title"
> & {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function FormFieldset({
  title,
  description,
  children,
  className = "",
  ...fieldsetProps
}: FormFieldsetProps) {
  return (
    <fieldset
      {...fieldsetProps}
      className={`min-w-0 space-y-5 ${className}`}
    >
      <div className="space-y-1">
        <legend className="text-lg font-semibold text-slate-900">
          {title}
        </legend>

        {description && (
          <p className="text-sm leading-5 text-slate-600">{description}</p>
        )}
      </div>

      {children}
    </fieldset>
  );
}