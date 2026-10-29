const API_URL = import.meta.env.VITE_API_URL;

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

export async function registerUser(
  credentials: AuthRequest
): Promise<RegisterResponse> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(`Registration failed: ${response.status}`);
  }

  return (await response.json()) as RegisterResponse;
}

export async function loginUser(
  credentials: AuthRequest
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  return (await response.json()) as LoginResponse;
}
