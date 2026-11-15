import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ParcelJourney } from "@/features/m2/ParcelJourney";
import { LocaleProvider } from "@/i18n/LocaleProvider";

function renderJourney() {
  return render(<LocaleProvider><ParcelJourney /></LocaleProvider>);
}

async function reachStep2(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("radio", { name: "Béni Amir" }));
  await user.click(screen.getByRole("button", { name: "Next step" }));
}

async function reachStep3(user: ReturnType<typeof userEvent.setup>) {
  await reachStep2(user);
  await user.click(screen.getByRole("radio", { name: "I don't know" }));
  await user.click(screen.getByRole("button", { name: "Next step" }));
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("M2 guided parcel form", () => {
  it("starts with local-only notice, no values, and an accessible progress indicator", () => {
    renderJourney();
    expect(screen.getByRole("heading", { name: "Tell us about your parcel" })).toBeInTheDocument();
    expect(screen.getByText(/does not save or send information/i)).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Parcel form steps" })).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 4/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to rotation" })).toHaveAttribute("href", "/rotation");
  });

  it("shows a required zone error and then accepts an explicit unknown", async () => {
    const user = userEvent.setup();
    renderJourney();
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText(/Choose your irrigation zone/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Parcel basics" })).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "I don't know" }));
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByRole("heading", { name: "Water and location" })).toBeInTheDocument();
  });

  it("validates an entered area and preserves it on Back/Next", async () => {
    const user = userEvent.setup();
    renderJourney();
    await user.type(screen.getByRole("textbox", { name: /Approximate area in hectares/ }), "0");
    await user.click(screen.getByRole("radio", { name: "Béni Moussa" }));
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText(/Enter a number greater than zero/)).toBeInTheDocument();
    const area = screen.getByRole("textbox", { name: /Approximate area in hectares/ });
    await user.clear(area);
    await user.type(area, "1,5");
    await user.click(screen.getByRole("button", { name: "Next step" }));
    await user.click(screen.getByRole("button", { name: "Previous step" }));
    expect(screen.getByRole("textbox", { name: /Approximate area in hectares/ })).toHaveValue("1,5");
    expect(screen.getByRole("radio", { name: "Béni Moussa" })).toBeChecked();
  });

  it("shows no fabricated coordinates and validates manual entries only when chosen", async () => {
    const user = userEvent.setup();
    renderJourney();
    await reachStep2(user);
    expect(screen.queryByRole("textbox", { name: /Latitude/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Drip irrigation" }));
    await user.click(screen.getByRole("radio", { name: "I want to type my own coordinates" }));
    const lat = screen.getByRole("textbox", { name: /Latitude/ });
    const lon = screen.getByRole("textbox", { name: /Longitude/ });
    await user.type(lat, "91");
    await user.type(lon, "0");
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText(/latitude between -90 and 90/i)).toBeInTheDocument();
    await user.clear(lat);
    await user.type(lat, "32.1"); // supplied by tester, not invented by the app
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByRole("heading", { name: "Crops and season" })).toBeInTheDocument();
  });

  it("accepts unknown planned season with empty crop history", async () => {
    const user = userEvent.setup();
    renderJourney();
    await reachStep3(user);
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText(/Say whether you know the planned season/)).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "I don't know yet" }));
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByRole("heading", { name: "Review" })).toBeInTheDocument();
    expect(screen.getByText(/Nothing has been saved or sent/)).toBeInTheDocument();
  });

  it("keeps crop notes and the current step while switching English to Darija RTL", async () => {
    const user = userEvent.setup();
    renderJourney();
    await reachStep3(user);
    await user.type(screen.getByRole("textbox", { name: /Most recent crop/ }), "My crop note");
    await user.click(screen.getByRole("button", { name: "Darija" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));
    expect(document.documentElement).toHaveAttribute("lang", "ary");
    expect(screen.getByRole("textbox", { name: /آخر زراعة/ })).toHaveValue("My crop note");
    expect(screen.getByRole("heading", { name: "الزراعات والموسم" })).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "مازال ما عارفش" }));
    await user.click(screen.getByRole("button", { name: "المرحلة الجاية" }));
    expect(screen.getByText("My crop note")).toBeInTheDocument();
  });

  it("confirms a local review without network requests, saving or recommendations", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    renderJourney();
    await reachStep3(user);
    await user.click(screen.getByRole("radio", { name: "I don't know yet" }));
    await user.click(screen.getByRole("button", { name: "Next step" }));
    await user.click(screen.getByRole("button", { name: "Confirm local review" }));
    expect(screen.getByRole("heading", { name: "Local review confirmed" })).toBeInTheDocument();
    expect(screen.getByText(/No parcel was saved, no information was sent/)).toBeInTheDocument();
    expect(screen.getByText(/Crop recommendations are unavailable/)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(localStorage.getItem("parcel")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Start a new local form" }));
    expect(screen.getByRole("heading", { name: "Parcel basics" })).toBeInTheDocument();
  });

  it("does not display hidden coordinates after switching back to no location", async () => {
    const user = userEvent.setup();
    renderJourney();
    await reachStep2(user);
    await user.click(screen.getByRole("radio", { name: "I don't know" }));
    await user.click(screen.getByRole("radio", { name: "I want to type my own coordinates" }));
    await user.type(screen.getByRole("textbox", { name: /Latitude/ }), "12");
    await user.type(screen.getByRole("textbox", { name: /Longitude/ }), "13");
    await user.click(screen.getByRole("radio", { name: /I don't have coordinates/ }));
    await user.click(screen.getByRole("button", { name: "Next step" }));
    await user.click(screen.getByRole("radio", { name: "I don't know yet" }));
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getAllByText("Not provided").length).toBeGreaterThan(0);
    expect(screen.queryByText(/12, 13/)).not.toBeInTheDocument();
  });
});
