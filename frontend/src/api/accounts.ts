export type Account = {
  id: number;
  name: string;
  balance: number;
  lastFour: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getApiUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

  if (!apiUrl) {
    throw new Error(
      "The API URL is not configured. Please check your VITE_API_URL environment variable.",
    );
  }

  return apiUrl;
}

function getAccessToken(): string | null {
  try {
    return sessionStorage.getItem("accessToken");
  } catch {
    throw new Error(
      "Unable to access your saved session. Please check your browser settings and sign in again.",
    );
  }
}

function isAccount(value: unknown): value is Account {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const account = value as Record<string, unknown>;

  return (
    typeof account.id === "number" &&
    Number.isFinite(account.id) &&
    typeof account.name === "string" &&
    typeof account.balance === "number" &&
    Number.isFinite(account.balance) &&
    typeof account.lastFour === "string"
  );
}

export async function getAccounts(): Promise<Account[]> {
  const apiUrl = getApiUrl();
  const accessToken = getAccessToken();

  const headers = new Headers({
    Accept: "application/json",
  });

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;

  try {
    response = await fetch(`${apiUrl}/api/accounts`, {
      method: "GET",
      headers,
    });
  } catch {
    throw new Error(
      "Could not connect to the banking server. Check your connection and try again.",
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new ApiError(
        "Your session has expired. Please sign in again.",
        response.status,
      );
    }

    if (response.status === 403) {
      throw new ApiError(
        "You do not have permission to access these accounts.",
        response.status,
      );
    }

    throw new ApiError(
      `Failed to retrieve accounts (HTTP ${response.status}).`,
      response.status,
    );
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      "The server returned an invalid response while loading your accounts.",
    );
  }

  if (!Array.isArray(data) || !data.every(isAccount)) {
    throw new Error(
      "The server returned account data in an unexpected format.",
    );
  }

  return data;
}