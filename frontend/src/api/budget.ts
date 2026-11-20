
const API_URL = (import.meta.env.VITE_API_URL as string | undefined)
  ?.trim()
  .replace(/\/+$/, "");

export interface BudgetResponse {
  periodDays: number;
  totalIncome: number;
  totalExpenses: number;
  remainingIncome: number;
  expensesByCategory: Record<string, number>;
  recommendations: string;
}

export class BudgetApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "BudgetApiError";
  }
}

export async function generateBudget(): Promise<BudgetResponse> {
  if (!API_URL) {
    throw new Error(
      "The API URL is not configured. Please check VITE_API_URL.",
    );
  }

  const accessToken = sessionStorage.getItem("accessToken");

  if (!accessToken) {
    throw new Error(
      "You must be signed in to generate a personalized budget.",
    );
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/api/budget/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });
  } catch {
    throw new Error(
      "Unable to connect to the budgeting service. Please try again.",
    );
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new BudgetApiError(
        "Your session has expired or you are not authorized. Please sign in again.",
        response.status,
      );
    }

    throw new BudgetApiError(
      "Unable to generate your budget. Please try again later.",
      response.status,
    );
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "The budgeting service returned an invalid response.",
    );
  }

  if (
    typeof data !== "object" ||
    data === null ||
    Array.isArray(data)
  ) {
    throw new Error(
      "The budgeting service returned an unexpected response.",
    );
  }

  const budget = data as Record<string, unknown>;

  if (
    typeof budget.periodDays !== "number" ||
    !Number.isFinite(budget.periodDays) ||
    typeof budget.totalIncome !== "number" ||
    !Number.isFinite(budget.totalIncome) ||
    typeof budget.totalExpenses !== "number" ||
    !Number.isFinite(budget.totalExpenses) ||
    typeof budget.remainingIncome !== "number" ||
    !Number.isFinite(budget.remainingIncome) ||
    typeof budget.recommendations !== "string" ||
    typeof budget.expensesByCategory !== "object" ||
    budget.expensesByCategory === null ||
    Array.isArray(budget.expensesByCategory)
  ) {
    throw new Error(
      "The budgeting service returned incomplete financial data.",
    );
  }

  const categories = budget.expensesByCategory as Record<string, unknown>;

  if (
    !Object.values(categories).every(
      (amount) => typeof amount === "number" && Number.isFinite(amount),
    )
  ) {
    throw new Error(
      "The budgeting service returned invalid spending categories.",
    );
  }

  return budget as unknown as BudgetResponse;
}
