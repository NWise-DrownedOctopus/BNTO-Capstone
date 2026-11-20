import type { ReactNode } from "react";

type SummaryCardProps = {
  title: string;
  value: string;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
    label: string;
  };
};

const trendColors: Record<
  NonNullable<SummaryCardProps["trend"]>["direction"],
  string
> = {
  up: "text-emerald-700",
  down: "text-red-700",
  neutral: "text-slate-600",
};

const trendDescriptions: Record<
  NonNullable<SummaryCardProps["trend"]>["direction"],
  string
> = {
  up: "increasing",
  down: "decreasing",
  neutral: "unchanged",
};

export default function SummaryCard({
  title,
  value,
  description,
  icon,
  trend,
}: SummaryCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-slate-600">{title}</h2>

          <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        {icon && (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>

      {description && (
        <p className="mt-2 text-sm leading-5 text-slate-500">
          {description}
        </p>
      )}

      {trend && (
        <p
          className={`mt-3 text-sm font-medium ${trendColors[trend.direction]}`}
        >
          <span className="sr-only">
            Trend {trendDescriptions[trend.direction]}:{" "}
          </span>
          {trend.value}
          <span className="ml-1 font-normal text-slate-600">
            {trend.label}
          </span>
        </p>
      )}
    </article>
  );
}