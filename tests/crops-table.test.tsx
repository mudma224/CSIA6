import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { CropsTable, type CropRow } from "@/features/data-preview/CropsTable";

const sample: CropRow[] = [
  {
    crop_id: "wheat",
    name_en: "Wheat",
    name_ar: "القمح",
    scientific_name: "Triticum spp.",
    class: "cereal",
    lifecycle: "annual",
    observed: true,
    observed_count: 887,
    rare: false,
    form_p0: true,
  },
  {
    crop_id: "barley",
    name_en: "Barley",
    name_ar: "الشعير",
    scientific_name: "Hordeum vulgare",
    class: "cereal",
    lifecycle: "annual",
    observed: false,
    observed_count: null,
    rare: false,
    form_p0: false,
  },
];

describe("crop vocabulary table", () => {
  it("renders one row per crop with the Arabic name in RTL direction", () => {
    render(
      <LocaleProvider>
        <CropsTable crops={sample} />
      </LocaleProvider>,
    );
    expect(screen.getAllByText("القمح").length).toBeGreaterThan(0);
    const arabicCell = screen.getByText("القمح").closest("td");
    expect(arabicCell).toHaveAttribute("dir", "rtl");
    expect(screen.getByText("الشعير")).toBeInTheDocument();
  });

  it("shows the P0 flag only for P0-form crops and a dash for missing counts", () => {
    render(
      <LocaleProvider>
        <CropsTable crops={sample} />
      </LocaleProvider>,
    );
    expect(screen.getByTestId("p0-wheat")).toHaveTextContent("P0");
    expect(screen.getByTestId("p0-barley")).toHaveTextContent("—");
    expect(screen.getByTestId("observed-barley")).toHaveTextContent("—");
    expect(screen.getByTestId("observed-wheat")).toHaveTextContent("887");
  });
});
