import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ParcelJourney, RECOMMENDATION_STORAGE_KEY } from "@/features/m2/ParcelJourney";
import { LocaleProvider } from "@/i18n/LocaleProvider";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const RESULTS_UNION = {
  status: "results_available",
  contract_version: "0.2",
  engine_version: "rule-engine 0.2.0",
  data_versions: { crops_vocabulary: "crops.v1" },
  baseline: {
    crop_id: "wheat", name_en: "Wheat", name_ar: "القمح", score: 88,
    rule_evidence: [{ rule_id: "R-BRK-01", delta: -12, explanation: "cereal after cereal",
      explanation_ary_pending_review: "x" }],
    water_evidence: null, notes: [],
  },
  alternatives: [{
    crop_id: "alfalfa", name_en: "Alfalfa", name_ar: "البرسيم الحجازي", score: 92, rank: 1,
    rule_evidence: [], water_evidence: null, notes: [],
  }],
};

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

function recentGroup() {
  return within(screen.getByRole("group", { name: /Most recent crop/ }));
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  pushMock.mockClear();
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
    expect(screen.getByText(/Nothing is saved\./i)).toBeInTheDocument();
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

  it("offers the validated crop vocabulary with an explicit not-declared choice", async () => {
    const user = userEvent.setup();
    renderJourney();
    await reachStep3(user);
    const group = recentGroup();
    expect(group.getByRole("radio", { name: "Wheat" })).toBeInTheDocument();
    expect(group.getByRole("radio", { name: "Alfalfa (forage)" })).toBeInTheDocument();
    expect(group.getByRole("radio", { name: "Sugar beet" })).toBeInTheDocument();
    expect(group.getByRole("radio", { name: "Not declared / I don't know" })).toBeChecked();
    expect(within(screen.getByRole("group", { name: /Crop before that/ }))
      .getByRole("radio", { name: "Fava bean" })).toBeInTheDocument();
  });

  it("keeps the crop choice and current step while switching English to Darija RTL", async () => {
    const user = userEvent.setup();
    renderJourney();
    await reachStep3(user);
    await user.click(recentGroup().getByRole("radio", { name: "Wheat" }));
    await user.click(screen.getByRole("button", { name: "Darija" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));
    expect(document.documentElement).toHaveAttribute("lang", "ary");
    expect(within(screen.getByRole("group", { name: /آخر زراعة/ }))
      .getByRole("radio", { name: "القمح" })).toBeChecked();
    expect(screen.getByRole("heading", { name: "الزراعات والموسم" })).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "مازال ما عارفش" }));
    await user.click(screen.getByRole("button", { name: "المرحلة الجاية" }));
    expect(screen.getByText("القمح")).toBeInTheDocument();
  });

  it("rejects a free-wording season and accepts the campaign grammar", async () => {
    const user = userEvent.setup();
    renderJourney();
    await reachStep3(user);
    await user.click(recentGroup().getByRole("radio", { name: "Wheat" }));
    const season = screen.getByRole("textbox", { name: /Season of that crop/ });
    await user.type(season, "last year");
    await user.click(screen.getByRole("radio", { name: "I don't know yet" }));
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText(/campaign years like 2024-2025/)).toBeInTheDocument();
    await user.clear(season);
    await user.type(season, "2024-2025");
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByRole("heading", { name: "Review" })).toBeInTheDocument();
  });

  it("requests recommendations, stores the union and routes to /rotation", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () => ({
      ok: true, status: 200, json: async () => RESULTS_UNION,
    }));
    vi.stubGlobal("fetch", fetchMock);
    renderJourney();
    await reachStep3(user);
    await user.click(recentGroup().getByRole("radio", { name: "Wheat" }));
    await user.click(screen.getByRole("radio", { name: "I don't know yet" }));
    await user.click(screen.getByRole("button", { name: "Next step" }));
    await user.click(screen.getByRole("button", { name: "See my rotation options" }));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/rotation"));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/v1/recommendations");
    expect(init.method).toBe("POST");
    const sent = JSON.parse(String(init.body));
    expect(sent.parcel.zone).toBe("amir");
    expect(sent.parcel.irrigation).toBe("unsure"); // "I don't know" irrigation choice
    expect(sent.history[0].crop_id).toBe("wheat");
    const stored = JSON.parse(sessionStorage.getItem(RECOMMENDATION_STORAGE_KEY)!);
    expect(stored.status).toBe("results_available");
    expect(localStorage.getItem("parcel")).toBeNull();
  });

  it("shows an honest network error and stays on the form when the service is down", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("ECONNREFUSED"); }));
    renderJourney();
    await reachStep3(user);
    await user.click(screen.getByRole("radio", { name: "I don't know yet" }));
    await user.click(screen.getByRole("button", { name: "Next step" }));
    await user.click(screen.getByRole("button", { name: "See my rotation options" }));
    await waitFor(() => expect(screen.getByText(/could not be reached/)).toBeInTheDocument());
    expect(pushMock).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Review" })).toBeInTheDocument();
  });

  it("maps science request errors back to the crop step", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: false, status: 422,
      json: async () => ({
        status: "request_error", contract_version: "0.2",
        error: { code: "VALIDATION_ERROR",
          fields: [{ path: "history[0].crop_id", code: "UNRECOGNIZED_CROP" }] },
      }),
    })));
    renderJourney();
    await reachStep3(user);
    await user.click(screen.getByRole("radio", { name: "I don't know yet" }));
    await user.click(screen.getByRole("button", { name: "Next step" }));
    await user.click(screen.getByRole("button", { name: "See my rotation options" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Crops and season" })).toBeInTheDocument());
    expect(screen.getByText(/Choose a crop from the validated list/)).toBeInTheDocument();
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
