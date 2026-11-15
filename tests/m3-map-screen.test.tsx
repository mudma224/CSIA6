import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { MapScreen } from "@/features/m3/MapScreen";
import { HomeScreen } from "@/features/m1/HomeScreen";

vi.mock("next/dynamic", () => ({
  default: () => function MockMap({ onTileError }: { onTileError: () => void }) {
    return <button type="button" onClick={onTileError}>Simulate tile failure in test</button>;
  },
}));

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
});

function renderMap() {
  return render(<LocaleProvider><MapScreen /></LocaleProvider>);
}

describe("M3 map page", () => {
  it("renders attributed-source explanations and two actual reference records", () => {
    renderMap();
    expect(screen.getByRole("heading", { name: "Explore the Tadla area" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Filter verified places" })).toBeInTheDocument();
    const list = screen.getByRole("heading", { name: "Verified place list" }).closest("section");
    expect(list).not.toBeNull();
    expect(within(list!).getByRole("button", { name: /Bin El Ouidane Dam/ })).toBeInTheDocument();
    expect(within(list!).getByRole("button", { name: /Ahmed El Hansali Dam/ })).toBeInTheDocument();
    expect(screen.getByText(/not an official irrigation boundary/i)).toBeInTheDocument();
  });

  it("filters markers/list to zero markets and zero suppliers with truthful empty state", async () => {
    const user = userEvent.setup();
    renderMap();
    await user.click(screen.getByRole("button", { name: "Wholesale markets (0)" }));
    expect(screen.getByText(/No individually checked locations/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Wholesale markets (0)" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Agricultural suppliers (0)" }));
    expect(screen.getByText(/No individually checked locations/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Water infrastructure (2)" }));
    expect(screen.getByRole("button", { name: /Bin El Ouidane Dam/ })).toBeInTheDocument();
  });

  it("selects source-checked feature details and external directions without using GPS", async () => {
    const user = userEvent.setup();
    renderMap();
    await user.click(screen.getByRole("button", { name: /Bin El Ouidane Dam/ }));
    expect(screen.getByRole("heading", { name: "Bin El Ouidane Dam" })).toBeInTheDocument();
    expect(screen.getByText(/Not a gate, parcel, official boundary/)).toBeInTheDocument();
    const details = screen.getByRole("heading", { name: "Selected place details" }).closest("section");
    expect(details).not.toBeNull();
    expect(within(details!).getByRole("link", { name: "Coordinate source" })).toHaveAttribute("href", "https://mapcarta.com/W504108035");
    expect(within(details!).getByRole("link", { name: "Mapped OSM feature" })).toHaveAttribute("href", "https://www.openstreetmap.org/way/504108035");
    expect(within(details!).getByRole("link", { name: /Open external directions/ })).toHaveAttribute("target", "_blank");
  });

  it("keeps selection/filter when changing to Darija, and sets RTL", async () => {
    const user = userEvent.setup();
    renderMap();
    await user.click(screen.getByRole("button", { name: "Water infrastructure (2)" }));
    await user.click(screen.getByRole("button", { name: /Bin El Ouidane Dam/ }));
    await user.click(screen.getByRole("button", { name: "Darija" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));
    expect(screen.getByRole("heading", { name: "اكتاشف منطقة تادلة" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "منشآت الماء (2)" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "سد بين الويدان" })).toBeInTheDocument();
  });

  it("shows an accessible failure notice and keeps the place list usable", async () => {
    const user = userEvent.setup();
    renderMap();
    await user.click(screen.getByRole("button", { name: "Simulate tile failure in test" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/Map tiles may be unavailable/);
    expect(screen.getByRole("button", { name: /Ahmed El Hansali Dam/ })).toBeInTheDocument();
  });

  it("preserves honest Home → map and parcel links and unavailable rotation copy", () => {
    render(<LocaleProvider><HomeScreen /></LocaleProvider>);
    expect(screen.getByRole("link", { name: /Tadla map/ })).toHaveAttribute("href", "/map");
    expect(screen.getByText(/two source-checked water landmarks/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /My parcel/ })).toHaveAttribute("href", "/parcels/new");
    expect(screen.getByRole("link", { name: "See recommendation status" })).toHaveAttribute("href", "/rotation");
  });
});
