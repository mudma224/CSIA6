import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalendarScreen } from "@/features/m4/CalendarScreen";
import { HomeScreen } from "@/features/m1/HomeScreen";
import { LocaleProvider } from "@/i18n/LocaleProvider";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
});

describe("M4 calendar and dashboard", () => {
  it("renders an honest empty vetted-calendar state with no invented dates", () => {
    render(<LocaleProvider><CalendarScreen /></LocaleProvider>);
    expect(screen.getByRole("heading", { name: "Crop calendar unavailable" })).toBeInTheDocument();
    expect(screen.getByText(/will not show guessed months/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/home");
    expect(screen.queryByText(/2027|plant in March|harvest in June/i)).not.toBeInTheDocument();
  });

  it("links to the real M4 routes while preserving M2/M3 routes", () => {
    render(<LocaleProvider><HomeScreen /></LocaleProvider>);
    expect(screen.getByRole("link", { name: /Crop calendar/ })).toHaveAttribute("href", "/calendar");
    expect(screen.getByRole("link", { name: /Farmer community/ })).toHaveAttribute("href", "/community");
    expect(screen.getByRole("link", { name: /My parcel/ })).toHaveAttribute("href", "/parcels/new");
    expect(screen.getByRole("link", { name: /Tadla map/ })).toHaveAttribute("href", "/map");
    expect(screen.getByRole("link", { name: "See recommendation status" })).toHaveAttribute("href", "/rotation");
  });

  it("never describes the community as a public service or promises live data", () => {
    render(<LocaleProvider><HomeScreen /></LocaleProvider>);
    expect(screen.getByText(/Only posts you add on this screen/)).toBeInTheDocument();
    expect(screen.getByText(/No live weather/)).toBeInTheDocument();
    expect(screen.queryByText(/Community tools are not available yet/)).not.toBeInTheDocument();
  });
});
