"use client";

import { useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ClipboardCopy, Info, MessageSquareText, Trash2 } from "lucide-react";
import { ChoiceGroup } from "@/components/forms/ChoiceGroup";
import { LocaleSwitcher } from "@/components/m1/LocaleSwitcher";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { useM4Text } from "@/i18n/m4Messages";
import type { M4MessageKey } from "@/i18n/m4Messages";
import {
  emptyCommunityDraft, formatLocalPreviewText, validateCommunityDraft,
} from "./communityDraft";
import type {
  CommunityDraft, DraftErrors, DraftField, LocalPreviewPost,
  PostFilter, PostKind,
} from "./communityDraft";

type DescriptionBoxProps = {
  label: string;
  hint: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function DescriptionBox({ label, hint, value, error, onChange }: DescriptionBoxProps) {
  const id = useId();
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-bold text-forest">{label}</label>
      <p id={`${id}-hint`} className="text-sm text-muted">{hint}</p>
      <textarea
        id={id}
        rows={5}
        maxLength={1200}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
        aria-invalid={Boolean(error)}
        className="block min-h-32 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 py-3 text-base text-ink outline-offset-2 focus-visible:outline-2 focus-visible:outline-leaf"
      />
      {error && <p id={`${id}-error`} role="alert" className="text-sm font-semibold text-[var(--danger)]">{error}</p>}
    </div>
  );
}

function LocalPostContent({ draft }: { draft: CommunityDraft }) {
  const t = useM4Text();
  const typeName = draft.kind === "experience" ? t("typeExperience")
    : draft.kind === "sale" ? t("typeSale") : t("typePartnership");
  const rows: { label: M4MessageKey; value: string }[] = [];
  if (draft.kind === "experience") rows.push({ label: "postTitle", value: draft.title });
  if (draft.kind === "sale") {
    rows.push({ label: "postCrop", value: draft.crop });
    const unit = draft.unit === "kg" ? t("unitKg")
      : draft.unit === "t" ? t("unitTonne")
        : draft.unit === "other" ? t("unitOther")
          : draft.unit === "unknown" ? t("unitUnknown") : "";
    rows.push({ label: "postQuantity", value: `${draft.quantity}${unit ? ` ${unit}` : ""}` });
    if (draft.price.trim()) rows.push({ label: "postPrice", value: `${draft.price} MAD` });
    if (draft.area.trim()) rows.push({ label: "postArea", value: draft.area });
  }
  if (draft.kind === "partnership") {
    rows.push({ label: "postPurpose", value: draft.purpose });
    rows.push({ label: "postPartnershipArea", value: draft.partnershipArea });
  }
  rows.push({ label: "postDescription", value: draft.description });
  return (
    <div className="space-y-3">
      <p className="font-semibold text-leaf">{typeName}</p>
      <dl className="space-y-3">
        {rows.map(({ label, value }) => (
          <div key={label} className="min-w-0">
            <dt className="text-sm font-bold text-forest">{t(label)}</dt>
            <dd className="mt-1 whitespace-pre-wrap break-words text-ink">{value.trim() || t("emptyValue")}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function CommunityScreen() {
  const t = useM4Text();
  const [draft, setDraft] = useState<CommunityDraft>(emptyCommunityDraft);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [reviewing, setReviewing] = useState(false);
  const [posts, setPosts] = useState<LocalPreviewPost[]>([]);
  const [filter, setFilter] = useState<PostFilter>("all");
  const [notice, setNotice] = useState<"added" | "removed" | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [shareConsent, setShareConsent] = useState(false);
  const [copyState, setCopyState] = useState<"consent" | "copied" | "failed" | null>(null);
  const nextLocalKey = useRef(0);

  const filteredPosts = posts.filter((post) => filter === "all" || post.draft.kind === filter);
  const selectedPost = posts.find((post) => post.id === sharingId);
  const shareText = selectedPost ? formatLocalPreviewText(selectedPost.draft, t) : "";

  function update<K extends DraftField>(field: K, value: CommunityDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors({});
    setReviewing(false);
    setNotice(null);
  }

  function errorFor(field: DraftField): string | undefined {
    const error = errors[field];
    if (!error) return undefined;
    return t(error === "quantity" ? "quantityError"
      : error === "price" ? "priceError" : "requiredError");
  }

  function reviewDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Never submit a real HTTP form.
    const nextErrors = validateCommunityDraft(draft);
    setErrors(nextErrors);
    setNotice(null);
    if (Object.keys(nextErrors).length === 0) setReviewing(true);
  }

  function addLocalPreview() {
    const nextErrors = validateCommunityDraft(draft);
    setErrors(nextErrors);
    if (!reviewing || Object.keys(nextErrors).length > 0) return;
    nextLocalKey.current += 1;
    setPosts((current) => [
      { id: `local-${nextLocalKey.current}`, draft: { ...draft } }, ...current,
    ]);
    setDraft(emptyCommunityDraft());
    setReviewing(false);
    setFilter("all");
    setNotice("added");
  }

  function removeLocalPreview(id: string) {
    setPosts((current) => current.filter((post) => post.id !== id));
    if (sharingId === id) closeShare();
    setNotice("removed");
  }

  function openShare(id: string) {
    setSharingId(id);
    setShareConsent(false);
    setCopyState(null);
  }

  function closeShare() {
    setSharingId(null);
    setShareConsent(false);
    setCopyState(null);
  }

  async function copyReviewedText() {
    if (!selectedPost || !shareConsent) {
      setCopyState("consent");
      return;
    }
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }
      await navigator.clipboard.writeText(shareText);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  const typeOptions: { value: PostKind; label: string }[] = [
    { value: "experience", label: t("typeExperience") },
    { value: "sale", label: t("typeSale") },
    { value: "partnership", label: t("typePartnership") },
  ];
  const filterOptions: { value: PostFilter; label: string }[] = [
    { value: "all", label: t("filterAll") },
    ...typeOptions,
  ];

  return (
    <div className="space-y-7">
      <header className="space-y-3">
        <p className="text-sm font-bold text-leaf">{t("localOnly")}</p>
        <h1 className="text-3xl font-extrabold text-forest sm:text-4xl">{t("communityHeading")}</h1>
        <p className="text-base text-ink">{t("communityIntro")}</p>
        <p className="text-sm text-muted">{t("demoLimit")}</p>
        <LocaleSwitcher />
      </header>

      <section aria-labelledby="m4-posts-heading" className="space-y-4">
        <h2 id="m4-posts-heading" className="text-2xl font-bold text-forest">{t("postsHeading")}</h2>
        <div role="group" aria-label={t("filterLegend")} className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={filter === option.value ? "primary" : "outline"}
              aria-pressed={filter === option.value}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
        <p role="status" aria-live="polite" className="text-sm text-leaf">
          {notice === "added" ? t("addedNotice") : notice === "removed" ? t("removedNotice") : ""}
        </p>
        {posts.length === 0 ? (
          <Card className="space-y-2">
            <h3 className="text-lg font-bold text-forest">{t("emptyTitle")}</h3>
            <p className="text-muted">{t("emptyText")}</p>
          </Card>
        ) : filteredPosts.length === 0 ? (
          <Card><p className="text-muted">{t("noFilterResults")}</p></Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="min-w-0 space-y-4">
                <p className="text-xs font-bold text-leaf">{t("localOnly")}</p>
                <LocalPostContent draft={post.draft} />
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" onClick={() => openShare(post.id)}>
                    <ClipboardCopy aria-hidden="true" size={18} /> {t("shareAction")}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => removeLocalPreview(post.id)}>
                    <Trash2 aria-hidden="true" size={18} /> {t("removeLocal")}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {selectedPost && (
        <section aria-labelledby="m4-share-heading">
          <Card className="space-y-4 border border-leaf bg-mint">
            <h2 id="m4-share-heading" className="text-xl font-bold text-forest">{t("shareHeading")}</h2>
            <p className="text-sm text-ink">{t("shareWarning")}</p>
            <div className="space-y-2">
              <label htmlFor="m4-share-text" className="font-bold text-forest">{t("shareTextLabel")}</label>
              <textarea
                id="m4-share-text"
                readOnly
                rows={8}
                value={shareText}
                className="w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-white p-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-leaf"
              />
            </div>
            <label className="flex min-h-11 items-start gap-3 text-sm font-semibold text-forest">
              <input
                type="checkbox"
                checked={shareConsent}
                onChange={(event) => { setShareConsent(event.target.checked); setCopyState(null); }}
                className="mt-1 h-5 w-5 shrink-0 accent-[var(--leaf)]"
              />
              <span>{t("shareConsent")}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={copyReviewedText}>{t("copyAction")}</Button>
              <Button type="button" variant="outline" onClick={closeShare}>{t("closeShare")}</Button>
            </div>
            {copyState && (
              <p role={copyState === "consent" || copyState === "failed" ? "alert" : "status"}
                className="text-sm font-semibold text-forest">
                {t(copyState === "consent" ? "shareConsentError"
                  : copyState === "copied" ? "copySuccess" : "copyFailure")}
              </p>
            )}
            <p className="text-sm text-muted">{t("shareUnavailable")}</p>
          </Card>
        </section>
      )}

      <section aria-labelledby="m4-compose-heading">
        <Card className="space-y-6">
          <div className="flex items-start gap-3">
            <MessageSquareText aria-hidden="true" className="shrink-0 text-leaf" />
            <div>
              <h2 id="m4-compose-heading" className="text-2xl font-bold text-forest">{t("createHeading")}</h2>
              <p className="mt-1 text-sm text-muted">{t("requiredHint")}</p>
            </div>
          </div>
          <form noValidate onSubmit={reviewDraft} className="space-y-5">
            <ChoiceGroup
              name="m4-kind"
              legend={t("typeLegend")}
              value={draft.kind}
              options={typeOptions}
              onChange={(value) => update("kind", value)}
              error={errorFor("kind")}
            />
            {draft.kind === "experience" && (
              <TextField
                label={t("experienceTitle")}
                hint={t("experienceTitleHint")}
                error={errorFor("title")}
                maxLength={100}
                value={draft.title}
                onChange={(event) => update("title", event.target.value)}
              />
            )}
            {draft.kind === "sale" && (
              <>
                <TextField
                  label={t("saleCrop")}
                  hint={t("saleCropHint")}
                  error={errorFor("crop")}
                  maxLength={80}
                  value={draft.crop}
                  onChange={(event) => update("crop", event.target.value)}
                />
                <TextField
                  label={t("saleQuantity")}
                  hint={t("saleQuantityHint")}
                  error={errorFor("quantity")}
                  inputMode="decimal"
                  maxLength={20}
                  value={draft.quantity}
                  onChange={(event) => update("quantity", event.target.value)}
                />
                <ChoiceGroup
                  name="m4-unit"
                  legend={t("unitLegend")}
                  value={draft.unit}
                  options={[
                    { value: "kg", label: t("unitKg") },
                    { value: "t", label: t("unitTonne") },
                    { value: "other", label: t("unitOther") },
                    { value: "unknown", label: t("unitUnknown") },
                  ]}
                  onChange={(value) => update("unit", value)}
                  error={errorFor("unit")}
                />
                <TextField
                  label={t("salePrice")}
                  hint={t("salePriceHint")}
                  error={errorFor("price")}
                  inputMode="decimal"
                  maxLength={20}
                  value={draft.price}
                  onChange={(event) => update("price", event.target.value)}
                />
                <TextField
                  label={t("saleArea")}
                  hint={t("saleAreaHint")}
                  maxLength={100}
                  value={draft.area}
                  onChange={(event) => update("area", event.target.value)}
                />
              </>
            )}
            {draft.kind === "partnership" && (
              <>
                <TextField
                  label={t("partnershipPurpose")}
                  hint={t("partnershipPurposeHint")}
                  error={errorFor("purpose")}
                  maxLength={150}
                  value={draft.purpose}
                  onChange={(event) => update("purpose", event.target.value)}
                />
                <TextField
                  label={t("partnershipArea")}
                  hint={t("partnershipAreaHint")}
                  error={errorFor("partnershipArea")}
                  maxLength={100}
                  value={draft.partnershipArea}
                  onChange={(event) => update("partnershipArea", event.target.value)}
                />
              </>
            )}
            {draft.kind !== "" && (
              <DescriptionBox
                label={t("description")}
                hint={t("descriptionHint")}
                value={draft.description}
                error={errorFor("description")}
                onChange={(value) => update("description", value)}
              />
            )}
            <Button type="submit">{t("reviewAction")}</Button>
          </form>
          {reviewing && (
            <div className="space-y-4 rounded-[var(--radius-lg)] border border-leaf bg-mint p-4"
              aria-labelledby="m4-review-heading">
              <h3 id="m4-review-heading" className="text-xl font-bold text-forest">{t("reviewHeading")}</h3>
              <p className="text-sm text-ink">{t("reviewMessage")}</p>
              <LocalPostContent draft={draft} />
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={addLocalPreview}>{t("addLocal")}</Button>
                <Button type="button" variant="outline" onClick={() => setReviewing(false)}>{t("cancelReview")}</Button>
              </div>
            </div>
          )}
        </Card>
      </section>

      <Card className="flex items-start gap-3 bg-cream">
        <Info aria-hidden="true" className="shrink-0 text-leaf" />
        <p className="text-sm text-muted">{t("moderationUnavailable")}</p>
      </Card>
    </div>
  );
}
