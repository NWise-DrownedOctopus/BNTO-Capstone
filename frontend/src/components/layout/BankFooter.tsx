type BankFooterProps = {
  className?: string;
};

export default function BankFooter({
  className = "",
}: BankFooterProps) {
  const currentYear = new Date().getFullYear();

  const footerClasses = [
    "border-t border-slate-200 bg-white",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <footer className={footerClasses}>
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
        <p className="text-sm text-slate-600">
          &copy; {currentYear} BNTO Bank. All rights reserved.
        </p>

        <p className="flex items-center gap-2 text-sm text-slate-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 shrink-0 text-green-700"
            aria-hidden="true"
            focusable="false"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>

          <span>Your security matters</span>
        </p>
      </div>
    </footer>
  );
}