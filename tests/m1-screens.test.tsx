import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { HomeScreen } from "@/features/m1/HomeScreen";
import { ProfileScreen } from "@/features/m1/ProfileScreen";
import { UnavailableScreen } from "@/features/m1/UnavailableScreen";
import { LocaleProvider } from "@/i18n/LocaleProvider";

describe("M1 workspace screens", () => {
  it("dashboard links only to real routes and explains absent data", () => {
    render(<LocaleProvider><HomeScreen /></LocaleProvider>);
    expect(screen.getByRole("link", { name: "See recommendation status" })).toHaveAttribute("href", "/rotation");
    expect(screen.getByRole("link", { name: /My parcel/ })).toHaveAttribute("href", "/parcels/new");
    expect(screen.getByText(/No live weather/)).toBeInTheDocument();
  });
  it("rotation renders no recommendations or scores", () => {
    render(<LocaleProvider><UnavailableScreen kind="rotation" /></LocaleProvider>);
    expect(screen.getByText(/Recommendations are not available yet/)).toBeInTheDocument();
    expect(screen.queryByText(/suitability score/i)).not.toBeInTheDocument();
  });
  it("preserves local profile text on a language change", async () => {
    render(<LocaleProvider><ProfileScreen /></LocaleProvider>);
    await userEvent.type(screen.getByRole("textbox", { name: /Display name for this preview/ }), "Test farmer");
    await userEvent.click(screen.getByRole("button", { name: "Darija" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));
    expect(screen.getByRole("textbox", { name: /اسم يظهر/ })).toHaveValue("Test farmer");
    expect(screen.getByText(/ما كايناش أراضي/)).toBeInTheDocument();
  });
});
