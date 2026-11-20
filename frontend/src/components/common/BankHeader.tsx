import ShieldIcon from "../components/icons/ShieldIcon";

type BankHeaderProps = {
  subtitle?: string;
  showSecurityBadge?: boolean;
};

export default function BankHeader({
  subtitle = "Your money. Your future. Secure.",
  showSecurityBadge = true,
}: BankHeaderProps) {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <a
          href="/"
          className="inline-flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          aria-label="Banking app home"
        >
          <span
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-white"
            aria-hidden="true"
          >
            <ShieldIcon size={24} />
          </span>

          <span className="flex flex-col">
            <span className="text-lg font-bold leading-tight text-gray-900">
              SecureBank
            </span>

            <span className="text-sm text-gray-600">{subtitle}</span>
          </span>
        </a>

        {showSecurityBadge && (
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-2 text-sm font-medium text-green-800">
            <ShieldIcon size={16} />
            <span>Secure Banking</span>
          </div>
        )}
      </div>
    </header>
  );
}