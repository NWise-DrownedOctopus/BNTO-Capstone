import { useId, useState } from "react";

type BudgetCategory = {
  id: string;
  name: string;
  budget: number;
  spent: number;
};

const INITIAL_BUDGETS: BudgetCategory[] = [
  { id: "housing", name: "Housing", budget: 1400, spent: 1200 },
  { id: "food", name: "Food & dining", budget: 500, spent: 420 },
  { id: "transportation", name: "Transportation", budget: 300, spent: 260 },
  { id: "shopping", name: "Shopping", budget: 250, spent: 180 },
  { id: "entertainment", name: "Entertainment", budget: 150, spent: 165 },
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const MAX_BUDGET = 1_000_000_000;

function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) {
    return "Unavailable";
  }

  return currencyFormatter.format(amount);
}

function getBudgetStatus(category: BudgetCategory) {
  if (category.spent > category.budget) {
    return {
      label: "Over budget",
      textColor: "text-red-700",
      barColor: "bg-red-600",
    };
  }

  const percentage =
    category.budget > 0 ? (category.spent / category.budget) * 100 : 0;

  if (percentage >= 80) {
    return {
      label: "Near limit",
      textColor: "text-amber-700",
      barColor: "bg-amber-500",
    };
  }

  return {
    label: "On track",
    textColor: "text-emerald-700",
    barColor: "bg-emerald-600",
  };
}

function BudgetProgress({ category }: { category: BudgetCategory }) {
  const percentage =
    category.budget > 0
      ? (category.spent / category.budget) * 100
      : category.spent > 0
        ? 100
        : 0;

  const visualPercentage = Math.min(Math.max(percentage, 0), 100);
  const status = getBudgetStatus(category);
  const remaining = category.budget - category.spent;
  const progressId = `budget-progress-${category.id}`;

  return (
    <article className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{category.name}</h3>

          <p className="mt-1 text-sm text-slate-600">
            {formatCurrency(category.spent)} spent of{" "}
            {formatCurrency(category.budget)}
          </p>
        </div>

        <span
          className={`rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold ${status.textColor}`}
        >
          {status.label}
        </span>
      </div>

      <div
        id={progressId}
        className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label={`${category.name} budget used`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(visualPercentage)}
        aria-valuetext={`${formatCurrency(category.spent)} spent out of ${formatCurrency(
          category.budget,
        )}; ${Math.max(percentage, 0).toFixed(0)} percent used`}
      >
        <div
          className={`h-full rounded-full ${status.barColor} motion-reduce:transition-none`}
          style={{ width: `${visualPercentage}%` }}
          aria-hidden="true"
        />
      </div>

      <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm">
        <span className="text-slate-600">
          {Math.max(percentage, 0).toFixed(0)}% used
        </span>

        <span
          className={
            remaining < 0
              ? "font-medium text-red-700"
              : "font-medium text-slate-700"
          }
        >
          {remaining < 0
            ? `${formatCurrency(Math.abs(remaining))} over budget`
            : `${formatCurrency(remaining)} remaining`}
        </span>
      </div>
    </article>
  );
}

export default function BudgetingView() {
  const [showSampleNotice, setShowSampleNotice] = useState(true);
  const [budgets, setBudgets] = useState<BudgetCategory[]>(INITIAL_BUDGETS);

  // Keep the editable input text separate from the last valid budget.
  // This lets users temporarily clear a field or enter a decimal.
  const [budgetInputs, setBudgetInputs] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        INITIAL_BUDGETS.map((category) => [
          category.id,
          String(category.budget),
        ]),
      ),
  );

  const [inputErrors, setInputErrors] = useState<Record<string, string>>({});
  const noticeHeadingId = useId();

  const totalBudget = budgets.reduce(
    (total, category) => total + category.budget,
    0,
  );

  const totalSpent = budgets.reduce(
    (total, category) => total + category.spent,
    0,
  );

  const remaining = totalBudget - totalSpent;

  const overallPercentage =
    totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const overBudgetCount = budgets.filter(
    (category) => category.spent > category.budget,
  ).length;

  function validateBudget(value: string): {
    amount: number | null;
    error: string | null;
  } {
    const trimmedValue = value.trim();

    if (trimmedValue === "") {
      return {
        amount: null,
        error: "Enter a budget amount.",
      };
    }

    const newBudget = Number(trimmedValue);

    if (
      !Number.isFinite(newBudget) ||
      newBudget < 0 ||
      newBudget > MAX_BUDGET
    ) {
      return {
        amount: null,
        error: `Enter an amount between $0 and ${formatCurrency(MAX_BUDGET)}.`,
      };
    }

    return {
      amount: Math.round(newBudget * 100) / 100,
      error: null,
    };
  }

  function updateBudgetInput(id: string, value: string) {
    setBudgetInputs((current) => ({
      ...current,
      [id]: value,
    }));

    // Allow a temporarily empty field while the user is editing.
    if (value.trim() === "") {
      setInputErrors((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      return;
    }

    const result = validateBudget(value);

    if (result.error || result.amount === null) {
      setInputErrors((current) => ({
        ...current,
        [id]: result.error ?? "Enter a valid budget amount.",
      }));
      return;
    }

    setInputErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

    // Update calculations only when the draft is valid.
    setBudgets((currentBudgets) =>
      currentBudgets.map((category) =>
        category.id === id
          ? { ...category, budget: result.amount! }
          : category,
      ),
    );
  }

  function validateBudgetOnBlur(id: string) {
    const value = budgetInputs[id] ?? "";
    const result = validateBudget(value);

    if (result.error || result.amount === null) {
      setInputErrors((current) => ({
        ...current,
        [id]: result.error ?? "Enter a valid budget amount.",
      }));
      return;
    }

    setInputErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

    // Normalize the field after editing is complete.
    setBudgetInputs((current) => ({
      ...current,
      [id]: String(result.amount),
    }));

    setBudgets((currentBudgets) =>
      currentBudgets.map((category) =>
        category.id === id
          ? { ...category, budget: result.amount! }
          : category,
      ),
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Budgeting
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Set spending limits, track your progress, and see how much of your
          monthly budget remains.
        </p>
      </header>

      {showSampleNotice && (
        <aside
          className="flex items-start justify-between gap-4 rounded-xl border border-amber-300 bg-amber-50 p-4"
          aria-labelledby={noticeHeadingId}
        >
          <div>
            <h2
              id={noticeHeadingId}
              className="font-semibold text-amber-950"
            >
              Demonstration budgets
            </h2>

            <p className="mt-1 text-sm leading-6 text-amber-900">
              These budgets and spending amounts are examples. Changes you
              make here only affect this page and are not saved to a server.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowSampleNotice(false)}
            className="shrink-0 rounded-md px-2 py-1 text-sm font-medium text-amber-950 underline underline-offset-2 hover:text-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
            aria-label="Dismiss demonstration budget notice"
          >
            Dismiss
          </button>
        </aside>
      )}

      <section aria-label="Monthly budget summary">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-medium text-slate-600">
              Total monthly budget
            </h2>

            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
              {formatCurrency(totalBudget)}
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-medium text-slate-600">
              Total spent
            </h2>

            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
              {formatCurrency(totalSpent)}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {overallPercentage.toFixed(0)}% of your budget
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-medium text-slate-600">
              {remaining < 0 ? "Amount over budget" : "Remaining budget"}
            </h2>

            <p
              className={`mt-3 text-2xl font-bold tracking-tight ${
                remaining < 0 ? "text-red-700" : "text-emerald-700"
              }`}
            >
              {formatCurrency(Math.abs(remaining))}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {overBudgetCount === 0
                ? "All categories are within their limits."
                : `${overBudgetCount} ${
                    overBudgetCount === 1 ? "category is" : "categories are"
                  } over budget.`}
            </p>
          </article>
        </div>
      </section>

      <section
        aria-labelledby="category-budgets-heading"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="mb-6">
          <h2
            id="category-budgets-heading"
            className="text-lg font-semibold text-slate-900"
          >
            Category budgets
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            These are example budgets. Adjust a category's monthly limit to
            see how the progress indicators and totals change.
          </p>
        </div>

        <div className="space-y-4">
          {budgets.map((category) => (
            <BudgetProgress key={category.id} category={category} />
          ))}
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6">
          <h3 className="text-base font-semibold text-slate-900">
            Edit budget limits
          </h3>

          <p className="mt-1 text-sm text-slate-600">
            Enter an amount between $0 and {formatCurrency(MAX_BUDGET)} for
            each category. Valid changes update this page immediately but
            are not saved to your account.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {budgets.map((category) => {
              const inputId = `budget-${category.id}`;
              const errorId = `${inputId}-error`;
              const error = inputErrors[category.id];

              return (
                <div key={category.id}>
                  <label
                    htmlFor={inputId}
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    {category.name} monthly limit
                  </label>

                  <div
                    className={`flex items-center rounded-lg border ${
                      error ? "border-red-600" : "border-slate-300"
                    } focus-within:border-blue-700 focus-within:ring-2 focus-within:ring-blue-100`}
                  >
                    <span
                      className="pl-3 text-sm text-slate-500"
                      aria-hidden="true"
                    >
                      $
                    </span>

                    <input
                      id={inputId}
                      type="number"
                      min="0"
                      max={MAX_BUDGET}
                      step="0.01"
                      inputMode="decimal"
                      value={budgetInputs[category.id] ?? ""}
                      onChange={(event) =>
                        updateBudgetInput(category.id, event.target.value)
                      }
                      onBlur={() => validateBudgetOnBlur(category.id)}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? errorId : undefined}
                      className="min-h-11 w-full rounded-lg bg-transparent px-3 py-2 text-sm text-slate-900 outline-none"
                    />
                  </div>

                  {error && (
                    <p
                      id={errorId}
                      role="alert"
                      className="mt-1 text-sm font-medium text-red-700"
                    >
                      {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}