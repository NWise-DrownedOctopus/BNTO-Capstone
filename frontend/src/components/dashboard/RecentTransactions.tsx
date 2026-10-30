import { useId } from "react";
import type { Transaction } from "../../pages/DashboardPage";

type RecentTransactionsProps = {
  transactions: Transaction[];
  isDemoData?: boolean;
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(amount));
}

function formatDate(date: string): {
  display: string;
  dateTime?: string;
} {
  const normalizedDate = date.trim();

  if (!normalizedDate) {
    return { display: "Date unavailable" };
  }

  // Relative dates are display labels, not actual calendar dates.
  if (/^(today|yesterday)$/i.test(normalizedDate)) {
    return {
      display:
        normalizedDate.charAt(0).toUpperCase() +
        normalizedDate.slice(1).toLowerCase(),
    };
  }

  // Preserve month/day labels without inventing a year.
  if (/^[A-Za-z]{3,9}\s+\d{1,2}$/.test(normalizedDate)) {
    return { display: normalizedDate };
  }

  // Validate ISO date-only values without timezone-related date shifts.
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
    const [year, month, day] = normalizedDate.split("-").map(Number);
    const parsedDate = new Date(Date.UTC(year, month - 1, day));

    const isValidDate =
      parsedDate.getUTCFullYear() === year &&
      parsedDate.getUTCMonth() === month - 1 &&
      parsedDate.getUTCDate() === day;

    if (!isValidDate) {
      return { display: "Date unavailable" };
    }

    return {
      display: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }).format(parsedDate),
      dateTime: normalizedDate,
    };
  }

  // Handle other parseable date formats, including ISO timestamps.
  const parsedDate = new Date(normalizedDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return { display: "Date unavailable" };
  }

  return {
    display: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsedDate),
    dateTime: parsedDate.toISOString(),
  };
}

export default function RecentTransactions({
  transactions,
  isDemoData = false,
}: RecentTransactionsProps) {
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="border-b border-slate-200 px-5 py-4">
        <h2
          id={headingId}
          className="text-lg font-semibold text-slate-900"
        >
          Recent transactions
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Review your latest account activity.
        </p>

        {isDemoData && (
          <p className="mt-2 text-sm font-medium text-amber-800" role="note">
            Demonstration data — these transactions are examples, not actual
            account activity.
          </p>
        )}
      </div>

      {transactions.length === 0 ? (
        <p className="px-5 py-8 text-sm text-slate-600" role="status">
          No recent transactions to display.
        </p>
      ) : (
        <ul
          className="divide-y divide-slate-100"
          aria-label="Transaction history"
        >
          {transactions.map((transaction, index) => {
            const hasValidAmount = Number.isFinite(transaction.amount);
            const isCredit = hasValidAmount && transaction.amount > 0;

            const amount = hasValidAmount
              ? formatCurrency(transaction.amount)
              : "Amount unavailable";

            const formattedDate = formatDate(transaction.date);

            // Replace this composite key with a backend transaction ID
            // when one becomes available.
            const transactionKey = [
              transaction.merchant,
              transaction.date,
              transaction.category,
              transaction.amount,
              index,
            ].join("-");

            return (
              <li
                key={transactionKey}
                className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700"
                    aria-hidden="true"
                  >
                    {transaction.initials || "?"}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {transaction.merchant || "Unknown merchant"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {transaction.category || "Uncategorized"}
                    </p>

                    <time
                      className="mt-1 block text-xs text-slate-500"
                      dateTime={formattedDate.dateTime}
                    >
                      {formattedDate.display}
                    </time>
                  </div>
                </div>

                <p
                  className={`shrink-0 font-semibold ${
                    !hasValidAmount
                      ? "text-slate-500"
                      : isCredit
                        ? "text-emerald-700"
                        : "text-slate-900"
                  }`}
                  aria-label={
                    hasValidAmount
                      ? `${isCredit ? "Credit" : "Debit"} of ${amount}`
                      : "Transaction amount unavailable"
                  }
                >
                  {!hasValidAmount
                    ? amount
                    : `${isCredit ? "+" : "−"}${amount}`}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}