import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

function monitorAppApiWrites(page: Page): string[] {
  const writes: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname === "127.0.0.1" && url.pathname.startsWith("/api/") && request.method() !== "GET") {
      writes.push(`${request.method()} ${url.pathname}`);
    }
  });
  return writes;
}

async function openEnglish(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.locator("[role=group] button").first().click();
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
}

test("welcome → optional phone/demo entry → Home → Rotation", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "English" }).click();
  await page.getByRole("link", { name: "Continue" }).click();
  await expect(page).toHaveURL(/\/access$/);
  await expect(page.getByText(/no SMS verification, account creation or authentication/i)).toBeVisible();
  await page.getByRole("link", { name: "Enter demo" }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(page.getByText(/Frontend demonstration · no real account/)).toBeVisible();
  await page.getByRole("link", { name: "See recommendation status" }).click();
  await expect(page).toHaveURL(/\/rotation$/);
  await expect(page.getByText(/scored with the same rules as the alternatives/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Describe a parcel" })).toBeVisible();
});

test("four-step parcel UI validates, preserves draft across languages, and scores rotation options", async ({ page }) => {
  const appApiWrites = monitorAppApiWrites(page);
  await openEnglish(page, "/parcels/new");
  await expect(page.getByRole("heading", { name: "Tell us about your parcel" })).toBeVisible();
  await page.getByRole("textbox", { name: "Parcel name (optional)" }).fill("My temporary field");
  await page.getByRole("button", { name: "Next step" }).click();
  await expect(page.getByText(/Choose your irrigation zone/)).toBeVisible();
  await page.getByRole("radio", { name: "Béni Amir" }).check();
  await page.getByRole("button", { name: "Darija" }).first().click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ary");
  await page.locator("[role=group] button").first().click();
  await expect(page.getByRole("textbox", { name: "Parcel name (optional)" })).toHaveValue("My temporary field");
  await page.getByRole("button", { name: "Next step" }).click();
  await page.getByRole("radio", { name: "Drip irrigation" }).check();
  await page.getByRole("button", { name: "Next step" }).click();
  await page.getByRole("group", { name: /Most recent crop/ }).getByRole("radio", { name: "Wheat" }).check();
  await page.getByRole("radio", { name: "I don't know yet" }).check();
  await page.getByRole("button", { name: "Next step" }).click();
  await expect(page.getByText("My temporary field")).toBeVisible();
  await page.getByRole("button", { name: "See my rotation options" }).click();
  await expect(page).toHaveURL(/\/rotation$/);
  await expect(page.getByText(/Your current strategy/).first()).toBeVisible();
  await expect(page.getByText(/Ranked alternatives/).first()).toBeVisible();
  // G0-approved demo policy: exactly one POST to the BFF, nothing else, nothing persisted.
  expect(appApiWrites).toEqual(["POST /api/v1/recommendations"]);
  await page.goto("/parcels/new", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("textbox", { name: /Parcel name \(optional\)|اسم الأرض \(اختياري\)/ }))
    .toHaveValue("");
});

test("Tadla map keeps a sourced list and honest empty category without network tiles", async ({ page }) => {
  await page.route("https://tile.openstreetmap.org/**", (route) => route.abort());
  await openEnglish(page, "/map");
  await expect(page.getByRole("heading", { name: "Explore the Tadla area" })).toBeVisible();
  await expect(page.getByText(/Bin El Ouidane/).first()).toBeVisible();
  await expect(page.getByText(/Ahmed El Hansali/).first()).toBeVisible();
  await expect(page.getByText(/OpenStreetMap contributors/).first()).toBeVisible();
  await page.getByRole("button", { name: /Wholesale markets/ }).click();
  await expect(page.getByText(/No individually checked locations are available in this category/)).toBeVisible();
});

test("community review → local preview → explicit share consent → refresh empty", async ({ page, context }) => {
  const appApiWrites = monitorAppApiWrites(page);
  await openEnglish(page, "/community");
  await expect(page.getByText("No local preview posts yet")).toBeVisible();
  await page.getByRole("radio", { name: "Experience" }).check();
  await page.getByRole("textbox", { name: "Experience title (required)" }).fill("A local test note");
  await page.getByRole("textbox", { name: "Description (required)" }).fill("A sentence I entered for the preview");
  await page.getByRole("button", { name: "Review local preview" }).click();
  await expect(page.getByRole("heading", { name: "Review before adding" })).toBeVisible();
  await page.getByRole("button", { name: "Add to local preview" }).click();
  await expect(page.getByText("A local test note")).toBeVisible();
  await page.getByRole("button", { name: "Review text to copy" }).click();
  await page.getByRole("button", { name: "Copy reviewed text" }).click();
  await expect(page.getByText(/Confirm after reviewing the text/)).toBeVisible();
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("checkbox", { name: /I checked the text and confirm/ }).check();
  await page.getByRole("button", { name: "Copy reviewed text" }).click();
  await expect(page.getByText(/Text copied\. You decide where/)).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("A local test note");
  expect(appApiWrites).toEqual([]);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByText("No local preview posts yet")).toBeVisible();
  await expect(page.getByText("A local test note")).toHaveCount(0);
});

test("unavailable calendar contains no invented crop dates", async ({ page }) => {
  await openEnglish(page, "/calendar");
  await expect(page.getByRole("heading", { name: "Crop calendar unavailable" })).toBeVisible();
  await expect(page.getByText(/no approved crop/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/home");
});

test("an unknown URL shows a bilingual 404 and useful navigation", async ({ page }) => {
  await page.goto("/m5-unknown-route-example", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "This page is not available" })).toBeVisible();
  await page.getByRole("button", { name: "Darija" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("link", { name: "رجع للرئيسية" })).toHaveAttribute("href", "/home");
});

test("mobile skip link and English/Darija navigation stay keyboard operable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/home", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await page.keyboard.press("Tab");
  await expect(page.locator('a[href="#main-content"]')).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await page.getByRole("button", { name: "Darija" }).first().click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("html")).toHaveAttribute("lang", "ary");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(overflow).toBe(false);
  await page.locator("[role=group] button").first().click();
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await page.getByRole("navigation", { name: "Main navigation" }).last()
    .getByRole("link", { name: "Map" }).click();
  await expect(page).toHaveURL(/\/map$/);
});
