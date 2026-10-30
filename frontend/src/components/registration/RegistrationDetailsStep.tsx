import Field from "../common/Field";

type RegistrationDetailsStepProps = {
  firstName: string;
  lastName: string;
  birthDate: string;
  errors?: {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
  };
  onChange: (
    field: "firstName" | "lastName" | "birthDate",
    value: string,
  ) => void;
  disabled?: boolean;
};

export default function RegistrationDetailsStep({
  firstName,
  lastName,
  birthDate,
  errors = {},
  onChange,
  disabled = false,
}: RegistrationDetailsStepProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          id="firstName"
          name="firstName"
          label="First name"
          placeholder="Enter your first name"
          autoComplete="given-name"
          value={firstName}
          onChange={(event) =>
            onChange("firstName", event.target.value)
          }
          error={errors.firstName}
          required
          disabled={disabled}
        />

        <Field
          id="lastName"
          name="lastName"
          label="Last name"
          placeholder="Enter your last name"
          autoComplete="family-name"
          value={lastName}
          onChange={(event) =>
            onChange("lastName", event.target.value)
          }
          error={errors.lastName}
          required
          disabled={disabled}
        />
      </div>

      <Field
        id="birthDate"
        name="birthDate"
        label="Date of birth"
        type="date"
        autoComplete="bday"
        value={birthDate}
        onChange={(event) =>
          onChange("birthDate", event.target.value)
        }
        error={errors.birthDate}
        required
        disabled={disabled}
      />
    </div>
  );
}