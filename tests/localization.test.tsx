import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LocaleProvider, useLocale } from "@/i18n/LocaleProvider";
import { LOCALE_STORAGE_KEY } from "@/i18n/locale";

function Probe() {
  const { locale, setLocale, t } = useLocale();
  const [draft, setDraft] = useState("");
  return (
    <>
      <p data-testid="locale">{locale}</p>
      <p>{t("title")}</p>
      <input aria-label="draft" value={draft} onChange={(event) => setDraft(event.target.value)} />
      <button onClick={() => setLocale("ary")}>Switch to Darija</button>
      <button onClick={() => setLocale("en")}>Switch to English</button>
    </>
  );
}

describe("locale provider", () => {
  it("changes lang/dir, stores locale, and keeps unsaved input", async () => {
    render(<LocaleProvider><Probe /></LocaleProvider>);
    await userEvent.type(screen.getByRole("textbox", { name: "draft" }), "my field");
    await userEvent.click(screen.getByRole("button", { name: "Switch to Darija" }));
    expect(document.documentElement).toHaveAttribute("lang", "ary");
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe("ary");
    expect(screen.getByRole("textbox", { name: "draft" })).toHaveValue("my field");
  });

  it("restores stored Darija on a later mount", async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, "ary");
    render(<LocaleProvider><Probe /></LocaleProvider>);
    await waitFor(() => expect(screen.getByTestId("locale")).toHaveTextContent("ary"));
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
  });
});
