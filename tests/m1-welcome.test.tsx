import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { WelcomeScreen } from "@/features/m1/WelcomeScreen";
import { LocaleProvider } from "@/i18n/LocaleProvider";

describe("M1 welcome", () => {
  it("shows a clear demo entry and honest missing-audio text", () => {
    render(<LocaleProvider><WelcomeScreen /></LocaleProvider>);
    expect(screen.getByRole("link", { name: "Continue" })).toHaveAttribute("href", "/access");
    expect(screen.getByText(/No reviewed recording is available/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Play audio" })).not.toBeInTheDocument();
  });
  it("switches to Darija and RTL before entry", async () => {
    render(<LocaleProvider><WelcomeScreen /></LocaleProvider>);
    await userEvent.click(screen.getByRole("button", { name: "Darija" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));
    expect(screen.getByRole("link", { name: "كمّل" })).toHaveAttribute("href", "/access");
  });
});
