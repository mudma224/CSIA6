import type { M4MessageKey } from "@/i18n/m4Messages";

export type PostKind = "experience" | "sale" | "partnership";
export type PostFilter = "all" | PostKind;
export type QuantityUnit = "" | "kg" | "t" | "other" | "unknown";

export type CommunityDraft = {
  kind: "" | PostKind;
  title: string;
  description: string;
  crop: string;
  quantity: string;
  unit: QuantityUnit;
  price: string;
  area: string;
  purpose: string;
  partnershipArea: string;
};

export type DraftField = keyof CommunityDraft;
export type DraftError = "required" | "quantity" | "price";
export type DraftErrors = Partial<Record<DraftField, DraftError>>;

export type LocalPreviewPost = {
  /** Page-instance rendering key only. Never a persistent post/user ID. */
  id: string;
  draft: CommunityDraft;
};

export function emptyCommunityDraft(): CommunityDraft {
  return {
    kind: "", title: "", description: "", crop: "", quantity: "",
    unit: "", price: "", area: "", purpose: "", partnershipArea: "",
  };
}

/** A usability check for text typed in decimal inputs, not a price/inventory rule. */
export function isPositiveDecimalInput(raw: string): boolean {
  const text = raw.trim();
  if (!/^\d+(?:[.,]\d{1,3})?$/.test(text)) return false;
  return Number(text.replace(",", ".")) > 0;
}

export function validateCommunityDraft(draft: CommunityDraft): DraftErrors {
  const errors: DraftErrors = {};
  if (!draft.kind) {
    errors.kind = "required";
    return errors;
  }
  if (!draft.description.trim()) errors.description = "required";

  if (draft.kind === "experience") {
    if (!draft.title.trim()) errors.title = "required";
  }
  if (draft.kind === "sale") {
    if (!draft.crop.trim()) errors.crop = "required";
    if (!draft.quantity.trim() || !isPositiveDecimalInput(draft.quantity)) {
      errors.quantity = "quantity";
    }
    if (!draft.unit) errors.unit = "required";
    if (draft.price.trim() && !isPositiveDecimalInput(draft.price)) {
      errors.price = "price";
    }
  }
  if (draft.kind === "partnership") {
    if (!draft.purpose.trim()) errors.purpose = "required";
    if (!draft.partnershipArea.trim()) errors.partnershipArea = "required";
  }
  return errors;
}

/** Explicitly labelled copy preview. Only from user-entered content, never server data. */
export function formatLocalPreviewText(
  draft: CommunityDraft,
  t: (key: M4MessageKey) => string,
): string {
  if (!draft.kind) return "";
  const lines = [t("localOnly")];
  const typeLabel = draft.kind === "experience"
    ? t("typeExperience")
    : draft.kind === "sale"
      ? t("typeSale")
      : t("typePartnership");
  lines.push(`${t("postType")}: ${typeLabel}`);
  const add = (label: M4MessageKey, value: string) => {
    if (value.trim()) lines.push(`${t(label)}: ${value.trim()}`);
  };
  if (draft.kind === "experience") add("postTitle", draft.title);
  if (draft.kind === "sale") {
    add("postCrop", draft.crop);
    if (draft.quantity.trim()) {
      const unit = draft.unit === "kg" ? t("unitKg")
        : draft.unit === "t" ? t("unitTonne")
          : draft.unit === "other" ? t("unitOther")
            : draft.unit === "unknown" ? t("unitUnknown") : "";
      add("postQuantity", `${draft.quantity.trim()}${unit ? ` ${unit}` : ""}`);
    }
    if (draft.price.trim()) add("postPrice", `${draft.price.trim()} MAD`);
    add("postArea", draft.area);
  }
  if (draft.kind === "partnership") {
    add("postPurpose", draft.purpose);
    add("postPartnershipArea", draft.partnershipArea);
  }
  add("postDescription", draft.description);
  return lines.join("\n");
}
