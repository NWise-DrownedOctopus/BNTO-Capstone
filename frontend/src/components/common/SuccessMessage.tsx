import type { ReactNode } from "react";

type SuccessMessageProps = {
  title: string;
  message: string;
  children?: ReactNode;
  className?: string;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
};

export default function SuccessMessage({
  title,
  message,
  children,
  className = "",
  headingLevel = 2,
}: SuccessMessageProps) {
  const Heading = `h${headingLevel}` as const;

  const containerClasses = [
    "rounded-xl border border-green-200 bg-green-50 p-4",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div role="status" className={containerClasses}>
      <div className="flex items-start gap-3">
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-green-700"
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
          <path d="m5 12 4 4L19 6" />
          <circle cx="12" cy="12" r="10" />
        </svg>

        <div className="min-w-0 flex-1">
          <Heading className="text-sm font-semibold text-green-900">
            {title}
          </Heading>

          <p className="mt-1 text-sm leading-5 text-green-800">
            {message}
          </p>

          {children && (
            <div className="mt-3 text-sm text-green-800">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}