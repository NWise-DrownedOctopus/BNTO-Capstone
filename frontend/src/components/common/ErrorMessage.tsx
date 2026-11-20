import type { ReactNode } from "react";

type ErrorMessageProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  children?: ReactNode;
  className?: string;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
};

export default function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
  children,
  className = "",
  headingLevel = 2,
}: ErrorMessageProps) {
  const Heading = `h${headingLevel}` as const;

  const containerClasses = [
    "rounded-xl border border-red-200 bg-red-50 p-4",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const displayMessage = message.trim()
    ? message
    : "An unexpected error occurred. Please try again.";

  return (
    <div role="alert" className={containerClasses}>
      <div className="flex items-start gap-3">
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4m0 4h.01" />
        </svg>

        <div className="min-w-0 flex-1">
          <Heading className="text-sm font-semibold text-red-900">
            {title}
          </Heading>

          <p className="mt-1 text-sm text-red-800">{displayMessage}</p>

          {children && (
            <div className="mt-2 text-sm text-red-800">{children}</div>
          )}

          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-800 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 motion-reduce:transition-none"
            >
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}