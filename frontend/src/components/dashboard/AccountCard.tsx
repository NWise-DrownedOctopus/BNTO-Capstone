import { useId } from "react";
import type { Account } from "../../api/accounts";

type AccountCardProps = {
  account: Account;
  index?: number;
};

function getAccountName(account: Account, index: number): string {
  return account.name.trim() || `Account ${index + 1}`;
}

function getAccountBalance(account: Account): number | null {
  return Number.isFinite(account.balance) ? account.balance : null;
}

function getLastFourDigits(account: Account): string | null {
  if (typeof account.lastFour !== "string") {
    return null;
  }

  const digits = account.lastFour.replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  return digits.slice(-4);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function AccountCard({
  account,
  index = 0,
}: AccountCardProps) {
  const headingId = useId();
  const name = getAccountName(account, index);
  const balance = getAccountBalance(account);
  const lastFour = getLastFourDigits(account);

  return (
    <article
      aria-labelledby={headingId}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3
            id={headingId}
            className="break-words text-base font-semibold text-slate-900"
          >
            {name}
          </h3>

          {lastFour && (
            <p className="mt-1 text-sm text-slate-500">
              Account number ending in {lastFour}
            </p>
          )}
        </div>

        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-6 w-6"
            focusable="false"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 10h18M7 15h3" />
          </svg>
        </span>
      </div>

      <div className="mt-6">
        <p className="text-sm text-slate-500">Current balance</p>

        <p className="mt-1 break-words text-2xl font-bold tracking-tight text-slate-950">
          {balance === null
            ? "Balance unavailable"
            : formatCurrency(balance)}
        </p>
      </div>
    </article>
  );
}