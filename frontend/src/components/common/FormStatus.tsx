type FormStatusProps = {
  message: string;
  type?: "info" | "error" | "success";
  className?: string;
};

const STATUS_STYLES = {
  info: {
    container: "border-blue-200 bg-blue-50",
    text: "text-blue-800",
    icon: "text-blue-700",
  },
  error: {
    container: "border-red-200 bg-red-50",
    text: "text-red-800",
    icon: "text-red-700",
  },
  success: {
    container: "border-green-200 bg-green-50",
    text: "text-green-800",
    icon: "text-green-700",
  },
} as const;

function StatusIcon({
  type,
}: {
  type: NonNullable<FormStatusProps["type"]>;
}) {
  return (
    <svg
      className={`mt-0.5 h-5 w-5 shrink-0 ${STATUS_STYLES[type].icon}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {type === "error" ? (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4m0 4h.01" />
        </>
      ) : type === "success" ? (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="m8 12 3 3 5-6" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 11v5m0-8h.01" />
        </>
      )}
    </svg>
  );
}

export default function FormStatus({
  message,
  type = "info",
  className = "",
}: FormStatusProps) {
  if (!message.trim()) {
    return null;
  }

  const styles = STATUS_STYLES[type];

  const containerClasses = [
    "flex items-start gap-2 rounded-lg border p-3",
    styles.container,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={containerClasses}
    >
      <StatusIcon type={type} />

      <p className={`min-w-0 text-sm leading-5 ${styles.text}`}>
        {message}
      </p>
    </div>
  );
}