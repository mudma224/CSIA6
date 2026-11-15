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
  it("Home offers a real parcel-form link and the rotation status destination", () => {
    render(<LocaleProvider><HomeScreen /></LocaleProvider>);
    expect(screen.getByRole("link", { name: /My parcel/ })).toHaveAttribute("href", "/parcels/new");
    expect(screen.getByRole("link", { name: "See recommendation status" })).toHaveAttribute("href", "/rotation");
    expect(screen.getByText(/validated rule engine/i)).toBeInTheDocument();
  });

  it("Rotation intro links to the parcel form and stays score-free until a request", () => {
    render(<LocaleProvider><RotationScreen /></LocaleProvider>);
    expect(screen.getByRole("link", { name: "Describe a parcel" })).toHaveAttribute("href", "/parcels/new");
    expect(screen.getByText(/scored with the same rules as the alternatives/)).toBeInTheDocument();
    expect(screen.queryByText(/Ranking score/)).not.toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
