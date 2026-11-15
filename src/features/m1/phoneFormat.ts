export type PhoneFormatState = "empty" | "valid" | "invalid";

/** Client-side formatting hint, NOT a valid/reachable-number or identity check. */
export function checkMoroccanPhoneFormat(value: string): PhoneFormatState {
  const compact = value.replace(/[\s().-]/g, "");
  if (!compact) return "empty";
  return /^(?:0[67]\d{8}|\+212[67]\d{8})$/.test(compact) ? "valid" : "invalid";
}
