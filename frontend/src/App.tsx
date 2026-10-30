import { useState } from "react";
import CreateAccountPage from "./pages/CreateAccountPage";
import SignInPage from "./pages/SignInPage";
import DashboardPage from "./pages/DashboardPage";

type Page = "create-account" | "sign-in";

const ACCESS_TOKEN_KEY = "accessToken";

function hasStoredAccessToken(): boolean {
  try {
    return Boolean(sessionStorage.getItem(ACCESS_TOKEN_KEY));
  } catch {
    return false;
  }
}

export default function App() {
  const [page, setPage] = useState<Page>("create-account");

  const [isSignedIn, setIsSignedIn] = useState(hasStoredAccessToken);

  function handleSignIn() {
    setIsSignedIn(true);
  }

  function handleSignOut() {
    try {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error("Could not clear the stored access token:", error);
    }

    // Always return to sign-in, even if browser storage is unavailable.
    setIsSignedIn(false);
    setPage("sign-in");
  }

  if (isSignedIn) {
    return <DashboardPage onSignOut={handleSignOut} />;
  }

  if (page === "sign-in") {
    return (
      <SignInPage
        onCreateAccount={() => setPage("create-account")}
        onSignIn={handleSignIn}
      />
    );
  }

  return <CreateAccountPage onSignIn={() => setPage("sign-in")} />;
}