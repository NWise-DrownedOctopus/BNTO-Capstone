import { useCallback, useEffect, useState } from "react";
import { getAccounts, type Account } from "../api/accounts";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import AccountsView from "../components/dashboard/AccountsView";
import AnalyticsView from "../components/dashboard/AnalyticsView";
import BudgetingView from "../components/dashboard/BudgetingView";

export type DashboardView = "accounts" | "analytics" | "budgeting";

export type Transaction = {
  merchant: string;
  category: string;
  date: string;
  amount: number;
  initials: string;
};

type DashboardPageProps = {
  onSignOut: () => void;
  userName?: string;
};

const DEMO_TRANSACTIONS: Transaction[] = [
  {
    merchant: "Whole Foods Market",
    category: "Groceries",
    date: "Today",
    amount: -84.27,
    initials: "WF",
  },
  {
    merchant: "Salary deposit",
    category: "Income",
    date: "2026-09-24",
    amount: 3420.0,
    initials: "SD",
  },
  {
    merchant: "City Electric",
    category: "Utilities",
    date: "2026-09-23",
    amount: -126.4,
    initials: "CE",
  },
  {
    merchant: "Metro Transit",
    category: "Transportation",
    date: "2026-09-22",
    amount: -42.0,
    initials: "MT",
  },
];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "We couldn't load your accounts. Please try again.";
}

export default function DashboardPage({
  onSignOut,
  userName = "Account holder",
}: DashboardPageProps) {
  const [currentView, setCurrentView] =
    useState<DashboardView>("accounts");

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAccounts();

      if (!Array.isArray(data)) {
        throw new Error(
          "The server returned an unexpected accounts response.",
        );
      }

      setAccounts(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  function handleSignOut() {
    // App.tsx owns session cleanup and authentication state.
    onSignOut();
  }

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const firstName = userName.trim().split(/\s+/)[0] || "there";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <DashboardHeader
        userName={userName}
        onSignOut={handleSignOut}
      />

      <div className="mx-auto grid max-w-screen-2xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-8 lg:px-8 lg:py-8">
        <DashboardSidebar
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        <main
          id="main-content"
          tabIndex={-1}
          className="min-w-0 outline-none"
        >
          {currentView === "accounts" && (
            <>
              <div className="mb-7">
                <p className="text-sm font-semibold text-slate-500">
                  {formattedDate}
                </p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                  Welcome, {firstName}
                </h1>

                <p className="mt-2 text-slate-600">
                  Here's a snapshot of your finances.
                </p>
              </div>

              <AccountsView
                accounts={accounts}
                transactions={DEMO_TRANSACTIONS}
                isLoading={isLoading}
                error={error}
                onRetry={() => void loadAccounts()}
              />
            </>
          )}

          {currentView === "analytics" && <AnalyticsView />}

          {currentView === "budgeting" && <BudgetingView />}
        </main>
      </div>
    </div>
  );
}