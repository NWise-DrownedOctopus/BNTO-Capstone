import Field from "../common/Field";

type RegistrationContactStepProps = {
  email: string;
  phone: string;
  address: string;
  errors?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  onChange: (
    field: "email" | "phone" | "address",
    value: string,
  ) => void;
  disabled?: boolean;
};

export default function RegistrationContactStep({
  email,
  phone,
  address,
  errors = {},
  onChange,
  disabled = false,
}: RegistrationContactStepProps) {
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
        value={email}
        onChange={(event) =>
          onChange("email", event.target.value)
        }
        error={errors.email}
        required
        disabled={disabled}
      />

      <Field
        id="phone"
        name="phone"
        label="Phone number"
        type="tel"
        placeholder="Enter your phone number"
        autoComplete="tel"
        value={phone}
        onChange={(event) =>
          onChange("phone", event.target.value)
        }
        error={errors.phone}
        required
        disabled={disabled}
      />

      <Field
        id="address"
        name="address"
        label="Street address"
        placeholder="Enter your street address"
        autoComplete="street-address"
        value={address}
        onChange={(event) =>
          onChange("address", event.target.value)
        }
        error={errors.address}
        required
        disabled={disabled}
      />
    </div>
  );
}