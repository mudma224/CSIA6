import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FoundationDemo } from "@/features/foundation/FoundationDemo";

describe("foundation preview", () => {
  it("displays only an unavailable recommendation state", () => {
    render(<FoundationDemo />);
    expect(screen.getByText(/Recommendations are not available yet/)).toBeInTheDocument();
    expect(screen.queryByText(/suitability score/i)).not.toBeInTheDocument();
  });

  it("is bilingual, RTL, and preserves the preview draft", async () => {
    render(<FoundationDemo />);
    await userEvent.type(screen.getByRole("textbox", { name: "Test field (local only)" }), "test input");
    await userEvent.click(screen.getByRole("button", { name: "Darija" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));
    expect(screen.getByRole("textbox", { name: "خانة للتجربة فقط" })).toHaveValue("test input");
    expect(screen.getByText(/اقتراحات الزراعة مازال/)).toBeInTheDocument();
  });
});
