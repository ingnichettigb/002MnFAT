# Allineamento funnel di ingresso allo standard 001SmMntnnc

## Nota importante prima di procedere

Ho provato ad aprire il progetto di riferimento 001SmMntnnc da questo workspace: l'unico progetto accessibile con quel nome (PWA-001SmMntnnc) contiene solo il template vuoto — non ci sono `src/lib/app-config.ts`, `license.functions.ts`, `condizioni.tsx`, `licenza-scaduta.tsx`. Quindi **non posso leggere il codice sorgente di riferimento**: implementerò seguendo alla lettera la tua descrizione. Se vuoi copia identica byte-per-byte, incollami i 4 file di riferimento.

## Cosa toccherò, file per file

1. `src/lib/app-config.ts` — diventa il punto unico delle chiavi di sessione: le 4 chiavi oggi in `__root.tsx` (`VERIFIED_EMAIL_KEY`, `ACTIVATED_KEY`, `LICENSE_ID_KEY`, `CONSENT_KEY`, prefisso `002MnFAT:` invariato) più `LAST_LICENSE_CHECK_KEY` e `LICENSE_INVALID_REASON_KEY`. Aggiungo `GATE_KEYS` (le 5 chiavi tranne `LICENSE_INVALID_REASON_KEY`), `LICENSE_KEYS` (activated, licenseId, consent, lastCheck — l'email verificata resta), e `clearGateKeys()` / `clearLicenseKeys()` (no-op lato server).

2. `src/routes/__root.tsx` —
   - rimuovo le 4 `export const` chiavi e le re-importo da `@/lib/app-config` (mantengo un re-export solo se serve a non rompere import esterni: preferisco aggiornare gli import, vedi punto 3);
   - `PUBLIC_PATHS` include anche `/licenza-scaduta`;
   - `AuthGate`: quando il path è protetto (non pubblico, non `/attivazione`) e i flag locali dicono "attivato", chiamo `checkLicenseStatus({ data: { licenseId } })` **prima** di concedere l'accesso. `valid === true` → scrivo `LAST_LICENSE_CHECK_KEY` e mostro il contenuto; `valid === false` → scrivo il motivo in `LICENSE_INVALID_REASON_KEY`, `clearLicenseKeys()`, redirect a `/licenza-scaduta`; eccezione di rete → accesso concesso (fail-open). Nessuna cache: ad ogni caricamento di pagina protetta.
   - bottone "Esci" → `clearGateKeys()` invece delle 4 `removeItem`.

3. `src/routes/auth.tsx`, `src/routes/attivazione.tsx`, `src/routes/condizioni.tsx` — cambio la sorgente degli import da `@/routes/__root` a `@/lib/app-config`. In `attivazione.tsx` il "Cambia email" usa `clearGateKeys()`.

4. `src/lib/license.functions.ts` — aggiungo `checkLicenseStatus` (server fn POST, input `{ licenseId: uuid }`) che si appoggia a un helper `runLicenseStatus`: legge `is_active, expires_at` da `licenses` sul DB esterno per quell'id e ritorna `{ valid, reason: "expired" | "deactivated" | "not_found" | null }`. Fail-open su qualunque errore: `{ valid: true, reason: null }`. Non toccherò `verifyAndActivateLicense`.

5. `src/routes/condizioni.tsx` — nell'`useEffect`, dopo aver letto email/licenseId, chiamo `checkTermsConsent({ data: { licenseId } })`: se `accepted === true` scrivo `CONSENT_KEY="1"` e `ACTIVATED_KEY="1"` e navigo a `/`; altrimenti mostro il form. Stato `ready` + loader per evitare il flash del form.

6. `src/routes/licenza-scaduta.tsx` (nuovo) — legge `LICENSE_INVALID_REASON_KEY`, messaggio distinto per `expired` / `deactivated` / `not_found` (default generico), bottone verso `/attivazione`. Route pubblica, `head()` con titolo proprio e `robots: noindex`.

## Cosa NON toccherò

- Il testo delle condizioni d'uso (`src/lib/terms-i18n.ts`, `src/components/terms-consent.tsx`).
- Il flusso OTP (`src/lib/otp.functions.ts`) e la logica di `auth.tsx` oltre alla riga di import.
- `verifyAndActivateLicense` e le tabelle/DB (nessuna migrazione).
- Tutte le pagine applicative: `index.tsx`, `controlli.tsx`, `report.tsx`, `archivio.tsx`, PDF, i18n, componenti FAT.
- I client Supabase generati e i README esistenti (posso aggiornarli dopo, se vuoi).

## Punti chiusi (confermati)

1. Procedo a specifica, senza i file di riferimento.
2. Prefisso `002MnFAT:` invariato, nessuna migrazione delle sessioni.
3. `checkLicenseStatus` pubblica, stesso pattern di `checkTermsConsent`.
4. `/licenza-scaduta` tradotta nelle **4 lingue** (it/en/de/es) via `useI18n`, come il resto dell'app.
5. README non aggiornati in questo passaggio.
6. Bottone finale di `/licenza-scaduta`: prima di navigare ricontrolla `VERIFIED_EMAIL_KEY` in localStorage — presente → `/attivazione`, assente → `/auth`.


## Verifiche finali che farò

- Typecheck del progetto.
- Conferma dei tre comportamenti richiesti (consenso cross-browser via DB, revoca licenza → `/licenza-scaduta` con motivo, fail-open su errore tecnico).
