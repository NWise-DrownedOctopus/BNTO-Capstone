import { useState, type FormEvent } from "react";
import { registerUser } from "../api/auth";
import Field from "../components/common/Field";
import PasswordField from "../components/common/PasswordField";
import ShieldIcon from "../components/icons/ShieldIcon";

type CreateAccountPageProps = {
  onSignIn: () => void;
};

type RegistrationValues = {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
};

type RegistrationErrors = Partial<Record<keyof RegistrationValues, string>>;

const INITIAL_VALUES: RegistrationValues = {
  firstName: "",
  lastName: "",
  birthDate: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  confirmPassword: "",
};

const STEPS = [
  { title: "Your details", description: "Tell us a little about yourself." },
  { title: "Contact info", description: "How can we reach you?" },
  {
    title: "Security",
    description: "Create a secure password for your account.",
  },
  {
    title: "Review",
    description: "Review your information before submitting.",
  },
];

function validateBirthDate(value: string): string | undefined {
  if (!value) {
    return "Enter your date of birth.";
  }

  // Require a real calendar date in YYYY-MM-DD format.
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return "Enter a valid date of birth.";
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "Enter a valid date of birth.";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date > today) {
    return "Your date of birth cannot be in the future.";
  }

  return undefined;
}

export default function CreateAccountPage({
  onSignIn,
}: CreateAccountPageProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<RegistrationValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateValue = (field: keyof RegistrationValues, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setFormError("");
  };

  const getStepErrors = (step: number): RegistrationErrors => {
    const nextErrors: RegistrationErrors = {};

    if (step === 0) {
      if (!values.firstName.trim()) {
        nextErrors.firstName = "Enter your first name.";
      }

      if (!values.lastName.trim()) {
        nextErrors.lastName = "Enter your last name.";
      }

      const birthDateError = validateBirthDate(values.birthDate);
      if (birthDateError) {
        nextErrors.birthDate = birthDateError;
      }
    }

    if (step === 1) {
      const email = values.email.trim();

      if (!email) {
        nextErrors.email = "Enter your email address.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        nextErrors.email = "Enter a valid email address.";
      }

      if (!values.phone.trim()) {
        nextErrors.phone = "Enter your phone number.";
      }

      if (!values.address.trim()) {
        nextErrors.address = "Enter your street address.";
      }
    }

    if (step === 2) {
      if (!values.password) {
        nextErrors.password = "Create a password.";
      } else if (values.password.length < 8) {
        nextErrors.password =
          "Your password must be at least 8 characters long.";
      }

      if (!values.confirmPassword) {
        nextErrors.confirmPassword =
          "Enter your password again to confirm it.";
      } else if (values.password !== values.confirmPassword) {
        nextErrors.confirmPassword = "Your passwords do not match.";
      }
    }

    return nextErrors;
  };

  const validateStep = (step: number): boolean => {
    const nextErrors = getStepErrors(step);
    setErrors((previous) => {
      const updated = { ...previous };

      const fieldsByStep: Record<number, (keyof RegistrationValues)[]> = {
        0: ["firstName", "lastName", "birthDate"],
        1: ["email", "phone", "address"],
        2: ["password", "confirmPassword"],
      };

      for (const field of fieldsByStep[step] ?? []) {
        delete updated[field];
      }

      return { ...updated, ...nextErrors };
    });

    return Object.keys(nextErrors).length === 0;
  };

  const goToStep = (step: number) => {
    if (isSubmitting || step < 0 || step >= STEPS.length) {
      return;
    }

    if (step < currentStep) {
      setCurrentStep(step);
      setFormError("");
      return;
    }

    if (step === currentStep) {
      return;
    }

    if (!validateStep(currentStep)) {
      return;
    }

    setCurrentStep(step);
    setFormError("");
  };

  const handleContinue = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep((step) => step + 1);
      setFormError("");
    }
  };

  const handleBack = () => {
    if (currentStep > 0 && !isSubmitting) {
      setCurrentStep((step) => step - 1);
      setFormError("");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (currentStep < STEPS.length - 1) {
      handleContinue();
      return;
    }

    // Validate every step before sending the registration request.
    const allErrors: RegistrationErrors = {};
    let firstInvalidStep = -1;

    for (let step = 0; step < STEPS.length - 1; step += 1) {
      const stepErrors = getStepErrors(step);
      Object.assign(allErrors, stepErrors);

      if (firstInvalidStep === -1 && Object.keys(stepErrors).length > 0) {
        firstInvalidStep = step;
      }
    }

    setErrors(allErrors);

    if (firstInvalidStep !== -1) {
      setCurrentStep(firstInvalidStep);
      setFormError("");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      // Keep this payload aligned with the current registerUser API contract.
      // Confirm whether the backend supports the additional profile fields
      // before adding them to this request.
      await registerUser({
        email: values.email.trim(),
        password: values.password,
      });

      setIsSubmitted(true);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "We couldn't create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                id="firstName"
                name="firstName"
                label="First name"
                placeholder="Enter your first name"
                autoComplete="given-name"
                value={values.firstName}
                onChange={(event) =>
                  updateValue("firstName", event.target.value)
                }
                error={errors.firstName}
                required
                disabled={isSubmitting}
              />

              <Field
                id="lastName"
                name="lastName"
                label="Last name"
                placeholder="Enter your last name"
                autoComplete="family-name"
                value={values.lastName}
                onChange={(event) =>
                  updateValue("lastName", event.target.value)
                }
                error={errors.lastName}
                required
                disabled={isSubmitting}
              />
            </div>

            <Field
              id="birthDate"
              name="birthDate"
              label="Date of birth"
              type="date"
              autoComplete="bday"
              value={values.birthDate}
              onChange={(event) =>
                updateValue("birthDate", event.target.value)
              }
              error={errors.birthDate}
              required
              disabled={isSubmitting}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-5">
            <Field
              id="email"
              name="email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              inputMode="email"
              value={values.email}
              onChange={(event) => updateValue("email", event.target.value)}
              error={errors.email}
              required
              disabled={isSubmitting}
            />

            <Field
              id="phone"
              name="phone"
              label="Phone number"
              type="tel"
              placeholder="Enter your phone number"
              autoComplete="tel"
              value={values.phone}
              onChange={(event) => updateValue("phone", event.target.value)}
              error={errors.phone}
              required
              disabled={isSubmitting}
            />

            <Field
              id="address"
              name="address"
              label="Street address"
              placeholder="Enter your street address"
              autoComplete="street-address"
              value={values.address}
              onChange={(event) => updateValue("address", event.target.value)}
              error={errors.address}
              required
              disabled={isSubmitting}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <PasswordField
              id="password"
              name="password"
              label="Create password"
              value={values.password}
              onChange={(value) => updateValue("password", value)}
              autoComplete="new-password"
              placeholder="Create a password"
              error={errors.password}
              hint="Use at least 8 characters."
              required
              disabled={isSubmitting}
            />

            <PasswordField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm password"
              value={values.confirmPassword}
              onChange={(value) => updateValue("confirmPassword", value)}
              autoComplete="new-password"
              placeholder="Enter your password again"
              error={errors.confirmPassword}
              required
              disabled={isSubmitting}
            />

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldIcon
                  size={22}
                  className="mt-0.5 shrink-0 text-blue-700"
                />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900">
                    Protect your account
                  </h3>
                  <p className="mt-1 text-sm leading-5 text-blue-800">
                    Choose a password that is difficult to guess and avoid
                    reusing a password from another account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <section
              aria-labelledby="review-personal-heading"
              className="rounded-xl border border-gray-200 p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3
                  id="review-personal-heading"
                  className="font-semibold text-gray-900"
                >
                  Personal details
                </h3>
                <button
                  type="button"
                  onClick={() => goToStep(0)}
                  className="min-h-11 rounded text-sm font-medium text-blue-700 underline underline-offset-4 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Edit<span className="sr-only"> personal details</span>
                </button>
              </div>

              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-gray-600">First name</dt>
                  <dd className="mt-1 break-words font-medium text-gray-900">
                    {values.firstName || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Last name</dt>
                  <dd className="mt-1 break-words font-medium text-gray-900">
                    {values.lastName || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Date of birth</dt>
                  <dd className="mt-1 break-words font-medium text-gray-900">
                    {values.birthDate || "Not provided"}
                  </dd>
                </div>
              </dl>
            </section>

            <section
              aria-labelledby="review-contact-heading"
              className="rounded-xl border border-gray-200 p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3
                  id="review-contact-heading"
                  className="font-semibold text-gray-900"
                >
                  Contact information
                </h3>
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="min-h-11 rounded text-sm font-medium text-blue-700 underline underline-offset-4 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Edit<span className="sr-only"> contact information</span>
                </button>
              </div>

              <dl className="space-y-4">
                <div>
                  <dt className="text-sm text-gray-600">Email address</dt>
                  <dd className="mt-1 break-words font-medium text-gray-900">
                    {values.email || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Phone number</dt>
                  <dd className="mt-1 break-words font-medium text-gray-900">
                    {values.phone || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-gray-600">Street address</dt>
                  <dd className="mt-1 break-words font-medium text-gray-900">
                    {values.address || "Not provided"}
                  </dd>
                </div>
              </dl>
            </section>

            <section
              aria-labelledby="review-security-heading"
              className="rounded-xl border border-gray-200 p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3
                  id="review-security-heading"
                  className="font-semibold text-gray-900"
                >
                  Security
                </h3>
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="min-h-11 rounded text-sm font-medium text-blue-700 underline underline-offset-4 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                >
                  Edit<span className="sr-only"> security information</span>
                </button>
              </div>

              <p className="text-sm text-gray-700">
                Password: <span className="font-medium">Set</span>
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Your password is not displayed on this review screen.
              </p>
            </section>

            <p className="text-sm leading-6 text-gray-600">
              By creating an account, you confirm that the information you
              provided is accurate. Please review your details before
              submitting.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="m5 12 4 4L19 6" />
              </svg>
            </div>

            <h1 className="mt-5 text-center text-2xl font-bold text-gray-900">
              Registration submitted
            </h1>
            <p className="mt-3 text-center leading-6 text-gray-600">
              Your registration request was submitted successfully. You can
              continue to the sign-in page.
            </p>

            <div className="mt-8">
              <button
                type="button"
                onClick={onSignIn}
                className="min-h-11 w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Continue to sign in
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4"
            aria-label="BNTO Bank home"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 text-white">
              <ShieldIcon size={27} />
            </span>
            <span>
              <span className="block text-2xl font-bold tracking-tight text-gray-900">
                BNTO Bank
              </span>
              <span className="block text-sm text-gray-600">
                Banking made simpler
              </span>
            </span>
          </a>
        </header>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="border-b border-gray-200 bg-gray-50 p-5 md:border-b-0 md:border-r md:p-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Create your account
              </h2>
              <p className="mt-2 text-sm leading-5 text-gray-600">
                Complete each step to get started with BNTO Bank.
              </p>

              <nav aria-label="Registration progress" className="mt-6">
                <ol className="space-y-3">
                  {STEPS.map((step, index) => {
                    const isCurrent = index === currentStep;
                    const isComplete = index < currentStep;
                    const isFuture = index > currentStep;

                    return (
                      <li key={step.title}>
                        <button
                          type="button"
                          disabled={isFuture || isSubmitting}
                          aria-current={isCurrent ? "step" : undefined}
                          onClick={() => goToStep(index)}
                          className={[
                            "flex min-h-11 w-full items-start gap-3 rounded-lg p-3 text-left",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2",
                            isCurrent
                              ? "bg-blue-100 text-blue-950"
                              : isComplete
                                ? "text-gray-800 hover:bg-gray-100"
                                : "cursor-not-allowed text-gray-400",
                          ].join(" ")}
                        >
                          <span
                            aria-hidden="true"
                            className={[
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                              isCurrent
                                ? "border-blue-700 bg-blue-700 text-white"
                                : isComplete
                                  ? "border-green-700 bg-green-700 text-white"
                                  : "border-gray-300 bg-white text-gray-500",
                            ].join(" ")}
                          >
                            {isComplete ? "✓" : index + 1}
                          </span>

                          <span>
                            <span className="block text-sm font-semibold">
                              {step.title}
                            </span>
                            <span className="mt-1 block text-xs leading-5">
                              {step.description}
                            </span>
                            {isCurrent && (
                              <span className="sr-only"> — Current step</span>
                            )}
                            {isComplete && (
                              <span className="sr-only"> — Completed</span>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </nav>

              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <ShieldIcon
                    size={20}
                    className="mt-0.5 shrink-0 text-blue-700"
                  />
                  <p className="text-sm leading-5 text-blue-900">
                    Your security matters. Keep your sign-in information
                    private.
                  </p>
                </div>
              </div>
            </aside>

            <section className="p-5 sm:p-8 lg:p-10">
              <div className="mb-8">
                <p className="text-sm font-semibold text-blue-700">
                  Step {currentStep + 1} of {STEPS.length}
                </p>
                <h1
                  id="registration-step-heading"
                  className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
                >
                  {STEPS[currentStep].title}
                </h1>
                <p className="mt-2 leading-6 text-gray-600">
                  {STEPS[currentStep].description}
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                aria-labelledby="registration-step-heading"
                noValidate
              >
                {formError && (
                  <div
                    role="alert"
                    className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800"
                  >
                    <p className="font-semibold">
                      We couldn't complete your registration.
                    </p>
                    <p className="mt-1">{formError}</p>
                  </div>
                )}

                <div>{renderStepContent()}</div>

                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={currentStep === 0 ? onSignIn : handleBack}
                    disabled={isSubmitting}
                    className="min-h-11 rounded-lg border border-gray-300 bg-white px-5 py-3 text-center font-semibold text-gray-800 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {currentStep === 0 ? "Already have an account?" : "Back"}
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-h-11 rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting
                      ? "Creating account..."
                      : currentStep === STEPS.length - 1
                        ? "Create account"
                        : "Continue"}
                  </button>
                </div>

                <p
                  className="mt-4 text-center text-sm text-gray-600"
                  aria-live="polite"
                >
                  {isSubmitting
                    ? "Please wait while we submit your registration."
                    : `Step ${currentStep + 1} of ${STEPS.length}`}
                </p>
              </form>
            </section>
          </div>
        </div>

        <footer className="mt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} BNTO Bank. All rights reserved.</p>
          <p className="mt-1">
            If you need assistance, contact our support team.
          </p>
        </footer>
      </div>
    </main>
  );
}