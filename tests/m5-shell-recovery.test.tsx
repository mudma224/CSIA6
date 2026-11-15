import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { AppFrame } from "@/components/navigation/AppFrame";
import { RecoveryScreen } from "@/features/m5/RecoveryScreen";
import { LocaleProvider } from "@/i18n/LocaleProvider";

vi.mock("next/navigation", () => ({ usePathname: () => "/home" }));

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
});

function wrap(content: ReactNode) {
  return render(<LocaleProvider>{content}</LocaleProvider>);
}

describe("M5 accessible workspace shell", () => {
  it("preserves five navigation targets on both viewport variants", () => {
    wrap(<AppFrame><h1>Workspace content</h1></AppFrame>);
    const navs = screen.getAllByRole("navigation", { name: "Main navigation" });
    expect(navs).toHaveLength(2);
    for (const nav of navs) {
      expect(nav.querySelectorAll("a")).toHaveLength(5);
      expect(nav.querySelector('a[href="/rotation"]')).not.toBeNull();
      expect(nav.querySelector('a[href="/map"]')).not.toBeNull();
      expect(nav.querySelector('a[href="/community"]')).not.toBeNull();
    }
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("provides keyboard-compatible skip link targeting its unique main", () => {
    wrap(<AppFrame><h1>Workspace content</h1></AppFrame>);
    const skip = screen.getByRole("link", { name: "Skip to content" });
    expect(skip).toHaveAttribute("href", "#main-content");
    expect(document.querySelectorAll("#main-content")).toHaveLength(1);
    expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");
  });

  it("exposes real demo disclaimer and an always-available language switcher", async () => {
    const user = userEvent.setup();
    wrap(<AppFrame><h1>Workspace content</h1></AppFrame>);
    expect(screen.getByText(/Frontend demonstration · no real account/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Darija" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));
    expect(document.documentElement).toHaveAttribute("lang", "ary");
    expect(screen.getAllByRole("link", { name: "الخريطة" })[0]).toHaveAttribute("href", "/map");
    expect(screen.getByRole("heading", { name: "Workspace content" })).toBeInTheDocument();
  });
});

describe("M5 honest recovery screens", () => {
  it("404 has translated guidance and no fake results or retry", () => {
    wrap(<RecoveryScreen kind="not-found" />);
    expect(screen.getByRole("heading", { name: "This page is not available" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to Home" })).toHaveAttribute("href", "/home");
    expect(screen.getByRole("link", { name: "Return to welcome" })).toHaveAttribute("href", "/");
    expect(screen.queryByRole("button", { name: "Try this screen again" })).not.toBeInTheDocument();
    expect(screen.getByText(/frontend demonstration/)).toBeInTheDocument();
  });

  it("render-error recovery invokes ONLY the provided reset callback", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    wrap(<RecoveryScreen kind="error" onRetry={reset} />);
    expect(screen.getByRole("heading", { name: "This screen could not open" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try this screen again" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("404/recovery copy is bilingual and does not lose its actions", async () => {
    const user = userEvent.setup();
    wrap(<RecoveryScreen kind="not-found" />);
    await user.click(screen.getByRole("button", { name: "Darija" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));
    expect(screen.getByRole("heading", { name: "هاد الصفحة ما متوفراش" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "رجع للرئيسية" })).toHaveAttribute("href", "/home");
  });
});
