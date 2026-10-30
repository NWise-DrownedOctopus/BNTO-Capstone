type RegistrationStepsProps = {
  currentStep: number;
  onStepChange: (step: number) => void;
  disabled?: boolean;
};

const STEPS = [
  "Your details",
  "Contact info",
  "Security",
  "Review",
];

export default function RegistrationSteps({
  currentStep,
  onStepChange,
  disabled = false,
}: RegistrationStepsProps) {
  return (
    <nav aria-label="Registration progress">
      <ol className="space-y-1">
        {STEPS.map((label, index) => {
          const isCurrent = index === currentStep;
          const isComplete = index < currentStep;
          const isFuture = index > currentStep;

          return (
            <li key={label}>
              <button
                type="button"
                aria-current={isCurrent ? "step" : undefined}
                disabled={disabled || isFuture}
                onClick={() => {
                  if (!isFuture && !disabled) {
                    onStepChange(index);
                  }
                }}
                className={[
                  "flex w-full items-center gap-3 rounded-lg px-3 py-3",
                  "text-left text-sm transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-slate-900 focus-visible:ring-offset-2",
                  isCurrent
                    ? "bg-white font-semibold text-slate-950 shadow-sm"
                    : isComplete
                      ? "text-slate-700 hover:bg-white/70"
                      : "text-slate-500",
                  isFuture || disabled
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "grid h-7 w-7 shrink-0 place-items-center",
                    "rounded-full border text-xs font-bold",
                    isComplete
                      ? "border-slate-900 bg-slate-900 text-white"
                      : isCurrent
                        ? "border-slate-900 bg-white text-slate-900"
                        : "border-slate-300 bg-transparent text-slate-500",
                  ].join(" ")}
                >
                  {isComplete ? "✓" : index + 1}
                </span>

                <span>{label}</span>

                {isCurrent && (
                  <span className="sr-only"> — Current step</span>
                )}

                {isComplete && (
                  <span className="sr-only"> — Completed</span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}