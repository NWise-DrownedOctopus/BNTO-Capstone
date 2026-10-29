import { useState } from "react";

type GenerationStatus = "idle" | "loading" | "complete";

const mockBudgetResponse = `Your Personalized Budget Analysis

Based on your sample monthly income of $4,250 and expenses of $2,875, you have approximately $1,375 remaining each month.

Recommended Monthly Budget:

Housing: $1,200
Food & Dining: $450
Transportation: $350
Utilities: $250
Shopping: $200
Entertainment: $150
Savings: $1,000

Recommendations:

1. Reduce dining expenses by approximately $100 per month.

2. Set aside at least $500 per month toward an emergency fund.

3. Review recurring subscriptions and cancel services you rarely use.

4. Consider automatically transferring part of your income into savings each payday.

This is a demonstration budget generated from sample data.`;


type BudgetCategory = {
  name: string;
  amount: number;
  icon: string;
};

const mockBudgetCategories: BudgetCategory[] = [
  { name: "Housing", amount: 1200, icon: "🏠" },
  { name: "Food & Dining", amount: 450, icon: "🍽️" },
  { name: "Transportation", amount: 350, icon: "🚗" },
  { name: "Utilities", amount: 250, icon: "⚡" },
  { name: "Shopping", amount: 200, icon: "🛍️" },
  { name: "Entertainment", amount: 150, icon: "🎬" },
  { name: "Savings", amount: 1000, icon: "💰" },
];

const mockRecommendations = [
  {
    title: "Reduce dining expenses",
    description:
      "Reducing restaurant spending by approximately $100 per month could help increase your savings.",
  },
  {
    title: "Build an emergency fund",
    description:
      "Consider setting aside at least $500 each month toward an emergency fund.",
  },
  {
    title: "Review recurring subscriptions",
    description:
      "Look for subscriptions you rarely use and consider canceling them.",
  },
];

export default function AIAssistant() {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [budgetResponse, setBudgetResponse] = useState<string | null>(null);

  async function handleGenerateBudget() {
    if (status === "loading") return;

    setStatus("loading");
    setBudgetResponse(null);

    // Simulate the time needed for AI budget generation.
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setBudgetResponse(mockBudgetResponse);
    setStatus("complete");
  }

  return (
    <div>
      {/* Page heading */}
      <div className="mb-7">
        <p className="text-sm font-semibold text-slate-500">
          Intelligent budgeting
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          AI Budget Planner
        </h1>

        <p className="mt-2 text-slate-600">
          Generate a personalized budget based on your financial activity
          and discover opportunities to improve your spending habits.
        </p>
      </div>

      {/* Budget generator */}
      <section className="rounded-2xl border border-slate-300 bg-white p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-900">
          Create Your AI Budget
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Our AI budgeting assistant will analyze your financial activity
          and suggest a personalized monthly budget.
        </p>

        <button
          type="button"
          onClick={handleGenerateBudget}
          disabled={status === "loading"}
          className="mt-6 rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {status === "loading"
            ? "Generating your budget..."
            : status === "complete"
              ? "Regenerate AI Budget"
              : "Generate AI Budget"}
        </button>

        <p className="mt-3 text-xs text-slate-500">
          Demo mode: This feature currently uses sample financial data.
        </p>
      </section>

      {/* Loading indicator */}
      {status === "loading" && (
        <section
          className="mt-6 rounded-2xl border border-slate-300 bg-white p-6"
          role="status"
        >
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

            <p className="text-sm font-semibold text-slate-700">
              Analyzing your spending and preparing recommendations...
            </p>
          </div>
        </section>
      )}

      {/* Generated budget */}
        {status === "complete" && budgetResponse && (
        <section className="mt-6 space-y-6">

            {/* Report heading */}
            <div className="rounded-2xl border border-slate-300 bg-white p-6">
            <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900">
                Your AI-Generated Budget
                </h2>

                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Demo response
                </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
                Based on your sample financial activity, here is a suggested
                monthly budget designed to help you manage spending and
                increase savings.
            </p>
            </div>

            {/* Financial overview */}
            <div className="grid gap-4 sm:grid-cols-3">
            {[
                ["Monthly income", "$4,250"],
                ["Current expenses", "$2,875"],
                ["Remaining income", "$1,375"],
            ].map(([label, amount]) => (
                <article
                key={label}
                className="rounded-2xl border border-slate-300 bg-white p-5"
                >
                <p className="text-sm font-semibold text-slate-500">
                    {label}
                </p>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                    {amount}
                </p>
                </article>
            ))}
            </div>

            {/* Budget categories */}
            <div className="rounded-2xl border border-slate-300 bg-white p-6">
            <h3 className="text-lg font-bold text-slate-900">
                Recommended Monthly Budget
            </h3>

            <p className="mt-1 text-sm text-slate-500">
                Suggested allocations based on your financial activity.
            </p>

            <div className="mt-6 space-y-5">
                {mockBudgetCategories.map((category) => {
                const percentage = (category.amount / 4250) * 100;

                return (
                    <div key={category.name}>
                    <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                        <span className="text-xl">{category.icon}</span>

                        <span className="text-sm font-semibold text-slate-800">
                            {category.name}
                        </span>
                        </div>

                        <span className="text-sm font-bold text-slate-900">
                        ${category.amount.toLocaleString()}
                        </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                        className={`h-full rounded-full ${
                            category.name === "Savings"
                            ? "bg-emerald-600"
                            : "bg-slate-800"
                        }`}
                        style={{ width: `${percentage}%` }}
                        />
                    </div>
                    </div>
                );
                })}
            </div>
            </div>

            {/* AI recommendations */}
            <div className="rounded-2xl border border-slate-300 bg-white p-6">
            <h3 className="text-lg font-bold text-slate-900">
                AI Recommendations
            </h3>

            <p className="mt-1 text-sm text-slate-500">
                Suggested ways to improve your financial habits.
            </p>

            <div className="mt-6 grid gap-4">
                {mockRecommendations.map((recommendation, index) => (
                <article
                    key={recommendation.title}
                    className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5"
                >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
                    {index + 1}
                    </div>

                    <div>
                    <h4 className="font-semibold text-slate-900">
                        {recommendation.title}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        {recommendation.description}
                    </p>
                    </div>
                </article>
                ))}
            </div>
            </div>

        </section>
        )}
    </div>
  );
}