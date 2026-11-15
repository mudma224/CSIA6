import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeScreen } from "@/features/m1/HomeScreen";
import { RotationScreen } from "@/features/m2/RotationScreen";
import { LocaleProvider } from "@/i18n/LocaleProvider";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
});

describe("M2 Home / Rotation links", () => {
  it("Home offers a real parcel-form link, while next-crop still opens unavailable rotation", () => {
    render(<LocaleProvider><HomeScreen /></LocaleProvider>);
    expect(screen.getByRole("link", { name: /My parcel/ })).toHaveAttribute("href", "/parcels/new");
    expect(screen.getByRole("link", { name: "See recommendation status" })).toHaveAttribute("href", "/rotation");
    expect(screen.getByText(/No server save or recommendation/i)).toBeInTheDocument();
  });

  it("Rotation links to the parcel form without displaying scores or options", () => {
    render(<LocaleProvider><RotationScreen /></LocaleProvider>);
    expect(screen.getByRole("link", { name: "Describe a parcel" })).toHaveAttribute("href", "/parcels/new");
    expect(screen.getByText(/Recommendations are not available yet/)).toBeInTheDocument();
    expect(screen.queryByText(/suitability score/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
