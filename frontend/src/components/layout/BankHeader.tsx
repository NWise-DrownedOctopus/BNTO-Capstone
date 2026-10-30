import BankLogo from "./BankLogo";

type BankHeaderProps = {
  className?: string;
};

export default function BankHeader({
  className = "",
}: BankHeaderProps) {
  const headerClasses = [
    "border-b border-slate-200 bg-white",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClasses}>
      <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a
          href="/"
          aria-label="BNTO Bank home"
          className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <BankLogo size="medium" />
        </a>

        <div className="hidden items-center gap-2 text-sm text-slate-600 sm:flex">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-green-700"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>

          <span>Secure banking</span>
        </div>
      </div>
    </header>
  );
}