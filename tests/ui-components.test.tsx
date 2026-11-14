import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";

describe("shared UI controls", () => {
  it("makes a button of type button and handles clicks", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Continue</Button>);
    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toHaveAttribute("type", "button");
    expect(button.className).toContain("min-h-11");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("supports an accessible card and field error", () => {
    render(
      <Card aria-label="Test panel">
        <TextField label="Parcel name" hint="Optional" error="Invalid text" />
      </Card>,
    );
    const input = screen.getByRole("textbox", { name: "Parcel name" });
    expect(screen.getByRole("region", { name: "Test panel" })).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Optional Invalid text");
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid text");
  });
});
