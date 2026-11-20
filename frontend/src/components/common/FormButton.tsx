import type { ButtonHTMLAttributes, ReactNode } from "react";

type FormButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  children: ReactNode;
  loading?: boolean;
  loadingText?: string;
  variant?: "primary" | "secondary" | "danger";
  fullWidth?: boolean;
};

const VARIANT_CLASSES = {
  primary:
    "border border-transparent bg-blue-700 text-white hover:bg-blue-800 focus-visible:ring-blue-600",
  secondary:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-blue-600",
  danger:
    "border border-transparent bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-600",
} as const;

export default function FormButton({
  children,
  loading = false,
  loadingText = "Please wait...",
  variant = "primary",
  fullWidth = true,
  disabled = false,
  type = "button",
  className = "",
  ...buttonProps
}: FormButtonProps) {
  const isDisabled = disabled || loading;

  const classes = [
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5",
    "text-sm font-semibold transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-60",
    "motion-reduce:transition-none",
    VARIANT_CLASSES[variant],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...buttonProps}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={classes}
    >
      {loading && (
        <span
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}

      <span aria-live="polite" aria-atomic="true">
        {loading ? loadingText : children}
      </span>
    </button>
  );
}