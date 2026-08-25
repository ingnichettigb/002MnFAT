# Flusso di ingresso, licenze e conteggio export PDF — Documentazione Tecnica

> Progetto di riferimento: **Mini F.A.T.** — `APP_CODE = "002MnFAT"`.
> Documento di replica per altri programmi del portfolio.
> Stato: sistema in produzione. Ultimo allineamento al codice: 25 ago 2026.
>
> **Nota:** questo file sostituisce e unifica i precedenti
> `FLUSSO-INGRESSO-README.md` e `AUTENTICAZIONE-MULTISEAT-README.md`
> (quest'ultimo eliminato: conteneva una copia di `license.functions.ts`
> destinata a disallinearsi dal codice reale — da qui in poi il comportamento
> è descritto in prosa, con rimando al file sorgente, non duplicato in TypeScript).

Il flusso è composto da **3 passaggi obbligatori e sequenziali**, più un gate
globale (`AuthGate`) che impedisce di saltarne uno e che **rivalida la
licenza a ogni navigazione**, non solo al primo accesso:

```
/auth              Passaggio 1 di 3  →  verifica email con codice OTP
/attivazione       Passaggio 2 di 3  →  verifica licenza + PUK (self-claim multi-seat)
/condizioni        Passaggio 3 di 3  →  accettazione condizioni d'uso (4 lingue)
/                                       SaaS accessibile
/licenza-scaduta   (solo se la rivalidazione runtime fallisce, vedi sezione 6)
```

---

## 0. Configurazione centrale

**`src/lib/app-config.ts`** — unico file da cambiare per un nuovo prodotto.
Contiene sia i codici prodotto sia **tutte** le chiavi localStorage del gate
(non in `__root.tsx`, che le importa soltanto):

```ts
export const APP_CODE = "002MnFAT";
export const APP_NAME = "Mini F.A.T.";
export const TERMS_VERSION = "v1";

export const VERIFIED_EMAIL_KEY = "002MnFAT:verifiedEmail";
export const ACTIVATED_KEY = "002MnFAT:activated";
export const LICENSE_ID_KEY = "002MnFAT:licenseId";
export const CONSENT_KEY = "002MnFAT:consent";
export const LAST_LICENSE_CHECK_KEY = "002MnFAT:lastLicenseCheck";
export const LICENSE_INVALID_REASON_KEY = "002MnFAT:licenseInvalidReason";

export const GATE_KEYS = [VERIFIED_EMAIL_KEY, ACTIVATED_KEY, LICENSE_ID_KEY, CONSENT_KEY, LAST_LICENSE_CHECK_KEY] as const;
export const LICENSE_KEYS = [ACTIVATED_KEY, LICENSE_ID_KEY, CONSENT_KEY, LAST_LICENSE_CHECK_KEY] as const;

export function clearGateKeys() { /* rimuove tutte le GATE_KEYS */ }
export function clearLicenseKeys() { /* rimuove solo LICENSE_KEYS, l'email verificata resta */ }
```

Sono **6** le chiavi, non 4: le ultime due (`LAST_LICENSE_CHECK_KEY`,
`LICENSE_INVALID_REASON_KEY`) servono alla rivalidazione runtime (sezione 6),
non al claim iniziale.

### Due database Supabase distinti

| Client | File | Uso |
|---|---|---|
| Cloud (progetto locale) | `@/integrations/supabase/client.server` → `supabaseAdmin` | tabella `lead_emails` (OTP) |
| Esterno (progetto licenze condiviso, `ruopxyprezzxoirfrjrm`) | `@/integrations/supabase/client.external` → `supabaseExternal` | `licenses`, `puk_codes`, `license_puk_map`, `users`, `license_consents` |

Il client esterno usa due secret: `EXTERNAL_SUPABASE_URL` e
`EXTERNAL_SUPABASE_SERVICE_ROLE_KEY`. Entrambi i client sono importati
**dinamicamente dentro l'handler** della server function, mai a livello di modulo.

**Obbligatorio** cambiare il prefisso `APP_CODE:` delle chiavi in un nuovo
progetto: senza namespacing, due SaaS del portfolio sullo stesso browser/dominio
si sovrascrivono la sessione.

---

## 1. Schema database (progetto esterno condiviso)

### `public.licenses`

| Colonna | Tipo | Note |
|---|---|---|
| `id` | uuid | PK |
| `license_key` | text | NOT NULL — **nessun vincolo UNIQUE** (vedi §5.3) |
| `user_email` | text | email dell'**acquirente**, non filtro di attivazione |
| `app_code` | text | prodotto associato (es. `002MnFAT`) |
| `seats` | integer | numero di posti/PUK generati dal trigger |
| `is_active` | boolean | default `true`; passa a `false` per disattivazione manuale **o** per esaurimento plafond export (sezione 5) |
| `expires_at` | timestamptz | nullable; per `single_use` resta `NULL` fino al primo claim (sezione 4) |
| `activated_at` | timestamptz | nullable — **deve esistere come colonna** (vedi §5.2) |
| `subscription_type` | text | `'monthly' \| 'annual' \| 'single_use' \| null` — nessun CHECK a livello DB, è convenzione applicativa |
| `pdf_exports_remaining` | integer | plafond export residuo; `NULL` = illimitato |
| `created_at` | timestamptz | |

### `public.puk_codes`

| Colonna | Tipo | Note |
|---|---|---|
| `id` | uuid | PK |
| `code` | text | NOT NULL, UNIQUE — codice PUK personale |
| `license_id` | uuid | FK → `licenses(id)`, legame legacy diretto ancora supportato |
| `user_id` | uuid | FK → **`public.users(id)`**, mai `auth.users` (vedi §5.1) |
| `type_product_code` | text | filtro prodotto, es. `002MnFAT` |
| `used` / `used_at` | boolean / timestamptz | flag e timestamp del claim |

### `public.license_puk_map`

Legame N:N licenza↔PUK (canonico, sostituisce il FK diretto legacy):
`id`, `license_id` → `licenses(id)`, `puk_id` → `puk_codes(id)`.

> ⚠️ Non esiste un vincolo `UNIQUE (license_id, puk_id)`: nulla impedisce righe
> duplicate per errore applicativo o retry. Valutare:
> `ALTER TABLE license_puk_map ADD CONSTRAINT uq_license_puk UNIQUE (license_id, puk_id);`

### `public.users` (portfolio globale)

`id`, `email` (NOT NULL, UNIQUE case-insensitive), `created_at`.
**Non** è `auth.users` di Supabase: è un'anagrafica applicativa condivisa da
tutte le SaaS del portfolio.

### `public.lead_emails` (Cloud, per-SaaS)

`id`, `email`, `verification_code`, `is_verified`, `verified_at`, `created_at`,
`source` (= `APP_CODE`), `otp_attempts`, `otp_window_start`.

### `public.license_consents` (Cloud, per-SaaS)

`id`, `license_id`, `app_code`, `language`, `terms_version`, `user_agent`,
`ip_address`. Vincolo UNIQUE atteso su `(license_id, terms_version)`.

### Trigger DB — generazione automatica dei PUK

Installati **una sola volta** sul progetto esterno condiviso, non vanno
ricreati per ogni nuova SaaS.

```sql
CREATE OR REPLACE FUNCTION public.generate_puk_code()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := ''; i int; exists_already boolean;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..12 LOOP
      result := result || substr(chars, (floor(random() * length(chars))::int) + 1, 1);
    END LOOP;
    SELECT EXISTS(SELECT 1 FROM public.puk_codes WHERE code = result) INTO exists_already;
    EXIT WHEN NOT exists_already;
  END LOOP;
  RETURN result;
END; $$;

CREATE OR REPLACE FUNCTION public.trigger_generate_puk_codes()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE i int; new_puk_id uuid; new_code text;
BEGIN
  FOR i IN 1..COALESCE(NEW.seats, 1) LOOP
    new_code := public.generate_puk_code();
    INSERT INTO public.puk_codes (code, license_id, type_product_code)
    VALUES (new_code, NEW.id, NEW.app_code) RETURNING id INTO new_puk_id;
    INSERT INTO public.license_puk_map (license_id, puk_id) VALUES (NEW.id, new_puk_id);
  END LOOP;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_generate_puk_codes
AFTER INSERT ON public.licenses
FOR EACH ROW EXECUTE FUNCTION public.trigger_generate_puk_codes();
```

**Effetto pratico:** inserire una `licenses` con `seats = 5` produce
automaticamente 5 PUK distribuibili ai 5 utilizzatori finali.

> ⚠️ Se il codice SQL installato differisce da questo, verificare via
> `pg_get_functiondef` prima di replicare su altri ambienti.

---

## 2. PASSAGGIO 1 — Verifica email con OTP

File: `src/lib/otp.functions.ts` (logica), `src/routes/auth.tsx` (UI).

```ts
const OTP_TTL_MIN = 10;        // validità codice, in minuti
const OTP_MAX_PER_WINDOW = 3;  // massimo 3 codici
const OTP_WINDOW_HOURS = 24;   // per finestra di 24 ore
```

> `lead_emails.otp_window_start` ha doppia funzione: rate-limit a 24h **e**
> calcolo della scadenza dei 10 minuti. Non usare `created_at` per il TTL: la
> riga viene riutilizzata e il codice risulterebbe scaduto subito.

### `requestOtp({ email })`

1. Legge l'ultima riga per quella email (`.ilike`, ordinata per `created_at` desc).
2. Se `is_verified === true` → reset rate-limit (chi ha già verificato può
   sempre richiedere un nuovo codice); se la finestra 24h è scaduta → reset.
3. Se `attempts >= 3` → `E-011`.
4. Genera un codice a 6 cifre, aggiorna la riga non verificata o ne inserisce una nuova.
5. Invia l'email via Resend (connettore Lovable). Fallimento invio → `E-010`.

### `verifyOtp({ email, code })`

1. Cerca `email ilike` + `verification_code = code` + `is_verified = false`. Nessuna riga → `E-012`.
2. Età del codice da `otp_window_start` (fallback `created_at`) > 10 min → `E-012`
   (stesso codice sia per "sbagliato" che per "scaduto": non si rivela quale).
3. Update `is_verified = true`, `verified_at = now()`, `otp_attempts = 0`.
4. **Rilettura di conferma**: se non risulta `is_verified === true` dopo l'update → `E-013`.

### UI `/auth`

Tre stadi: `email → otp → done`. Allo stadio `done`, dopo 600ms scrive
`VERIFIED_EMAIL_KEY` e naviga a `/attivazione`. Nessuna scorciatoia di sviluppo:
l'unico modo di superare il passaggio 1 è la verifica OTP reale.

---

## 3. PASSAGGIO 2 — Licenza + PUK (self-claim multi-seat)

File: `src/lib/license.functions.ts` (logica), `src/routes/attivazione.tsx` (UI).

`verifyAndActivateLicense({ email, licenseKey, puk })` esegue, in ordine:

1. **Email verificata** su Cloud (`lead_emails.is_verified = true`) → assente `E-001`.
2. **Licenza** trovata per `license_key` + `app_code` + `is_active = true`,
   **senza filtro su email** (questo abilita il self-claim: chi compra può
   distribuire i codici ad altri utenti) → assente `E-101`.
3. **Scadenza**: `expires_at` valorizzata e nel passato → `E-103`.
4. **PUK esistente** per `code` → assente `E-201`.
5. **PUK del prodotto giusto**: `type_product_code` valorizzato e ≠ `APP_CODE` → `E-203`.
6. **PUK appartenente alla licenza**: via `license_puk_map` o FK legacy diretto → altrimenti `E-204`.
7. **Risoluzione utente** in `public.users` per email (insert se assente).
8. **Claim del posto**: `user_id` di un altro utente → `E-202`; stesso utente →
   `reactivated: true`; `NULL` → update atomico guardato da `.is('user_id', null)`,
   se la guardia non matcha (race) → `E-202`.
9. **Prima attivazione** (`activated_at` ancora `NULL`): update guardato da
   `.is('activated_at', null)` che valorizza `activated_at` e, **se
   `subscription_type === 'single_use'`, anche `expires_at = now() + 48h`**
   nello stesso update (sezione 4 per il dettaglio).
10. Successo → `{ ok, reactivated, licenseId, pukId, userId }`.

Qualsiasi eccezione → `E-500`.

### UI `/attivazione`

Campi: email verificata (readonly), codice licenza, codice PUK. Su successo:
scrive `LICENSE_ID_KEY`, rimuove `ACTIVATED_KEY`/`CONSENT_KEY`, naviga a
`/condizioni`. `ACTIVATED_KEY` viene scritta **solo** dopo l'accettazione delle
condizioni (passaggio 3): così il passaggio 3 non è aggirabile.

---

## 4. Licenze a utilizzo singolo (`single_use`)

Non è una tabella o un meccanismo separato: è uno **stato** del modello
esistente, riconosciuto da `subscription_type = 'single_use'`.

- **Alla creazione** (Edge Function `license-generator-programma`, sezione 7):
  `expires_at = NULL` apposta, `pdf_exports_remaining = product_catalog.max_pdf_exports`
  (tipicamente `1`), `seats` tipicamente `1`.
- **Al primo claim** (passaggio 2, punto 9 sopra): `expires_at` viene scritto
  ora, `now() + 48 ore` — le 48h partono dal primo accesso reale, **non**
  dall'acquisto né dalla creazione della riga.
- **Alla generazione del PDF finale**: `is_active` passa a `false` (sezione 5),
  chiudendo l'accesso indipendentemente da `expires_at` — quindi in pratica
  l'accesso dura "fino al primo export o 48h, quale delle due arriva prima".
- **Non rinnovabile**: `license-renew-programma` (sezione 7) rifiuta
  esplicitamente con `400` qualsiasi tentativo di rinnovo su una licenza
  `single_use`.
- **Non esiste per i corsi**: `license-generator-corso` forza sempre
  `subscription_type: null` — il modello è pensato solo per la family
  "programma" (SaaS), non per i corsi e-learning.

---

## 5. Conteggio export PDF (plafond per licenza)

Meccanismo generico — vale per qualunque licenza con `pdf_exports_remaining`
valorizzato, non solo per le `single_use` (che semplicemente nascono con
plafond `1` e quindi vengono "bruciate" al primo export da questo stesso codice).

### Lettura dello stato — `getPdfExportsStatus({ licenseId })`

Chiamata al mount di `report.tsx`. Ritorna `{ remaining }`:
`remaining === null` → illimitato, nessun banner/blocco.

**In UI** (`src/routes/report.tsx`):
- se `remaining === 1` → banner d'avviso ambra "questa è l'ultima generazione
  disponibile per questa licenza", mostrato **prima** che l'utente generi;
- badge permanente con i crediti residui (`999` fisso quando illimitato).

### Decremento — `decrementPdfExports({ licenseId })`

Chiamata **subito dopo** la generazione/download del PDF, da `handleGenerate()`
in `report.tsx`:

1. Legge `pdf_exports_remaining`, `is_active`.
2. `NULL` → illimitato, no-op.
3. Già `<= 0` → esaurito in precedenza (doppio click, retry): no-op idempotente,
   ritorna comunque `exhausted: true`.
4. Altrimenti decrementa di 1; **se il nuovo valore è `<= 0`, nello stesso
   UPDATE imposta anche `is_active = false`** (un solo round-trip).
5. Guardia ottimistica anti-race: `.eq('pdf_exports_remaining', valoreLetto)` —
   se un'altra richiesta ha già decrementato nel frattempo, questo update non
   tocca nulla invece di decrementare due volte.
6. **Fail-open**: qualsiasi eccezione tecnica non blocca nulla — il PDF è già
   stato scaricato prima di questa chiamata.

Se `exhausted: true`, la UI mostra il dialog bloccante
(`pdf-exports-exhausted-dialog.tsx`, non chiudibile con Escape/click fuori,
solo con "Ho capito") che invita a rinnovare o acquistare una nuova licenza.

**Origine del plafond:** `product_catalog.max_pdf_exports` viene copiato in
`licenses.pdf_exports_remaining` al momento della creazione della licenza
(Edge Function `license-generator-programma`, sezione 7) — cambiare il plafond
di un'offerta significa cambiare quella colonna nel catalogo, non toccare
codice applicativo.

---

## 6. Rivalidazione runtime della licenza e `/licenza-scaduta`

Il gate globale non controlla lo stato della licenza solo al claim iniziale:
lo rivalida **a ogni navigazione verso una pagina protetta**, tramite
`checkLicenseStatus` → `runLicenseStatus` (`src/lib/license-status.server.ts`).

`runLicenseStatus(licenseId)` legge `id, is_active, expires_at` e ritorna:
- `not_found` se la riga non esiste più;
- `deactivated` se `is_active === false` (**questo è il caso che chiude
  l'accesso dopo l'ultimo export PDF**, sezione 5);
- `expired` se `expires_at` è nel passato;
- altrimenti valido. **Fail-open** su errore tecnico di query/rete: non blocca.

In `AuthGate` (`src/routes/__root.tsx`), quando l'utente è già attivato e su
una pagina protetta, prima di renderizzare la pagina viene chiamato
`checkLicenseStatus`: se non valido, salva il motivo in
`LICENSE_INVALID_REASON_KEY`, pulisce le chiavi di licenza
(`clearLicenseKeys()`) e reindirizza a **`/licenza-scaduta`** (route pubblica,
aggiunta a `PUBLIC_PATHS` insieme a `/auth`).

### `/licenza-scaduta`

Mostra un messaggio diverso per ciascun motivo (`expired` / `deactivated` /
`not_found` / `generic`), tradotto in 4 lingue, con un bottone che riporta a
`/attivazione` (o `/auth` se anche l'email verificata è stata persa).

---

## 7. Edge Functions del sistema di licenze

Vivono nel progetto Supabase **esterno condiviso** (`ruopxyprezzxoirfrjrm`), a
monte del funnel applicativo: generano/rinnovano le righe che il funnel poi
consuma. Verificate `ACTIVE` via introspezione diretta il 25 ago 2026.

| Function | Ruolo | Family |
|---|---|---|
| `license-generator-programma` | Genera licenza + PUK da un acquisto (webhook Paddle, oggi in modalità test) per i **programmi/SaaS** (es. `002MnFAT`); gestisce `subscription_type` incluso `single_use` | programma |
| `license-generator-corso` | Come sopra ma per i **corsi**: richiede `course_id`, `subscription_type` sempre `null`, imposta anche una scadenza propria per ogni PUK (default 3 mesi) | corso |
| `license-renew-programma` | Rinnova una licenza (`monthly`/`annual`) estendendone `expires_at`; **rifiuta esplicitamente** il rinnovo di licenze `single_use` | programma |
| `test-license-generator` | Predecessore di `license-renew-programma`, senza guardia single-use — riferimento storico, non più necessario | legacy |
| `verify-license` | Verifica email+licenza+PUK generica, **non aggiornata** con `subscription_type`/`pdf_exports_remaining` — non va confusa con `verifyAndActivateLicense` lato app (sezione 3), più recente e completa | legacy |
| `paddle-test` | Endpoint di test per i webhook Paddle | infra |

`license-generator-programma`, in sintesi: legge `product_catalog` (per
`validity_days`, `app_code`, `max_pdf_exports`), crea `purchases` (oggi
`status: "test"`), crea `licenses` con `pdf_exports_remaining =
max_pdf_exports` e, se `subscription_type !== 'single_use'`, calcola subito
`expires_at`; altrimenti la lascia `NULL` (sezione 4). Recupera i `puk_codes`
generati dal trigger e invia un'unica email con licenza + PUK + link di
attivazione via Resend.

---

## 8. Testo delle condizioni d'uso (passaggio 3) — struttura e traduzioni

File: `src/lib/consent.functions.ts`, `src/components/terms-consent.tsx`,
`src/lib/terms-i18n.ts`, `src/routes/condizioni.tsx`.

`checkTermsConsent({ licenseId })` cerca una riga `license_id` +
`terms_version = TERMS_VERSION` in `license_consents`; fail-safe (`accepted:
false`) su errore. `recordTermsConsent({ licenseId, language })` rilegge
`app_code` server-side dalla licenza (non si fida del client), raccoglie
`user-agent`/IP dagli header della richiesta, e inserisce il consenso —
unique violation (`23505`) → `alreadyExisted: true`, non un errore.

`TERMS_VERSION` è il perno del versionamento: portandola a `"v2"` si forza una
nuova accettazione per tutti.

`src/lib/terms-i18n.ts` esporta `TERMS: Record<Lang, TermsContent>` con
`langLabel`, `pageTitle`, `stepLabel`, `intro`, `checkboxLabel`,
`acceptButton`/`acceptingButton`, `errorGeneric`, e `content` con `heading`,
`subheading` (interpola `{{APP_NAME}}`), 9 `sections` numerate identiche in
struttura nelle 4 lingue, `footer` di versione.

Le 9 sezioni: OGGETTO/SUBJECT/GEGENSTAND/OBJETO · LICENZA D'USO · MODALITÀ DI
ACQUISTO E FATTURAZIONE · USO CONSENTITO · DATI E PRIVACY · LIMITAZIONE DI
RESPONSABILITÀ · DURATA E RISOLUZIONE · MODIFICHE ALLE CONDIZIONI · LEGGE
APPLICABILE E FORO COMPETENTE.

Riferimenti invarianti in tutte le lingue: **Dott. Ing. Nichetti Gian
Battista**, **P.IVA IT01235350194**, sede in **Soresina (CR), Italia**, brand
**CorporateBoostService**, **Paddle.com Market Limited** come Merchant of
Record, pagina **/pagamenti-merchant-of-record**, **Regolamento (UE)
2016/679 (GDPR)**, **Foro di Cremona**.

> Il testo integrale delle 4 lingue è nel file sorgente `src/lib/terms-i18n.ts`
> (non duplicato qui per evitare che le due copie si disallineino: è già
> successo con `license.functions.ts` nel vecchio `AUTENTICAZIONE-MULTISEAT-README.md`).

---

## 9. Il gate globale — `AuthGate` in `src/routes/__root.tsx`

Wrappa `<Outlet />`, rieseguito a ogni cambio di `pathname`.

```ts
const PUBLIC_PATHS = new Set(["/auth", "/licenza-scaduta"]);
const ACTIVATION_PATH = "/attivazione";
const CONSENT_PATH = "/condizioni";
```

Sequenza (primo match vince):

1. Route pubblica → **consenti**.
2. `VERIFIED_EMAIL_KEY` assente → redirect `/auth`.
3. Su `/condizioni`: `LICENSE_ID_KEY` assente → pulisce `ACTIVATED_KEY`/`CONSENT_KEY`, redirect `/attivazione`; altrimenti **consenti**.
4. `LICENSE_ID_KEY` presente, `CONSENT_KEY` assente, non su `/attivazione` → redirect `/condizioni`.
5. `ACTIVATED_KEY` assente, non su `/attivazione` → redirect `/attivazione`.
6. Attivato e su pagina protetta → **rivalidazione runtime** (sezione 6): se non valida, `/licenza-scaduta`.
7. Altrimenti → **consenti**.

Bottone fisso "Esci" su tutte le pagine protette: rimuove tutte le chiavi
(`clearGateKeys()`) e torna a `/auth`.

---

## 10. Vincoli da verificare su nuovi progetti (lezioni imparate)

### 10.1 FK duplicato `puk_codes.user_id → auth.users`

Storicamente il progetto aveva un FK residuo verso `auth.users`. Poiché ogni
SaaS ha una propria `auth.users`, questo bloccava il claim con email non
registrate sul singolo progetto. **Deve rimanere solo il FK verso
`public.users`** (portfolio globale). Verifica:

```sql
SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
WHERE conrelid = 'public.puk_codes'::regclass AND contype = 'f';
```

### 10.2 `licenses.activated_at` deve esistere

Se la colonna manca, PostgREST restituisce 500 poco esplicito. Verificare
esplicitamente prima di deployare:
`ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS activated_at timestamptz;`

### 10.3 `license_key` non è UNIQUE

Inserire due righe con la stessa `license_key` non fallisce a livello DB, ma
`verifyAndActivateLicense` fa `.limit(1).maybeSingle()` prendendo una riga
arbitraria. Pulire i duplicati manualmente prima dei test.

---

## 11. Checklist di replica su un nuovo programma

1. **Schema esterno (portfolio) — già presente, non ricreare.** Verifica solo
   che tabelle/trigger della sezione 1 esistano già sul progetto condiviso.
2. **Verifica i vincoli critici** della sezione 10.
3. Copia i file applicativi: `app-config.ts`, `otp.functions.ts`,
   `license.functions.ts`, `license-status.server.ts`, `consent.functions.ts`,
   `terms-i18n.ts`, `terms-consent.tsx`, `pdf-exports-exhausted-dialog.tsx`
   (se il prodotto ha un plafond export), le route `auth.tsx`,
   `attivazione.tsx`, `condizioni.tsx`, `licenza-scaduta.tsx`, e il blocco
   `AuthGate` in `__root.tsx`.
4. In `app-config.ts`: cambia `APP_CODE`, `APP_NAME`, `TERMS_VERSION`, e **il
   prefisso di tutte e 6 le chiavi localStorage**.
5. Crea nel DB Cloud `lead_emails` e `license_consents` (con GRANT/RLS).
6. Imposta i secret: `EXTERNAL_SUPABASE_URL`, `EXTERNAL_SUPABASE_SERVICE_ROLE_KEY`,
   `RESEND_API_KEY`, `LOVABLE_API_KEY`.
7. Nel DB esterno: inserisci le `licenses` col nuovo `app_code` (o usa
   `license-generator-programma`/`-corso`, sezione 7). Per il single-use:
   `subscription_type = 'single_use'`, `expires_at = NULL`; assicurati che
   `product_catalog` abbia `validity_days` e `max_pdf_exports` coerenti.
8. Aggiorna testi/mittente email e `head()` delle route col nome del nuovo prodotto.
9. **Non introdurre scorciatoie di bypass** in `auth.tsx`: il funnel deve
   restare l'unica via d'accesso.
10. Test end-to-end minimi:
    - attivazione nuova, riattivazione stesso utente, PUK già claimato,
      PUK/licenza inesistenti, PUK non in licenza, PUK di altra app, licenza
      scaduta, email non verificata (9 scenari classici del passaggio 2);
    - se il prodotto ha plafond export: ultimo credito → banner, credito a
      zero → dialog bloccante e `is_active = false`, poi verifica che la
      **rivalidazione runtime** (sezione 6) reindirizzi a `/licenza-scaduta`
      alla navigazione successiva;
    - se il prodotto ha `single_use`: `expires_at` scritto solo al primo
      claim, tentativo di rinnovo rifiutato dall'Edge Function.

---

## 12. Riepilogo codici di errore (passaggio 2)

| Codice | Significato |
|---|---|
| E-010 | Invio email OTP fallito |
| E-011 | Rate limit: 3 codici OTP in 24 ore |
| E-012 | Codice OTP errato o scaduto (>10 min) |
| E-013 | Salvataggio della verifica OTP non confermato in DB |
| E-001 | Email non verificata |
| E-101 | Licenza inesistente/non attiva per questo `app_code` |
| E-103 | Licenza scaduta |
| E-201 | PUK inesistente |
| E-202 | PUK già reclamato da un altro utente (anche in race) |
| E-203 | PUK di un altro prodotto |
| E-204 | PUK non associato alla licenza |
| E-500 | Errore server imprevisto |
| E-301 | Insert del consenso (passaggio 3) fallito |
| E-302 | Licenza non trovata in fase di consenso |
