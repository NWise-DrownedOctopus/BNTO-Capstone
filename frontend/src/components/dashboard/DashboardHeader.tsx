import BankLogo from "../layout/BankLogo";

type DashboardHeaderProps = {
  userName: string;
  onSignOut: () => void;
};

export default function DashboardHeader({
  userName,
  onSignOut,
}: DashboardHeaderProps) {
  const displayName = userName.trim() || "User";

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const profileInitials = initials || "U";

  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-medium text-blue-700 shadow focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-20 max-w-screen-2xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <BankLogo size="medium" />

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden text-right sm:block">
              <p className="text-xs text-slate-500">Welcome back,</p>

              <p className="max-w-48 truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>
            </div>

            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800"
              role="img"
              aria-label={`Profile initials: ${profileInitials}`}
            >
              {profileInitials}
            </div>

            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 motion-reduce:transition-none sm:px-4"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
    </>
  );
}