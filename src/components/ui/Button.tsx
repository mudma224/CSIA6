import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "soft";
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variants: Record<Variant, string> = {
  primary: "bg-forest text-white hover:bg-forest-deep",
  outline: "border border-forest bg-white text-forest hover:bg-mint",
  soft: "bg-mint text-forest hover:bg-sage",
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] px-5 py-2 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
