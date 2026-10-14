export type Account = {
  id: number;
  name: string;
  balance: number;
  lastFour: string;
};

export async function getAccounts(): Promise<Account[]> {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/accounts`
  );

  if (!response.ok) {
    throw new Error("Failed to retrieve accounts");
  }

  return response.json();
}