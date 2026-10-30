import PasswordField from "../common/PasswordField";
import ShieldIcon from "../icons/ShieldIcon";

type RegistrationSecurityStepProps = {
  password: string;
  confirmPassword: string;
  errors?: {
    password?: string;
    confirmPassword?: string;
  };
  onChange: (
    field: "password" | "confirmPassword",
    value: string,
  ) => void;
  disabled?: boolean;
};

export default function RegistrationSecurityStep({
  password,
  confirmPassword,
  errors = {},
  onChange,
  disabled = false,
}: RegistrationSecurityStepProps) {
  return (
    <div className="space-y-5">
      <PasswordField
        id="password"
        name="new-password"
        label="Create password"
        value={password}
        onChange={(value) => onChange("password", value)}
        autoComplete="new-password"
        placeholder="Create a password"
        error={errors.password}
        hint="Use at least 8 characters."
        required
        disabled={disabled}
      />

      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm password"
        value={confirmPassword}
        onChange={(value) => onChange("confirmPassword", value)}
        autoComplete="new-password"
        placeholder="Enter your password again"
        error={errors.confirmPassword}
        required
        disabled={disabled}
      />

      <section
        aria-labelledby="password-security-heading"
        className="rounded-lg border border-blue-200 bg-blue-50 p-4"
      >
        <div className="flex items-start gap-3">
          <ShieldIcon
            size={22}
            className="mt-0.5 shrink-0 text-blue-700"
          />

          <div>
            <h3
              id="password-security-heading"
              className="text-sm font-semibold text-blue-900"
            >
              Protect your account
            </h3>

            <p className="mt-1 text-sm leading-5 text-blue-800">
              Choose a password that is difficult to guess and avoid
              reusing a password from another account.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}