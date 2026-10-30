type BankLogoProps = {
  size?: "small" | "medium" | "large";
  showName?: boolean;
  className?: string;
};

const SIZE_CLASSES = {
  small: {
    icon: "h-9 w-9 rounded-lg",
    text: "text-lg",
  },
  medium: {
    icon: "h-11 w-11 rounded-xl",
    text: "text-xl",
  },
  large: {
    icon: "h-14 w-14 rounded-2xl",
    text: "text-2xl",
  },
} as const;

export default function BankLogo({
  size = "medium",
  showName = true,
  className = "",
}: BankLogoProps) {
  const styles = SIZE_CLASSES[size];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <div
        className={`flex shrink-0 items-center justify-center bg-blue-700 text-white ${styles.icon}`}
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3/5 w-3/5"
        >
          {/* Stylized bank building */}
          <path d="M3 9h18L12 4 3 9Z" />
          <path d="M5 10v7M9 10v7M15 10v7M19 10v7" />
          <path d="M3 19h18M2 21h20M4 17h16" />
        </svg>
      </div>

      {showName && (
        <span className={`font-bold tracking-tight text-slate-900 ${styles.text}`}>
          BNTO Bank
        </span>
      )}
    </div>
  );
}