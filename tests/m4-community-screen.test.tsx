import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommunityScreen } from "@/features/m4/CommunityScreen";
import { LocaleProvider } from "@/i18n/LocaleProvider";

function renderCommunity() {
  return render(<LocaleProvider><CommunityScreen /></LocaleProvider>);
}

async function addExperience(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("radio", { name: "Experience" }));
  await user.type(screen.getByRole("textbox", { name: "Experience title (required)" }), "My demo story");
  await user.type(screen.getByRole("textbox", { name: "Description (required)" }), "What I noticed on my own parcel");
  await user.click(screen.getByRole("button", { name: "Review local preview" }));
  await user.click(screen.getByRole("button", { name: "Add to local preview" }));
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
});

describe("M4 community is a LOCAL demo, not public posting", () => {
  it("starts with no invented public posts and explains the session limit", () => {
    renderCommunity();
    expect(screen.getByText("No local preview posts yet")).toBeInTheDocument();
    expect(screen.getByText(/Items vanish when you leave or reload/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove from preview" })).not.toBeInTheDocument();
  });

  it("shows a required type error without pretending to submit", async () => {
    const user = userEvent.setup();
    renderCommunity();
    await user.click(screen.getByRole("button", { name: "Review local preview" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Please complete this field");
    expect(screen.queryByRole("button", { name: "Add to local preview" })).not.toBeInTheDocument();
  });

  it("reviews and adds an experience only after explicit confirmation", async () => {
    const user = userEvent.setup();
    renderCommunity();
    await user.click(screen.getByRole("radio", { name: "Experience" }));
    await user.type(screen.getByRole("textbox", { name: "Experience title (required)" }), "My demo story");
    await user.type(screen.getByRole("textbox", { name: "Description (required)" }), "Learning by trying");
    await user.click(screen.getByRole("button", { name: "Review local preview" }));
    expect(screen.getByRole("heading", { name: "Review before adding" })).toBeInTheDocument();
    expect(screen.getByText("No local preview posts yet")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add to local preview" }));
    expect(screen.getByText("My demo story")).toBeInTheDocument();
    expect(screen.getByText(/Nothing was published or saved/)).toBeInTheDocument();
    expect(screen.queryByText("No local preview posts yet")).not.toBeInTheDocument();
  });

  it("filters only temporary items, then removes a locally authored preview", async () => {
    const user = userEvent.setup();
    renderCommunity();
    await addExperience(user);
    await user.click(screen.getByRole("button", { name: "Harvest for sale" }));
    expect(screen.getByText("There are no local previews of this type.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "All types" }));
    expect(screen.getByText("My demo story")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove from preview" }));
    expect(screen.getByText("No local preview posts yet")).toBeInTheDocument();
    expect(screen.getByText("Removed from this page's local preview only.")).toBeInTheDocument();
  });

  it("validates sale-specific fields and accepts optional price blank", async () => {
    const user = userEvent.setup();
    renderCommunity();
    await user.click(screen.getByRole("radio", { name: "Harvest for sale" }));
    await user.click(screen.getByRole("button", { name: "Review local preview" }));
    expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(3);
    await user.type(screen.getByRole("textbox", { name: "Crop name (required)" }), "User-named crop");
    await user.type(screen.getByRole("textbox", { name: "Quantity (required)" }), "12.5");
    await user.click(screen.getByRole("radio", { name: "Kilograms (kg)" }));
    await user.type(screen.getByRole("textbox", { name: "Description (required)" }), "Session-only offer");
    await user.click(screen.getByRole("button", { name: "Review local preview" }));
    expect(screen.getByRole("heading", { name: "Review before adding" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add to local preview" }));
    expect(screen.getByText("User-named crop")).toBeInTheDocument();
    expect(screen.getByText(/12\.5 Kilograms/)).toBeInTheDocument();
  });

  it("shows partnership purpose and broad area errors, then reviews user input", async () => {
    const user = userEvent.setup();
    renderCommunity();
    await user.click(screen.getByRole("radio", { name: "Partnership request" }));
    await user.click(screen.getByRole("button", { name: "Review local preview" }));
    expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(3);
    await user.type(screen.getByRole("textbox", { name: "Partnership purpose (required)" }), "Coordinate a shared equipment idea");
    await user.type(screen.getByRole("textbox", { name: "Broad area (required)" }), "Béni Moussa");
    await user.type(screen.getByRole("textbox", { name: "Description (required)" }), "A draft conversation topic");
    await user.click(screen.getByRole("button", { name: "Review local preview" }));
    expect(screen.getByText("Coordinate a shared equipment idea")).toBeInTheDocument();
    expect(screen.getByText("Béni Moussa")).toBeInTheDocument();
  });

  it("keeps the typed draft during language switch and updates RTL", async () => {
    const user = userEvent.setup();
    renderCommunity();
    await user.click(screen.getByRole("radio", { name: "Experience" }));
    await user.type(screen.getByRole("textbox", { name: "Experience title (required)" }), "Keep this draft");
    await user.click(screen.getByRole("button", { name: "Darija" }));
    await waitFor(() => expect(document.documentElement).toHaveAttribute("dir", "rtl"));
    expect(screen.getByRole("textbox", { name: "عنوان التجربة (ضروري)" })).toHaveValue("Keep this draft");
    expect(screen.getByRole("heading", { name: "تجربة مجتمع الفلاحة" })).toBeInTheDocument();
  });

  it("prevents clipboard copy until explicit review consent", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    renderCommunity();
    await addExperience(user);
    await user.click(screen.getByRole("button", { name: "Review text to copy" }));
    const copyArea = screen.getByRole("textbox", { name: "Text that can be copied" });
    expect((copyArea as HTMLTextAreaElement).value).toContain("Local demo only");
    await user.click(screen.getByRole("button", { name: "Copy reviewed text" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Confirm after reviewing");
    expect(writeText).not.toHaveBeenCalled();
    await user.click(screen.getByRole("checkbox", { name: /I checked the text and confirm/ }));
    await user.click(screen.getByRole("button", { name: "Copy reviewed text" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0][0]).toContain("My demo story");
    expect(screen.getByText(/Text copied\. You decide where/)).toBeInTheDocument();
  });

  it("provides manual-copy fallback if browser clipboard access fails", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockRejectedValue(new Error("Permission denied"));
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    renderCommunity();
    await addExperience(user);
    await user.click(screen.getByRole("button", { name: "Review text to copy" }));
    await user.click(screen.getByRole("checkbox", { name: /I checked the text and confirm/ }));
    await user.click(screen.getByRole("button", { name: "Copy reviewed text" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Select the text above"));
    expect(screen.getByRole("textbox", { name: "Text that can be copied" })).toHaveAttribute("readonly");
  });

  it("requires new consent each time the share preview is opened", async () => {
    const user = userEvent.setup();
    renderCommunity();
    await addExperience(user);
    await user.click(screen.getByRole("button", { name: "Review text to copy" }));
    await user.click(screen.getByRole("checkbox", { name: /I checked the text and confirm/ }));
    await user.click(screen.getByRole("button", { name: "Close sharing preview" }));
    await user.click(screen.getByRole("button", { name: "Review text to copy" }));
    expect(screen.getByRole("checkbox", { name: /I checked the text and confirm/ })).not.toBeChecked();
  });
});
