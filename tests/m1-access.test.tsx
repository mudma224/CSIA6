import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AccessScreen } from "@/features/m1/AccessScreen";
import { LocaleProvider } from "@/i18n/LocaleProvider";

describe("M1 access preview", () => {
  it("shows a user-friendly format error for invalid phone", async () => {
    render(<LocaleProvider><AccessScreen /></LocaleProvider>);
    const phone = screen.getByRole("textbox", { name: /Moroccan mobile number/ });
    await userEvent.type(phone, "123");
    await userEvent.click(screen.getByRole("button", { name: "Check format only" }));
    expect(phone).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("does not match");
  });
  it("checks format without implying a sent SMS", async () => {
    render(<LocaleProvider><AccessScreen /></LocaleProvider>);
    await userEvent.type(screen.getByRole("textbox", { name: /Moroccan mobile number/ }), "0612345678");
    await userEvent.click(screen.getByRole("button", { name: "Check format only" }));
    expect(screen.getByRole("status")).toHaveTextContent("No SMS was sent");
  });
  it("allows demo access without entering a phone", () => {
    render(<LocaleProvider><AccessScreen /></LocaleProvider>);
    expect(screen.getByRole("link", { name: "Enter demo" })).toHaveAttribute("href", "/home");
    expect(screen.getByText(/no SMS verification, account creation or authentication/i)).toBeInTheDocument();
  });
});