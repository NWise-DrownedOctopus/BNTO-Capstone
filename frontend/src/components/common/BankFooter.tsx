type BankFooterProps = {
  showSecurityMessage?: boolean;
};

export default function BankFooter({
  showSecurityMessage = true,
}: BankFooterProps) {
  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
        {showSecurityMessage && (
          <p className="text-sm text-gray-600">
            Your security and privacy are important to us.
          </p>
        )}

        <p className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} BNTOBank. All rights reserved.
        </p>
      </div>
    </footer>
  );
}