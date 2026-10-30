import { useState, type FormEvent } from "react";
import { AuthApiError, loginUser } from "../api/auth";
import Field from "../components/common/Field";
import PasswordField from "../components/common/PasswordField";
import AuthLayout from "../components/layout/AuthLayout";
import SecurityNotice from "../components/layout/SecurityNotice";
import ErrorMessage from "../components/common/ErrorMessage";
import FormButton from "../components/common/FormButton";

type SignInPageProps = {
  onCreateAccount: () => void;
  onSignIn: () => void;
};

type Credentials = {
  email: string;
  password: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof AuthApiError && error.status === 401) {
    return "The email or password you entered is incorrect. Please try again.";
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "We couldn't sign you in. Please check your credentials and try again.";
}

export default function SignInPage({
  onCreateAccount,
  onSignIn,
}: SignInPageProps) {
  const [credentials, setCredentials] = useState<Credentials>({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateCredential(field: keyof Credentials, value: string) {
    setCredentials((current) => ({
      ...current,
      [field]: value,
    }));

    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await loginUser({
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (
        typeof response.accessToken !== "string" ||
        !response.accessToken.trim()
      ) {
        throw new Error(
          "The server did not return a valid access token. Please try again.",
        );
      }

      try {
        sessionStorage.setItem("accessToken", response.accessToken);
      } catch {
        throw new Error(
          "We couldn't save your sign-in session. Please check your browser settings and try again.",
        );
      }

      onSignIn();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <section
        aria-labelledby="sign-in-heading"
        className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <form onSubmit={handleSubmit} aria-label="Sign in">
          <div className="space-y-6 px-6 py-8 sm:px-10 sm:py-10">
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-500">
                Online banking
              </p>

              <h1
                id="sign-in-heading"
                className="text-3xl font-bold tracking-tight text-slate-950"
              >
                Sign in to your account
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Enter your details to securely access your accounts.
              </p>
            </div>

            {error && (
              <ErrorMessage
                title="Sign-in failed"
                message={error}
              />
            )}

            <div className="space-y-5">
              <Field
                id="sign-in-email"
                name="email"
                label="Email"
                type="email"
                autoComplete="username"
                placeholder="you@example.com"
                value={credentials.email}
                onChange={(event) =>
                  updateCredential("email", event.target.value)
                }
                required
                disabled={isSubmitting}
              />

              <PasswordField
                id="sign-in-password"
                name="password"
                label="Password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(value) =>
                  updateCredential("password", value)
                }
                required
                disabled={isSubmitting}
              />
            </div>

            <p className="text-sm text-slate-500">
              Need to reset your password? Password recovery is not available
              yet.
            </p>

            <FormButton
              type="submit"
              loading={isSubmitting}
              disabled={
                isSubmitting ||
                !credentials.email.trim() ||
                !credentials.password
              }
              className="w-full"
            >
              Sign in
            </FormButton>

            <SecurityNotice
              title="Secure online banking"
              message="Protect your account by keeping your sign-in credentials private."
            />

            <p className="text-center text-sm text-slate-600">
              New to BNTO Bank?{" "}
              <button
                type="button"
                onClick={onCreateAccount}
                disabled={isSubmitting}
                className="rounded-sm font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Open an account
              </button>
            </p>
          </div>
        </form>
      </section>
    </AuthLayout>
  );
}