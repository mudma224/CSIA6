import { useLocale } from "@/i18n/LocaleProvider";

export type CropRow = {
  crop_id: string;
  name_en: string;
  name_ar: string;
  scientific_name: string;
  class: string;
  lifecycle: string;
  observed: boolean;
  observed_count: number | null;
  rare: boolean;
  form_p0: boolean;
};

/**
 * Renders the validated crop vocabulary from `src/data/crops.v1.json`.
 * Data deliverable of the data-science contributor; values are committed
 * and must not be edited from the UI.
 */
export function CropsTable({ crops }: { crops: CropRow[] }) {
  const { t } = useLocale();
  return (
    <table className="w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-white text-left shadow-[var(--shadow-card)]">
      <thead>
        <tr className="bg-forest text-white">
          <th scope="col" className="px-3 py-2 text-sm font-semibold">{t("colCropId")}</th>
          <th scope="col" className="px-3 py-2 text-sm font-semibold">{t("colEnglish")}</th>
          <th scope="col" className="px-3 py-2 text-sm font-semibold">{t("colArabic")}</th>
          <th scope="col" className="px-3 py-2 text-sm font-semibold">{t("colScientific")}</th>
          <th scope="col" className="px-3 py-2 text-sm font-semibold">{t("colClass")}</th>
          <th scope="col" className="px-3 py-2 text-sm font-semibold">{t("colLifecycle")}</th>
          <th scope="col" className="px-3 py-2 text-sm font-semibold">{t("colObserved")}</th>
          <th scope="col" className="px-3 py-2 text-sm font-semibold">{t("colP0")}</th>
        </tr>
      </thead>
      <tbody>
        {crops.map((crop) => (
          <tr key={crop.crop_id} className="border-t border-[var(--border)]">
            <td className="px-3 py-2 font-mono text-sm text-forest">{crop.crop_id}</td>
            <td className="px-3 py-2">{crop.name_en}</td>
            <td dir="rtl" lang="ar" className="px-3 py-2 text-lg">{crop.name_ar}</td>
            <td className="px-3 py-2 text-sm italic text-muted">{crop.scientific_name}</td>
            <td className="px-3 py-2 text-sm">{crop.class}</td>
            <td className="px-3 py-2 text-sm">{crop.lifecycle}</td>
            <td className="px-3 py-2 text-sm" data-testid={`observed-${crop.crop_id}`}>{crop.observed_count ?? "—"}</td>
            <td className="px-3 py-2">
              <span
                data-testid={`p0-${crop.crop_id}`}
                className={`rounded-[var(--radius-pill)] px-3 py-1 text-xs font-bold ${crop.form_p0 ? "bg-mint text-forest" : "bg-[var(--canvas)] text-muted"}`}
              >
                {crop.form_p0 ? "P0" : "—"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
