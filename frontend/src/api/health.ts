const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");

export async function checkBackendConnection(): Promise<boolean> {
  if (!API_URL) {
    console.error(
      "Backend health check failed: VITE_API_URL is not configured.",
    );
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/api/health`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `Backend health check failed: ${response.status} ${response.statusText}`,
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Could not connect to backend:", error);
    return false;
  }
}