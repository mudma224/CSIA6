export type ZoneChoice = "" | "amir" | "moussa" | "other" | "unsure";
export type IrrigationChoice = "" | "drip-ui" | "surface-ui" | "other-ui" | "unsure";
export type LocationChoice = "none" | "manual";
export type PlannedSeasonChoice = "" | "known" | "unsure";
export type ParcelStep = 0 | 1 | 2 | 3;

/** React form draft only. Do NOT treat this as a server/API contract. */
export type ParcelDraft = {
  parcelName: string;
  zone: ZoneChoice;
  areaHa: string;
  irrigation: IrrigationChoice;
  locationChoice: LocationChoice;
  latitude: string;
  longitude: string;
  recentCrop: string;
  recentCropSeason: string;
  earlierCrop: string;
  earlierCropSeason: string;
  seasonChoice: PlannedSeasonChoice;
  plannedSeason: string;
};

export const emptyParcelDraft: ParcelDraft = {
  parcelName: "",
  zone: "",
  areaHa: "",
  irrigation: "",
  locationChoice: "none", // no coordinate is inferred or assigned
  latitude: "",
  longitude: "",
  recentCrop: "",
  recentCropSeason: "",
  earlierCrop: "",
  earlierCropSeason: "",
  seasonChoice: "",
  plannedSeason: "",
};

export type ParcelErrorField =
  | "parcelName" | "zone" | "areaHa" | "irrigation"
  | "latitude" | "longitude" | "recentCrop" | "recentCropSeason"
  | "earlierCrop" | "earlierCropSeason" | "seasonChoice" | "plannedSeason";

export type ParcelErrorCode =
  | "requiredZone" | "invalidArea" | "requiredIrrigation"
  | "invalidLatitude" | "invalidLongitude" | "requiredCoordinates"
  | "requiredSeasonMode" | "requiredSeasonText" | "invalidSeasonFormat"
  | "cropRequiredForSeason" | "unrecognizedCrop"
  | "tooLongName" | "tooLongCrop" | "tooLongSeason";

export type ParcelErrors = Partial<Record<ParcelErrorField, ParcelErrorCode>>;

// Deliberately rejects scientific notation, units and non-decimal text.
// Commas are accepted for a user's decimal separator; no area is estimated.
function decimalInput(value: string): number | null {
  const clean = value.trim();
  if (!/^-?\d+(?:[.,]\d+)?$/.test(clean)) return null;
  const parsed = Number(clean.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function isCoordinateValid(value: string, min: number, max: number): boolean {
  const number = decimalInput(value);
  return number !== null && number >= min && number <= max;
}

// Campaign grammar shared with the recommendation contract (v0.2): consecutive
// campaign years like 2024-2025. The form guides the farmer to it instead of
// accepting unverifiable free wording that the engine could not interpret.
export function seasonFormatOk(value: string): boolean {
  if (!/^\d{4}-\d{4}$/.test(value)) return false;
  return Number(value.slice(0, 4)) + 1 === Number(value.slice(5));
}

/** Usability validation only; server/model requirements are not determined here. */
export function validateParcelStep(draft: ParcelDraft, step: 0 | 1 | 2): ParcelErrors {
  const errors: ParcelErrors = {};

  if (step === 0) {
    if (!draft.zone) errors.zone = "requiredZone";
    if (draft.parcelName.trim().length > 60) errors.parcelName = "tooLongName";
    if (draft.areaHa.trim() !== "") {
      const area = decimalInput(draft.areaHa);
      if (area === null || area <= 0) errors.areaHa = "invalidArea";
    }
  }

  if (step === 1) {
    if (!draft.irrigation) errors.irrigation = "requiredIrrigation";
    if (draft.locationChoice === "manual") {
      if (!draft.latitude.trim() || !draft.longitude.trim()) {
        if (!draft.latitude.trim()) errors.latitude = "requiredCoordinates";
        if (!draft.longitude.trim()) errors.longitude = "requiredCoordinates";
      } else {
        if (!isCoordinateValid(draft.latitude, -90, 90)) errors.latitude = "invalidLatitude";
        if (!isCoordinateValid(draft.longitude, -180, 180)) errors.longitude = "invalidLongitude";
      }
    }
  }

  if (step === 2) {
    if (!draft.seasonChoice) errors.seasonChoice = "requiredSeasonMode";
    if (draft.seasonChoice === "known" && !draft.plannedSeason.trim()) {
      errors.plannedSeason = "requiredSeasonText";
    }
    if (draft.plannedSeason.trim().length > 40) errors.plannedSeason = "tooLongSeason";
    for (const [cropKey, seasonKey] of [
      ["recentCrop", "recentCropSeason"],
      ["earlierCrop", "earlierCropSeason"],
    ] as const) {
      if (draft[cropKey].trim().length > 80) errors[cropKey] = "tooLongCrop";
      if (draft[seasonKey].trim().length > 40) errors[seasonKey] = "tooLongSeason";
      if (!draft[cropKey].trim() && draft[seasonKey].trim()) {
        errors[cropKey] = "cropRequiredForSeason";
      }
    }
    // Campaign grammar when a season is provided (C06: unknown stays allowed).
    // Never overwrites a length error already reported on the same field.
    if (!errors.plannedSeason && draft.plannedSeason.trim()
      && !seasonFormatOk(draft.plannedSeason.trim())) {
      errors.plannedSeason = "invalidSeasonFormat";
    }
    if (!errors.recentCropSeason && !errors.recentCrop && draft.recentCropSeason.trim()
      && !seasonFormatOk(draft.recentCropSeason.trim())) {
      errors.recentCropSeason = "invalidSeasonFormat";
    }
    if (!errors.earlierCropSeason && !errors.earlierCrop && draft.earlierCropSeason.trim()
      && !seasonFormatOk(draft.earlierCropSeason.trim())) {
      errors.earlierCropSeason = "invalidSeasonFormat";
    }
  }

  return errors;
}

export function firstInvalidStep(draft: ParcelDraft): 0 | 1 | 2 | null {
  for (const step of [0, 1, 2] as const) {
    if (Object.keys(validateParcelStep(draft, step)).length) return step;
  }
  return null;
}
