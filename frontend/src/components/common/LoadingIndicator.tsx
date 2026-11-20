type LoadingIndicatorProps = {
  label?: string;
  size?: "small" | "medium" | "large";
  fullPage?: boolean;
};

const SIZE_CLASSES = {
  small: "h-4 w-4 border-2",
  medium: "h-6 w-6 border-2",
  large: "h-10 w-10 border-4",
} as const;

export default function LoadingIndicator({
  label = "Loading...",
  size = "medium",
  fullPage = false,
}: LoadingIndicatorProps) {
  const sizeClasses = SIZE_CLASSES[size] ?? SIZE_CLASSES.medium;

  const indicator = (
    <div role="status" className="flex items-center gap-3">
      <span
        className={`inline-block shrink-0 animate-spin rounded-full border-slate-200 border-t-blue-700 motion-reduce:animate-none ${sizeClasses}`}
        aria-hidden="true"
      />

      <span className="min-w-0 text-sm font-medium text-slate-700">
        {label}
      </span>
    </div>
  );

  if (!fullPage) {
    return indicator;
  }

  return (
    <div className="flex min-h-64 items-center justify-center p-6">
      {indicator}
    </div>
  );
}