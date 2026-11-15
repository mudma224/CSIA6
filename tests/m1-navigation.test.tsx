import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PrimaryNav } from "@/components/navigation/PrimaryNav";
import { LocaleSwitcher } from "@/components/m1/LocaleSwitcher";
import { LocaleProvider } from "@/i18n/LocaleProvider";

vi.mock("next/navigation", () => ({ usePathname: () => "/home" }));

describe("M1 navigation", () => {
  it("renders five actual link targets and marks active route", () => {
    render(<LocaleProvider><PrimaryNav mobile /></LocaleProvider>);
    const navigation = screen.getByRole("navigation", { name: "Main navigation" });
    expect(navigation.querySelectorAll("a")).toHaveLength(5);
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Rotation" })).toHaveAttribute("href", "/rotation");
    expect(screen.getByRole("link", { name: "Map" })).toHaveAttribute("href", "/map");
    expect(screen.getByRole("link", { name: "Community" })).toHaveAttribute("href", "/community");
    expect(screen.getByRole("link", { name: "Profile" })).toHaveAttribute("href", "/profile");
  });
  it("translates navigation and updates document direction", async () => {
    render(<LocaleProvider><LocaleSwitcher /><PrimaryNav /></LocaleProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Darija" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));
    expect(screen.getByRole("link", { name: "الخريطة" })).toHaveAttribute("href", "/map");
  });
});
