const API_URL = (import.meta.env.VITE_API_URL as string | undefined)
  ?.trim()
  .replace(/\/+$/, "");

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  userId: number;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export class AuthApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

function getApiUrl(): string {
  if (!API_URL) {
    throw new Error(
      "The API URL is not configured. Please check your VITE_API_URL environment variable.",
    );
  }

  return API_URL;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function getErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  let responseText: string;

  try {
    responseText = await response.text();
  } catch {
    return `${fallback} (HTTP ${response.status})`;
  }

  if (responseText.trim()) {
    try {
      const data: unknown = JSON.parse(responseText);

      if (isRecord(data)) {
        for (const key of ["message", "error", "detail"]) {
          const value = data[key];

          if (typeof value === "string" && value.trim()) {
            return value.trim().slice(0, 500);
          }
        }
      }
    } catch {
      // Handle a short plain-text response below.
      if (
        responseText.length <= 500 &&
        !responseText.trimStart().startsWith("<")
      ) {
        return responseText.trim();
      }
    }
  }

  return `${fallback} (HTTP ${response.status})`;
}

async function postAuthRequest(
  endpoint: "register" | "login",
  credentials: AuthRequest,
): Promise<unknown> {
  let response: Response;

  try {
    response = await fetch(`${getApiUrl()}/api/auth/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Check your connection and try again.",
    );
  }

  const fallback = endpoint === "register" ? "Registration failed" : "Login failed";

  if (!response.ok) {
    throw new AuthApiError(
      await getErrorMessage(response, fallback),
      response.status,
    );
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response. Please try again.");
  }

  if (!isRecord(data)) {
    throw new Error("The server returned an unexpected response.");
  }

  return data;
}

export async function registerUser(
  credentials: AuthRequest,
): Promise<RegisterResponse> {
  const data = await postAuthRequest("register", credentials);

  if (
    !isRecord(data) ||
    typeof data.userId !== "number" ||
    !Number.isSafeInteger(data.userId) ||
    data.userId <= 0
  ) {
    throw new Error(
      "Registration succeeded, but the server returned an invalid account response.",
    );
  }

  return { userId: data.userId };
}

export async function loginUser(
  credentials: AuthRequest,
): Promise<LoginResponse> {
  const data = await postAuthRequest("login", credentials);

  if (
    !isRecord(data) ||
    typeof data.accessToken !== "string" ||
    !data.accessToken.trim() ||
    typeof data.tokenType !== "string" ||
    !data.tokenType.trim() ||
    typeof data.expiresIn !== "number" ||
    !Number.isFinite(data.expiresIn) ||
    data.expiresIn <= 0
  ) {
    throw new Error(
      "Login failed because the server returned an invalid authentication response.",
    );
  }

  return {
    accessToken: data.accessToken,
    tokenType: data.tokenType,
    expiresIn: data.expiresIn,
  };
}