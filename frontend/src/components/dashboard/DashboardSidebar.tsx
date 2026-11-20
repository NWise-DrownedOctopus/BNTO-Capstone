import type { ReactNode } from "react";
import type { DashboardView } from "../../pages/DashboardPage";

type DashboardSidebarProps = {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
};

type NavigationItem = {
  id: DashboardView;
  label: string;
  description: string;
  icon: ReactNode;
};

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: "accounts",
    label: "Accounts",
    description: "View accounts and transactions",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="h-5 w-5"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18M7 15h3" />
      </svg>
    ),
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Explore spending patterns",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="h-5 w-5"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M4 19V5M4 19h17" />
        <rect x="7" y="11" width="3" height="5" rx="0.5" />
        <rect x="13" y="7" width="3" height="9" rx="0.5" />
        <rect x="19" y="4" width="2" height="12" rx="0.5" />
      </svg>
    ),
  },
  {
    id: "budgeting",
    label: "Budgeting",
    description: "Manage monthly budgets",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="h-5 w-5"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="3" y="5" width="18" height="15" rx="2" />
        <path d="M16 5V3M8 5V3M3 10h18M8 15h3" />
      </svg>
    ),
  },
];

export default function DashboardSidebar({
  currentView,
  onViewChange,
}: DashboardSidebarProps) {
  return (
    <nav
      aria-label="Dashboard navigation"
      className="w-full border-b border-slate-200 bg-white p-3 md:w-64 md:shrink-0 md:border-b-0 md:border-r md:p-4"
    >
      <ul className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:pb-0">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive = currentView === item.id;

          return (
            <li
              key={item.id}
              className="min-w-[8.5rem] flex-1 md:min-w-0 md:flex-none"
            >
              <button
                type="button"
                onClick={() => onViewChange(item.id)}
                aria-pressed={isActive}
                className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                  isActive
                    ? "bg-blue-50 text-blue-800"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="shrink-0" aria-hidden="true">
                  {item.icon}
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">
                    {item.label}
                  </span>

                  <span className="hidden truncate text-xs text-slate-500 lg:block">
                    {item.description}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}