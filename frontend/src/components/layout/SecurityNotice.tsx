import { useId } from "react";
import ShieldIcon from "../icons/ShieldIcon";

type SecurityNoticeProps = {
  title?: string;
  message?: string;
  variant?: "default" | "success" | "warning";
};

const variantStyles = {
  default: {
    container: "border-blue-200 bg-blue-50",
    icon: "text-blue-700",
    title: "text-blue-900",
    message: "text-blue-800",
  },
  success: {
    container: "border-green-200 bg-green-50",
    icon: "text-green-700",
    title: "text-green-900",
    message: "text-green-800",
  },
  warning: {
    container: "border-amber-200 bg-amber-50",
    icon: "text-amber-700",
    title: "text-amber-900",
    message: "text-amber-800",
  },
} as const;

export default function SecurityNotice({
  title = "Your security matters",
  message = "Your information is protected using secure banking practices.",
  variant = "default",
}: SecurityNoticeProps) {
  const styles = variantStyles[variant];
  const titleId = useId();

  return (
    <aside
      className={[
        "flex items-start gap-3 rounded-lg border p-4",
        styles.container,
      ].join(" ")}
      aria-labelledby={titleId}
    >
      <span
        className={`mt-0.5 shrink-0 ${styles.icon}`}
        aria-hidden="true"
      >
        <ShieldIcon size={22} />
      </span>

      <div className="min-w-0">
        <h2
          id={titleId}
          className={`text-sm font-semibold ${styles.title}`}
        >
          {title}
        </h2>

        <p className={`mt-1 text-sm ${styles.message}`}>
          {message}
        </p>
      </div>
    </aside>
  );
}