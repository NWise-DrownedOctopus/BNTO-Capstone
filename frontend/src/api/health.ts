export async function checkBackendConnection(): Promise<boolean> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/health`
    );

    if (!response.ok) {
      console.error(
        `Backend health check failed: ${response.status} ${response.statusText}`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Could not connect to backend:", error);
    return false;
  }
}