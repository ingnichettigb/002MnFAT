# Step 2.5 — Accettazione Condizioni d'Uso

Nuovo step obbligatorio tra attivazione licenza e accesso alla SaaS, con consenso persistito su `license_consents` (tabella esistente, non modificata) e testo in 4 lingue riutilizzabile per altri prodotti.

## 1. Config app (`src/lib/app-config.ts`)

Estendere il file esistente aggiungendo:

- `APP_NAME = "mini FAT"` — nome mostrato nel testo delle condizioni (interpolato al posto di `{{APP_NAME}}`).
- `TERMS_VERSION = "v1"` — versione condizioni. Cambiandola in futuro si forzerà un nuovo consenso.

Per riuso su altri SaaS: solo `APP_CODE`, `APP_NAME`, `TERMS_VERSION` cambiano; tutto il resto è generico.

## 2. Nuovo file traduzioni (`src/lib/terms-i18n.ts`)

File separato dal `dict` principale per non appesantirlo. Struttura:

```
export const TERMS: Record<Lang, {
  langLabel: string;             // "Italiano" / "English" / ...
  pageTitle: string;             // "Condizioni d'Uso"
  stepLabel: string;             // "Passaggio 3 di 3"
  checkboxLabel: string;         // "Ho letto e accetto le condizioni d'uso"
  acceptButton: string;          // "Accetta e continua"
  acceptingButton: string;       // "Salvataggio…"
  errorGeneric: string;          // fallback errore
  content: {                     // corpo delle condizioni
    heading: string;             // "CONDIZIONI D'USO DEL SOFTWARE"
    subheading: string;          // "{{APP_NAME}} — Versione 1.0"
    sections: Array<{ title: string; body: string }>; // 9 sezioni numerate
    footer: string;              // "Versione: v1 — Ultimo aggiornamento: 14 luglio 2026"
  };
}>
```

Testo italiano preso fedelmente dal brief. Traduzioni EN/DE/ES prodotte mantenendo:

- stessa struttura a 9 punti numerati con stessi titoli,
- registro legale/formale,
- riferimenti invariati (Paddle.com Market Limited, P.IVA IT01235350194, GDPR, Foro di Cremona, `/pagamenti-merchant-of-record`),
- placeholder `{{APP_NAME}}` conservato nel testo e sostituito a runtime.

## 3. Nuovo componente riutilizzabile (`src/components/terms-consent.tsx`)

Componente puro presentazionale + logica, riutilizzabile senza modifiche:

- Props: `licenseId: string`, `email: string`, `onAccepted: () => void`.
- Stato interno: `lang` (default `'it'`), `checked`, `loading`, `error`.
- Selettore lingua in alto: 4 pill/button (IT/EN/DE/ES) coerenti col brand (`#06090f` bg, `#0a2a4a` surface, `#b4ff3c` accent attivo).
- Box scrollabile (`max-h-[50vh] overflow-y-auto`) con `heading`, `subheading`, le 9 sezioni e il footer, con `{{APP_NAME}}` sostituito da `APP_NAME`.
- Checkbox obbligatoria + label tradotta.
- Bottone "Accetta e continua" tradotto, disabilitato finché `!checked || loading`.
- Al click: chiama la server function `recordTermsConsent` (vedi §4). Su successo → `onAccepted()`. Su errore generico → mostra `errorGeneric`.

## 4. Server function (`src/lib/consent.functions.ts`)

Nuovo file, pattern identico a `license.functions.ts`:

- `checkTermsConsent({ licenseId })` → interroga `supabaseExternal.from('license_consents').select('id').eq('license_id', licenseId).eq('terms_version', TERMS_VERSION).maybeSingle()`. Ritorna `{ accepted: boolean }`.
- `recordTermsConsent({ licenseId, language })`:
  - Legge `app_code` dalla riga `licenses` corrispondente (evita di fidarsi del client).
  - Insert su `license_consents` con `license_id`, `app_code`, `language`, `terms_version = TERMS_VERSION`, `user_agent` (header `user-agent` via `getRequestHeader`), `ip_address` (header `x-forwarded-for` prima virgola, altrimenti `null`).
  - Se errore Postgres `code === '23505'` (violazione UNIQUE `license_id, terms_version`) → ritorna `{ ok: true, alreadyExisted: true }`.
  - Altri errori → ritorna `{ ok: false, code: 'E-301' }`; il componente mostra `errorGeneric` e blocca l'accesso.
  - Successo → `{ ok: true, alreadyExisted: false }`.

Entrambe usano `supabaseExternal` (mai il client Lovable).

## 5. Integrazione nel flusso attivazione (`src/routes/attivazione.tsx`)

Dopo `activate(...)` con `res.ok === true`:

1. Chiama `checkTermsConsent({ licenseId: res.licenseId })`.
2. Se `accepted === true` → comportamento attuale: setta `ACTIVATED_KEY` e naviga a `/`.
3. Se `accepted === false` → NON setta ancora `ACTIVATED_KEY`, memorizza `licenseId` in stato locale e mostra `<TermsConsent licenseId={...} email={email} onAccepted={...} />` al posto del form.
4. In `onAccepted`: setta `ACTIVATED_KEY` e naviga a `/`.

Aggiornare `CardDescription` in "Passaggio 2 di 3" quando serve.

## 6. Auth gate (`src/routes/__root.tsx`)

Nessuna modifica strutturale: la sequenza `verified → activated → app` resta valida. Il consenso è verificato dentro `attivazione.tsx` prima di scrivere `ACTIVATED_KEY`, quindi l'utente non può raggiungere la SaaS senza aver firmato. Casi limite (utente già `ACTIVATED_KEY=1` in localStorage da sessioni precedenti a questa modifica) non sono gestiti: il consenso è comunque persistito lato server per nuove attivazioni, coerente con il brief che descrive il nuovo flusso post-attivazione.

## Note tecniche

- `license_consents` non è nella lista `<supabase-tables>` locale ma è nel DB esterno (`supabaseExternal`) — nessuna migration.
- `TERMS_VERSION` centralizzato: cambiando a `'v2'` in futuro, `checkTermsConsent` non trova il record e forza nuova accettazione automaticamente.
- `APP_NAME` interpolato via semplice `str.replaceAll('{{APP_NAME}}', APP_NAME)` in tutte e 4 le lingue.
- Colori brand applicati via classi Tailwind arbitrarie / inline style solo sul componente consenso, per non toccare il design system globale.

## Out of scope

- Nessuna modifica a `license_consents`, `licenses`, `puk_codes`, `lead_emails`.
- Nessuna modifica al client Supabase standard.
- Nessuna riscrittura dell'auth gate o del flusso OTP.
- Nessuna pagina pubblica `/condizioni-uso` (solo il consenso in-flow).
