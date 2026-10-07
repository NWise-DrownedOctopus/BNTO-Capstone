import { FormEvent, useEffect, useState } from "react";
import { getAccounts, type Account } from "./api/accounts";

const steps = ["Your details", "Contact info", "Security", "Review"];

const Field = ({
  id,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) => (
  <label className="block" htmlFor={id}>
    <span className="mb-2 block text-sm font-semibold text-slate-800">{label}</span>
    <input
      id={id}
      className="h-12 w-full rounded-lg border border-slate-300 bg-white px-4 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10"
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      type={type}
      value={value}
    />
    {hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
  </label>
);

function ShieldIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      <path d="M12 3 5 6v5c0 4.6 2.9 8.2 7 10 4.1-1.8 7-5.4 7-10V6l-7-3Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="m9.3 12 1.8 1.8 3.8-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

type DashboardView = "accounts" | "analytics" | "budgeting";

function DashboardIcon({ name }: { name: DashboardView }) {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24">
      {name === "accounts" && (
        <>
          <path d="M4 7h16M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 15h3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </>
      )}
      {name === "analytics" && (
        <>
          <path d="M5 19V9m7 10V5m7 14v-7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M3 19h18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </>
      )}
      {name === "budgeting" && (
        <>
          <path d="M4 7h16v12H4zM7 4h10v3" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="M8 12h8m-8 3h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </>
      )}
    </svg>
  );
}

function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const [view, setView] = useState<DashboardView>("accounts");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const navigation: { id: DashboardView; label: string }[] = [
    { id: "accounts", label: "Accounts" },
    { id: "analytics", label: "Analytics" },
    { id: "budgeting", label: "Budgeting" },
  ];

  useEffect(() => {
  async function loadAccounts() {
    const data = await getAccounts();
    setAccounts(data);
  }

  loadAccounts();
}, []);
  /*const [transactions, setTransactions] =
    useState<Transaction[]>([]);
  */
  const transactions = [
    { merchant: "Whole Foods Market", category: "Groceries", date: "Today", amount: "-$84.27", initials: "WF" },
    { merchant: "Salary deposit", category: "Income", date: "Sep 24", amount: "+$3,420.00", initials: "SD" },
    { merchant: "City Electric", category: "Utilities", date: "Sep 23", amount: "-$126.40", initials: "CE" },
    { merchant: "Metro Transit", category: "Transportation", date: "Sep 22", amount: "-$42.00", initials: "MT" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-300 bg-white">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3 font-bold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-sm text-white">N</span>
            <span className="text-lg">BNTO Bank</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">Jordan Taylor</p>
              <p className="text-xs text-slate-500">Personal banking</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">JT</span>
            <button
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              onClick={onSignOut}
              type="button"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[220px_1fr] lg:py-10">
        <aside>
          <p className="mb-3 hidden px-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500 lg:block">Dashboard</p>
          <nav aria-label="Dashboard navigation" className="flex gap-2 overflow-x-auto lg:flex-col">
            {navigation.map((item) => (
              <button
                className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition lg:w-full ${
                  view === item.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                }`}
                key={item.id}
                onClick={() => setView(item.id)}
                type="button"
              >
                <DashboardIcon name={item.id} />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-8 hidden rounded-xl border border-slate-300 bg-white p-4 text-sm lg:block">
            <span className="text-slate-800"><ShieldIcon /></span>
            <p className="mt-3 font-semibold">Your accounts are protected</p>
            <p className="mt-1 leading-5 text-slate-500">Last sign-in: today at 9:42 AM</p>
          </div>
        </aside>

        <main>
          {view === "accounts" && (
            <>
              <div className="mb-7">
                <p className="text-sm font-semibold text-slate-500">Thursday, September 25</p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Good morning, Jordan</h1>
                <p className="mt-2 text-slate-600">Here&apos;s a snapshot of your finances.</p>
              </div>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Your accounts">
                <article className="rounded-2xl bg-slate-900 p-6 text-white shadow-[0_10px_30px_rgba(15,23,42,0.16)] sm:col-span-2 xl:col-span-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-300">Total available balance</p>
                      <p className="mt-3 text-3xl font-bold tracking-tight">$19,710.62</p>
                    </div>
                    <DashboardIcon name="accounts" />
                  </div>
                  <p className="mt-10 text-xs text-slate-400">Across 3 accounts</p>
                </article>

                {accounts.map((account) => (
                <article 
                  className="rounded-2xl border border-slate-300 bg-white p-6"
                  key={account.id} 
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">
                      {account.name}
                    </p>

                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Active
                    </span>
                  </div>
                  <p className="mt-6 text-2xl font-bold">
                    ${account.balance.toFixed(2)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    •••• {account.lastFour}
                  </p>
                </article>
                ))}

                <article className="rounded-2xl border border-slate-300 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">High-Yield Savings</p>
                    <span className="text-xs font-semibold text-slate-500">4.25% APY</span>
                  </div>
                  <p className="mt-6 text-2xl font-bold">$11,290.44</p>
                  <p className="mt-1 text-xs text-slate-500">•••• 7390</p>
                </article>
              </section>

              <section className="mt-6 overflow-hidden rounded-2xl border border-slate-300 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
                  <div>
                    <h2 className="text-lg font-bold">Recent activity</h2>
                    <p className="mt-0.5 text-sm text-slate-500">Across all accounts</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-600">September</span>
                </div>
                <div className="divide-y divide-slate-200">
                  {transactions.map((transaction) => (
                    <div className="flex items-center gap-4 px-5 py-4 sm:px-6" key={`${transaction.merchant}-${transaction.date}`}>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                        {transaction.initials}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{transaction.merchant}</p>
                        <p className="text-xs text-slate-500">{transaction.category} · {transaction.date}</p>
                      </div>
                      <p className={`text-sm font-bold ${transaction.amount.startsWith("+") ? "text-emerald-700" : "text-slate-900"}`}>
                        <p>{transaction.merchant}</p>
                        <p>{transaction.category}</p>
                        {transaction.amount}
//-------------------------------------------------------------------------------------------------------------------------
                        //  Change made here
//-------------------------------------------------------------------------------------------------------------------------
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {view === "analytics" && (
            <>
              <div className="mb-7">
                <p className="text-sm font-semibold text-slate-500">Financial analytics</p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Your money, at a glance</h1>
                <p className="mt-2 text-slate-600">Income and spending insights for September.</p>
              </div>
              <section className="grid gap-4 sm:grid-cols-3">
                {[
                  ["Income", "$6,840.00", "+4.2%"],
                  ["Spending", "$3,210.46", "-8.1%"],
                  ["Net saved", "$3,629.54", "53%"],
                ].map(([label, amount, change]) => (
                  <article className="rounded-2xl border border-slate-300 bg-white p-5" key={label}>
                    <p className="text-sm font-semibold text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-bold">{amount}</p>
                    <p className="mt-3 text-xs font-semibold text-emerald-700">{change} vs. last month</p>
                  </article>
                ))}
              </section>
              <section className="mt-6 rounded-2xl border border-slate-300 bg-white p-5 sm:p-7">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-lg font-bold">Weekly spending</h2>
                    <p className="mt-1 text-sm text-slate-500">Average $458 per week</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-600">Last 7 weeks</span>
                </div>
                <div className="mt-8 flex h-56 items-end gap-3 border-b border-slate-200 sm:gap-6">
                  {[52, 68, 43, 78, 61, 88, 70].map((height, index) => (
                    <div className="flex h-full flex-1 items-end" key={height + index}>
                      <div className="w-full rounded-t-md bg-slate-800 transition-all" style={{ height: `${height}%` }} />
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-7 gap-3 text-center text-xs text-slate-500 sm:gap-6">
                  {["Aug 11", "18", "25", "Sep 1", "8", "15", "22"].map((label) => <span key={label}>{label}</span>)}
                </div>
              </section>
              <section className="mt-6 rounded-2xl border border-slate-300 bg-white p-5 sm:p-7">
                <h2 className="text-lg font-bold">Top spending categories</h2>
                <div className="mt-6 space-y-5">
                  {[
                    ["Housing", "$1,420", 44],
                    ["Food & dining", "$624", 19],
                    ["Transportation", "$386", 12],
                    ["Utilities", "$294", 9],
                  ].map(([label, amount, width]) => (
                    <div key={label}>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="font-semibold">{label}</span><span className="text-slate-600">{amount}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-slate-800" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {view === "budgeting" && (
            <>
              <div className="mb-7">
                <p className="text-sm font-semibold text-slate-500">September plan</p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Budgeting dashboard</h1>
                <p className="mt-2 text-slate-600">Stay on track with monthly category limits.</p>
              </div>
              <section className="rounded-2xl bg-slate-900 p-6 text-white sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-300">Monthly budget used</p>
                    <p className="mt-2 text-3xl font-bold">$2,724 <span className="text-lg font-medium text-slate-400">of $4,200</span></p>
                  </div>
                  <p className="text-sm font-semibold text-slate-300">$1,476 remaining</p>
                </div>
                <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-700">
                  <div className="h-full w-[65%] rounded-full bg-white" />
                </div>
              </section>
              <section className="mt-6 overflow-hidden rounded-2xl border border-slate-300 bg-white">
                <div className="border-b border-slate-200 px-5 py-5 sm:px-7">
                  <h2 className="text-lg font-bold">Category budgets</h2>
                  <p className="mt-1 text-sm text-slate-500">Resets in 6 days</p>
                </div>
                <div className="divide-y divide-slate-200">
                  {[
                    ["Housing", 1420, 1500],
                    ["Food & dining", 624, 800],
                    ["Transportation", 386, 500],
                    ["Shopping", 218, 400],
                    ["Entertainment", 76, 250],
                  ].map(([label, spent, limit]) => {
                    const percentage = Math.round((Number(spent) / Number(limit)) * 100);
                    return (
                      <div className="px-5 py-5 sm:px-7" key={label}>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold">{label}</p>
                            <p className="mt-1 text-xs text-slate-500">${spent} spent of ${limit}</p>
                          </div>
                          <span className={`text-sm font-bold ${percentage >= 90 ? "text-amber-700" : "text-slate-700"}`}>{percentage}%</span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${percentage >= 90 ? "bg-amber-600" : "bg-slate-800"}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function SignInPage({ onCreateAccount }: { onCreateAccount: () => void }) {
  const [credentials, setCredentials] = useState({ userId: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const handleSignIn = (event: FormEvent) => {
    event.preventDefault();
    if (credentials.userId && credentials.password) setSignedIn(true);
  };

  if (signedIn) {
    return <Dashboard onSignOut={() => setSignedIn(false)} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-950">
      <header className="border-b border-slate-300 bg-white">
        <div className="mx-auto flex h-[76px] w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <button
            aria-label="BNTO Bank home"
            className="flex items-center gap-3 font-bold tracking-tight"
            onClick={onCreateAccount}
            type="button"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-sm text-white">N</span>
            <span className="text-lg">BNTO Bank</span>
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="hidden sm:inline">New to BNTO?</span>
            <button
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-800 transition hover:border-slate-500 hover:bg-slate-50"
              onClick={onCreateAccount}
              type="button"
            >
              Open an account
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <section className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <form onSubmit={handleSignIn}>
              <div className="px-6 py-8 sm:px-10 sm:py-10">
                <p className="mb-2 text-sm font-semibold text-slate-500">Online banking</p>
                <h1 className="text-3xl font-bold tracking-tight">Sign in to your account</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Enter your details to securely access your accounts.
                </p>

                <div className="mt-8 grid gap-6">
                  <Field
                    id="signInUserId"
                    label="Email or user ID"
                    onChange={(userId) => setCredentials((current) => ({ ...current, userId }))}
                    placeholder="you@example.com"
                    value={credentials.userId}
                  />
                  <div className="relative">
                    <Field
                      id="signInPassword"
                      label="Password"
                      onChange={(password) => setCredentials((current) => ({ ...current, password }))}
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                    />
                    <button
                      className="absolute right-3 top-[39px] rounded px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      onClick={() => setShowPassword((current) => !current)}
                      type="button"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4 text-sm">
                  <label className="flex items-center gap-2 text-slate-700">
                    <input className="h-4 w-4 accent-slate-900" type="checkbox" />
                    Remember me
                  </label>
                  <a className="font-semibold text-slate-800 underline-offset-4 hover:underline" href="#">
                    Forgot password?
                  </a>
                </div>

                <button
                  className="mt-8 w-full rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={!credentials.userId || !credentials.password}
                  type="submit"
                >
                  Sign in
                </button>

                <div className="mt-8 flex items-start gap-3 border-t border-slate-200 pt-6 text-sm text-slate-600">
                  <span className="mt-0.5 text-slate-800">
                    <ShieldIcon />
                  </span>
                  <p className="leading-5">
                    <strong className="block text-slate-800">Secure online banking</strong>
                    We use bank-level encryption to protect your information.
                  </p>
                </div>
              </div>
          </form>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-7xl flex-wrap gap-x-6 gap-y-2 px-5 pb-8 text-xs text-slate-500 sm:px-8">
        <span>© 2025 BNTO Bank</span>
        <a href="#">Privacy</a>
        <a href="#">Security</a>
        <a href="#">Accessibility</a>
        <span className="ml-auto">Member FDIC · Equal Housing Lender</span>
      </footer>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<"create-account" | "sign-in">("create-account");
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const setValue = (key: keyof typeof values) => (value: string) =>
    setValues((current) => ({ ...current, [key]: value }));

  const canContinue =
    step === 0
      ? values.firstName && values.lastName && values.birthDate
      : step === 1
        ? values.email && values.phone && values.address
        : step === 2
          ? values.password.length >= 8 && values.password === values.confirmPassword
          : true;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (step < 3) {
      if (canContinue) setStep((current) => current + 1);
    } else {
      setSubmitted(true);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setStep(0);
    setValues({
      firstName: "",
      lastName: "",
      birthDate: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: "",
    });
  };

  if (page === "sign-in") {
    return <SignInPage onCreateAccount={() => setPage("create-account")} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-300 bg-white">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <a className="flex items-center gap-3 font-bold tracking-tight" href="#" aria-label="BNTO Bank home">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-sm text-white">N</span>
            <span className="text-lg">BNTO Bank</span>
          </a>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="hidden sm:inline">Already a customer?</span>
            <button
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-800 transition hover:border-slate-500 hover:bg-slate-50"
              onClick={() => setPage("sign-in")}
              type="button"
            >
              Sign in
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[300px_1fr] lg:gap-16 lg:py-14">
        <aside>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Open an account</p>
          <h1 className="max-w-xs text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Banking that moves with you.
          </h1>
          <p className="mt-4 max-w-sm text-[15px] leading-6 text-slate-600">
            Apply in about 5 minutes. Your information is encrypted and securely stored.
          </p>

          <ol className="mt-9 hidden space-y-1 lg:block">
            {steps.map((label, index) => (
              <li key={label}>
                <button
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${
                    index === step ? "bg-white font-semibold shadow-sm" : index < step ? "text-slate-700" : "text-slate-500"
                  }`}
                  disabled={index > step}
                  onClick={() => index <= step && setStep(index)}
                  type="button"
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-bold ${
                      index < step
                        ? "border-slate-900 bg-slate-900 text-white"
                        : index === step
                          ? "border-slate-900 bg-white text-slate-900"
                          : "border-slate-300 bg-transparent"
                    }`}
                  >
                    {index < step ? "✓" : index + 1}
                  </span>
                  {label}
                </button>
              </li>
            ))}
          </ol>

          <div className="mt-8 hidden items-start gap-3 border-t border-slate-300 pt-6 text-sm text-slate-600 lg:flex">
            <span className="mt-0.5 text-slate-800"><ShieldIcon /></span>
            <p className="leading-5"><strong className="block text-slate-800">Your privacy matters</strong>We use bank-level encryption to protect your data.</p>
          </div>
        </aside>

        <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <div className="border-b border-slate-200 px-6 py-4 sm:px-10 lg:hidden">
            <div className="mb-2 flex justify-between text-xs font-semibold text-slate-600">
              <span>Step {step + 1} of 4</span><span>{steps[step]}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full bg-slate-900 transition-all" style={{ width: `${((step + 1) / 4) * 100}%` }} />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="min-h-[520px] px-6 py-8 sm:px-10 sm:py-10">
              {submitted ? (
                <div className="flex min-h-[430px] flex-col items-center justify-center text-center">
                  <span className="mb-6 grid h-16 w-16 place-items-center rounded-full bg-slate-900 text-2xl text-white">✓</span>
                  <h2 className="text-3xl font-bold tracking-tight">Application received</h2>
                  <p className="mt-3 max-w-md leading-6 text-slate-600">
                    Thanks, {values.firstName}. We&apos;ve sent a confirmation to {values.email}. We&apos;ll be in touch within one business day.
                  </p>
                  <button className="mt-8 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50" onClick={reset} type="button">
                    Start another application
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <p className="mb-2 text-sm font-semibold text-slate-500">Step {step + 1} of 4</p>
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      {step === 0 && "Tell us about yourself"}
                      {step === 1 && "How can we reach you?"}
                      {step === 2 && "Secure your account"}
                      {step === 3 && "Review your details"}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {step === 0 && "Enter your legal name as it appears on your government-issued ID."}
                      {step === 1 && "We'll only use these details for important account updates."}
                      {step === 2 && "Choose a strong password to protect your online banking."}
                      {step === 3 && "Make sure everything looks right before submitting."}
                    </p>
                  </div>

                  {step === 0 && (
                    <div className="grid gap-6 sm:grid-cols-2">
                      <Field id="firstName" label="First name" placeholder="e.g. Jordan" value={values.firstName} onChange={setValue("firstName")} />
                      <Field id="lastName" label="Last name" placeholder="e.g. Taylor" value={values.lastName} onChange={setValue("lastName")} />
                      <div className="sm:col-span-2">
                        <Field id="birthDate" label="Date of birth" placeholder="MM / DD / YYYY" value={values.birthDate} onChange={setValue("birthDate")} />
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2"><Field id="email" label="Email address" placeholder="you@example.com" type="email" value={values.email} onChange={setValue("email")} /></div>
                      <Field id="phone" label="Mobile number" placeholder="(555) 000-0000" type="tel" value={values.phone} onChange={setValue("phone")} />
                      <Field id="address" label="Home address" placeholder="Street, city, state" value={values.address} onChange={setValue("address")} />
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid gap-6">
                      <div className="relative">
                        <Field id="password" label="Create password" placeholder="At least 8 characters" type={showPassword ? "text" : "password"} value={values.password} onChange={setValue("password")} hint="Use 8 or more characters with a number and symbol." />
                        <button className="absolute right-3 top-[39px] rounded px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100" onClick={() => setShowPassword(!showPassword)} type="button">
                          {showPassword ? "Hide" : "Show"}
                        </button>
                      </div>
                      <Field id="confirmPassword" label="Confirm password" placeholder="Enter it again" type={showPassword ? "text" : "password"} value={values.confirmPassword} onChange={setValue("confirmPassword")} />
                      {values.confirmPassword && values.password !== values.confirmPassword && <p className="-mt-3 text-sm text-red-700">Passwords don&apos;t match yet.</p>}
                    </div>
                  )}

                  {step === 3 && (
                    <div className="divide-y divide-slate-200 rounded-xl border border-slate-200">
                      {[
                        ["Name", `${values.firstName} ${values.lastName}`],
                        ["Date of birth", values.birthDate],
                        ["Email", values.email],
                        ["Phone", values.phone],
                        ["Address", values.address],
                      ].map(([label, value]) => (
                        <div className="flex items-start justify-between gap-6 px-5 py-4" key={label}>
                          <span className="text-sm text-slate-500">{label}</span>
                          <span className="text-right text-sm font-semibold text-slate-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {!submitted && (
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-5 sm:px-10">
                <button className={`text-sm font-semibold text-slate-700 hover:text-slate-950 ${step === 0 ? "invisible" : ""}`} onClick={() => setStep((current) => current - 1)} type="button">
                  ← Back
                </button>
                <button
                  className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={!canContinue}
                  type="submit"
                >
                  {step === 3 ? "Submit application" : "Save and continue →"}
                </button>
              </div>
            )}
          </form>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-wrap gap-x-6 gap-y-2 px-5 pb-8 text-xs text-slate-500 sm:px-8">
        <span>© 2025 BNTO Bank</span><a href="#">Privacy</a><a href="#">Security</a><a href="#">Accessibility</a><span className="ml-auto">Member FDIC · Equal Housing Lender</span>
      </footer>
    </div>
  );
}
