type RegistrationReviewStepProps = {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  phone: string;
  address: string;
  onEditStep: (step: number) => void;
  disabled?: boolean;
};

export default function RegistrationReviewStep({
  firstName,
  lastName,
  birthDate,
  email,
  phone,
  address,
  onEditStep,
  disabled = false,
}: RegistrationReviewStepProps) {
  const sectionClassName =
    "rounded-xl border border-gray-200 p-4";

  const headingClassName =
    "font-semibold text-gray-900";

  const labelClassName =
    "text-sm text-gray-600";

  const valueClassName =
    "mt-1 break-words font-medium text-gray-900";

  const editButtonClassName = [
    "rounded text-sm font-medium text-blue-700 underline underline-offset-4",
    "hover:text-blue-900",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-blue-600 focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ].join(" ");

  const renderDetail = (
    label: string,
    value: string,
  ) => (
    <div>
      <dt className={labelClassName}>{label}</dt>
      <dd className={valueClassName}>
        {value.trim() || "Not provided"}
      </dd>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Personal details */}
      <section
        aria-labelledby="review-personal-heading"
        className={sectionClassName}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3
            id="review-personal-heading"
            className={headingClassName}
          >
            Personal details
          </h3>

          <button
            type="button"
            onClick={() => onEditStep(0)}
            disabled={disabled}
            className={editButtonClassName}
          >
            Edit
            <span className="sr-only"> personal details</span>
          </button>
        </div>

        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {renderDetail("First name", firstName)}
          {renderDetail("Last name", lastName)}
          {renderDetail("Date of birth", birthDate)}
        </dl>
      </section>

      {/* Contact information */}
      <section
        aria-labelledby="review-contact-heading"
        className={sectionClassName}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3
            id="review-contact-heading"
            className={headingClassName}
          >
            Contact information
          </h3>

          <button
            type="button"
            onClick={() => onEditStep(1)}
            disabled={disabled}
            className={editButtonClassName}
          >
            Edit
            <span className="sr-only"> contact information</span>
          </button>
        </div>

        <dl className="space-y-4">
          {renderDetail("Email address", email)}
          {renderDetail("Phone number", phone)}
          {renderDetail("Street address", address)}
        </dl>
      </section>

      {/* Security information */}
      <section
        aria-labelledby="review-security-heading"
        className={sectionClassName}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3
            id="review-security-heading"
            className={headingClassName}
          >
            Security
          </h3>

          <button
            type="button"
            onClick={() => onEditStep(2)}
            disabled={disabled}
            className={editButtonClassName}
          >
            Edit
            <span className="sr-only"> security information</span>
          </button>
        </div>

        <p className="text-sm text-gray-700">
          Password: <span className="font-medium">Set</span>
        </p>

        <p className="mt-2 text-sm text-gray-600">
          Your password is not displayed on this review screen.
        </p>
      </section>

      {/* Final confirmation */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm leading-6 text-gray-700">
          Please review your information before continuing. By
          creating an account, you confirm that the information you
          provided is accurate.
        </p>
      </div>
    </div>
  );
}