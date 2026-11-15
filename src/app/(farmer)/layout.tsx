
import type { ReactNode } from "react";
import { LocaleProvider } from "@/i18n/LocaleProvider";

export default function FarmerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <LocaleProvider>
      {children}
    </LocaleProvider>
  );
}
