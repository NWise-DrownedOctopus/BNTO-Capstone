import { useId, useState } from "react";
import SummaryCard from "./SummaryCard";

type SpendingCategory = {
  name: string;
  amount: number;
  color: string;
};

const MONTHLY_SPENDING = [
  { month: "May", amount: 1250 },
  { month: "Jun", amount: 1480 },
  { month: "Jul", amount: 1120 },
  { month: "Aug", amount: 1720 },
  { month: "Sep", amount: 1390 },
  { month: "Oct", amount: 1560 },
];

const SPENDING_CATEGORIES: SpendingCategory[] = [
  { name: "Housing", amount: 1200, color: "bg-blue-700" },
  { name: "Food & dining", amount: 420, color: "bg-emerald-600" },
  { name: "Transportation", amount: 260, color: "bg-violet-600" },
  { name: "Shopping", amount: 180, color: "bg-amber-500" },
  { name: "Other", amount: 150, color: "bg-slate-400" },
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) {
    return "Unavailable";
  }

  return currencyFormatter.format(amount);
}

function MonthlySpendingChart() {
  const validMonths = MONTHLY_SPENDING.filter(
    (month) => Number.isFinite(month.amount) && month.amount >= 0,
  );

  const maximumAmount = Math.max(
    ...validMonths.map((month) => month.amount),
    1,
  );

  const chartDescription = validMonths
    .map((month) => `${month.month}: ${formatCurrency(month.amount)}`)
    .join("; ");

  return (
    <section
      aria-labelledby="monthly-spending-heading"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-6">
        <h2
          id="monthly-spending-heading"
          className="text-lg font-semibold text-slate-900"
        >
          Monthly spending
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Sample spending totals over the last six months.
        </p>
      </div>

      {validMonths.length === 0 ? (
        <p className="py-8 text-sm text-slate-600" role="status">
          No monthly spending data is available.
        </p>
      ) : (
        <div
          className="flex h-64 items-end gap-3 sm:gap-5"
          role="img"
          aria-label={`Bar chart showing monthly sample spending. ${chartDescription}.`}
        >
          {validMonths.map((month) => {
            const height = Math.max(
              (month.amount / maximumAmount) * 100,
              4,
            );

            return (
              <div
                key={month.month}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              >
                <span
                  className="text-center text-xs font-medium text-slate-600"
                  aria-hidden="true"
                >
                  {formatCurrency(month.amount)}
                </span>

                <div className="flex h-full w-full items-end">
                  <div
                    className="w-full rounded-t-md bg-blue-700 transition-[height] duration-300 motion-reduce:transition-none"
                    style={{ height: `${height}%` }}
                    aria-hidden="true"
                  />
                </div>

                <span
                  className="text-sm text-slate-600"
                  aria-hidden="true"
                >
                  {month.month}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function SpendingCategoryBreakdown() {
  const validCategories = SPENDING_CATEGORIES.filter(
    (category) =>
      Number.isFinite(category.amount) && category.amount >= 0,
  );

  const totalSpending = validCategories.reduce(
    (total, category) => total + category.amount,
    0,
  );

  const chartDescription = validCategories
    .map((category) => {
      const percentage =
        totalSpending > 0 ? (category.amount / totalSpending) * 100 : 0;

      return `${category.name}: ${formatCurrency(category.amount)}, ${percentage.toFixed(1)}%`;
    })
    .join("; ");

  return (
    <section
      aria-labelledby="spending-categories-heading"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-6">
        <h2
          id="spending-categories-heading"
          className="text-lg font-semibold text-slate-900"
        >
          Spending by category
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Sample breakdown of spending categories.
        </p>
      </div>

      <div className="mb-6">
        <p className="text-sm text-slate-500">Total sample spending</p>

        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          {formatCurrency(totalSpending)}
        </p>
      </div>

      {validCategories.length === 0 ? (
        <p className="py-8 text-sm text-slate-600" role="status">
          No category spending data is available.
        </p>
      ) : (
        <>
          <div
            className="mb-6 flex h-3 overflow-hidden rounded-full bg-slate-100"
            role="img"
            aria-label={`Spending distribution by category. ${chartDescription}.`}
          >
            {validCategories.map((category) => (
              <div
                key={category.name}
                className={category.color}
                style={{
                  width:
                    totalSpending > 0
                      ? `${(category.amount / totalSpending) * 100}%`
                      : "0%",
                }}
                aria-hidden="true"
              />
            ))}
          </div>

          <ul className="space-y-4">
            {validCategories.map((category) => {
              const percentage =
                totalSpending > 0
                  ? (category.amount / totalSpending) * 100
                  : 0;

              return (
                <li
                  key={category.name}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`h-3 w-3 shrink-0 rounded-sm ${category.color}`}
                      aria-hidden="true"
                    />

                    <span className="text-sm text-slate-700">
                      {category.name}
                    </span>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(category.amount)}
                    </p>

                    <p className="text-xs text-slate-500">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}

export default function AnalyticsView() {
  const [showSampleDataNotice, setShowSampleDataNotice] = useState(true);
  const noticeId = useId();

  const validCategories = SPENDING_CATEGORIES.filter(
    (category) =>
      Number.isFinite(category.amount) && category.amount >= 0,
  );

  const validMonths = MONTHLY_SPENDING.filter(
    (month) => Number.isFinite(month.amount) && month.amount >= 0,
  );

  const totalSpending = validCategories.reduce(
    (total, category) => total + category.amount,
    0,
  );

  const monthlyAverage =
    validMonths.length > 0
      ? validMonths.reduce((total, month) => total + month.amount, 0) /
        validMonths.length
      : null;

  const largestCategory = validCategories.reduce<SpendingCategory | null>(
    (largest, category) =>
      largest === null || category.amount > largest.amount
        ? category
        : largest,
    null,
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Financial analytics
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Explore spending patterns and review how money is distributed
          across different categories.
        </p>
      </header>

      {showSampleDataNotice && (
        <aside
          className="flex items-start justify-between gap-4 rounded-xl border border-amber-300 bg-amber-50 p-4"
          aria-labelledby={noticeId}
        >
          <div>
            <h2
              id={noticeId}
              className="font-semibold text-amber-950"
            >
              Demonstration data
            </h2>

            <p className="mt-1 text-sm leading-6 text-amber-900">
              These figures are examples for the dashboard interface. They
              are not calculated from your actual accounts or transactions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSampleDataNotice(false)}
            className="shrink-0 rounded-md px-2 py-1 text-sm font-medium text-amber-950 underline underline-offset-2 hover:text-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
            aria-label="Dismiss demonstration data notice"
          >
            Dismiss
          </button>
        </aside>
      )}

      <section
        aria-label="Spending summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <SummaryCard
          title="Sample spending"
          value={formatCurrency(totalSpending)}
          description="Across the example categories"
        />

        <SummaryCard
          title="Largest category"
          value={largestCategory?.name ?? "Unavailable"}
          description={
            largestCategory
              ? `${formatCurrency(largestCategory.amount)} in example spending`
              : "No category data available"
          }
        />

        <SummaryCard
          title="Monthly average"
          value={
            monthlyAverage !== null
              ? formatCurrency(monthlyAverage)
              : "Unavailable"
          }
          description={
            validMonths.length > 0
              ? `Average of ${validMonths.length} sample months`
              : "No monthly data available"
          }
        />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <MonthlySpendingChart />
        <SpendingCategoryBreakdown />
      </div>
    </div>
  );
}