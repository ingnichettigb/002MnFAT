export const APP_CODE = "002MnFAT";
export const APP_NAME = "Mini F.A.T.";
export const TERMS_VERSION = "v1";

// ---------------------------------------------------------------------------
// Chiavi localStorage del funnel di ingresso (namespaced con APP_CODE per
// evitare conflitti fra le SaaS del portfolio sullo stesso browser/dominio).
// ---------------------------------------------------------------------------
export const VERIFIED_EMAIL_KEY = "002MnFAT:verifiedEmail";
export const ACTIVATED_KEY = "002MnFAT:activated";
export const LICENSE_ID_KEY = "002MnFAT:licenseId";
export const PUK_ID_KEY = "002MnFAT:pukId";
export const CONSENT_KEY = "002MnFAT:consent";
export const LAST_LICENSE_CHECK_KEY = "002MnFAT:lastLicenseCheck";
export const LICENSE_INVALID_REASON_KEY = "002MnFAT:licenseInvalidReason";

/** Tutte le chiavi del gate (esclusa la ragione di invalidità, informativa). */
export const GATE_KEYS = [
  VERIFIED_EMAIL_KEY,
  ACTIVATED_KEY,
  LICENSE_ID_KEY,
  CONSENT_KEY,
  LAST_LICENSE_CHECK_KEY,
] as const;

/** Solo lo stato licenza: l'email verificata si conserva. */
export const LICENSE_KEYS = [
  ACTIVATED_KEY,
  LICENSE_ID_KEY,
  CONSENT_KEY,
  LAST_LICENSE_CHECK_KEY,
] as const;

export function clearGateKeys() {
  if (typeof window === "undefined") return;
  for (const k of GATE_KEYS) window.localStorage.removeItem(k);
}

export function clearLicenseKeys() {
  if (typeof window === "undefined") return;
  for (const k of LICENSE_KEYS) window.localStorage.removeItem(k);
}
