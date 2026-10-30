import type { ReactNode } from "react";
import BankHeader from "./BankHeader";
import BankFooter from "./BankFooter";

type AuthLayoutProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footerContent?: ReactNode;
  className?: string;
};

export default function AuthLayout({
  title,
  subtitle,
  children,
  footerContent,
  className = "",
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <BankHeader />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex w-full flex-1 items-center justify-center px-4 py-10 focus:outline-none sm:px-6 lg:px-8"
      >
        <div className={`w-full max-w-2xl ${className}`.trim()}>
          {(title || subtitle) && (
            <header className="mb-8 text-center">
              {title && (
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {title}
                </h1>
              )}

              {subtitle && (
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                  {subtitle}
                </p>
              )}
            </header>
          )}

          {children}

          {footerContent && (
            <div className="mt-6 text-center text-sm text-slate-600">
              {footerContent}
            </div>
          )}
        </div>
      </main>

      <BankFooter />
    </div>
  );
}