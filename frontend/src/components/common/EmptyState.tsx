import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
};

export default function EmptyState({
  title,
  message,
  icon,
  action,
  className = "",
  headingLevel = 2,
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as const;

  const containerClasses = [
    "flex flex-col items-center justify-center rounded-xl",
    "border border-dashed border-slate-300 bg-white px-6 py-10 text-center",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      {icon && (
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <Heading className="text-lg font-semibold text-slate-900">
        {title}
      </Heading>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
        {message}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}