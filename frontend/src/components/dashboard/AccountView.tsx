import type { Account } from "../../api/accounts";
import type { Transaction } from "../../pages/DashboardPage";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";
import LoadingIndicator from "../common/LoadingIndicator";
import AccountCard from "./AccountCard";
import RecentTransactions from "./RecentTransactions";

type AccountsViewProps = {
  accounts: Account[];
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
};

export default function AccountsView({
  accounts,
  transactions,
  isLoading,
  error,
  onRetry,
}: AccountsViewProps) {
  return (
    <div className="space-y-6">
      <section
        aria-labelledby="accounts-heading"
        aria-busy={isLoading}
        className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2
              id="accounts-heading"
              className="text-xl font-bold tracking-tight text-slate-900"
            >
              Your accounts
            </h2>

            <p className="mt-1 text-sm text-slate-600">
              View your available accounts and balances.
            </p>
          </div>

          {!isLoading && !error && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              {accounts.length}{" "}
              {accounts.length === 1 ? "account" : "accounts"}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="mt-6">
            <LoadingIndicator label="Loading your accounts..." />
          </div>
        ) : error ? (
          <div className="mt-6">
            <ErrorMessage
              title="Unable to load accounts"
              message={error}
              onRetry={onRetry}
              retryLabel="Reload accounts"
            />
          </div>
        ) : accounts.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No accounts found"
              message="There are no accounts to display yet. Your accounts will appear here when they're available."
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {accounts.map((account, index) => (
              <AccountCard
                key={account.id}
                account={account}
                index={index}
              />
            ))}
          </div>
        )}
      </section>

      {!isLoading && !error && (
        <RecentTransactions
          transactions={transactions}
          isDemoData
        />
      )}
    </div>
  );
}