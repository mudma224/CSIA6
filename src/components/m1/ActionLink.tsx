import Link from "next/link";
import type { ReactNode } from "react";

type ActionLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "outline";
  className?: string;
};

export function ActionLink({
  href,
  children,
  variant = "primary",
  className = "",
}: ActionLinkProps) {
  const colors = variant === "primary"
    ? "bg-forest text-white hover:bg-forest-deep"
    : "border border-forest bg-white text-forest hover:bg-mint";

  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] px-5 py-3 text-center text-base font-bold ${colors} ${className}`}
    >
      {children}
    </Link>
  );
}
