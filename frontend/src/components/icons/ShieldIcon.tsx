type ShieldIconProps = {
  className?: string;
  size?: number;
  decorative?: boolean;
};

export default function ShieldIcon({
  className = "",
  size = 24,
  decorative = true,
}: ShieldIconProps) {
  const iconSize = Number.isFinite(size) && size > 0 ? size : 24;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "Security shield"}
      focusable="false"
    >
      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}