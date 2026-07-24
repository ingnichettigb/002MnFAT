# Autenticazione & Attivazione Licenza Multi-Seat — Documentazione Tecnica

> Progetto di riferimento: **002MnFAT** (Mini F.A.T.)
> Target di replica: **001SmMntnnc**, poi **02-GDPR-00** (con adattamenti)
> Stato: sistema in produzione, testato end-to-end.

---

## 1. Panoramica

Un acquirente compra **1 licenza** che dà diritto a **N posti (seats)**. Ogni utilizzatore finale
attiva il proprio accesso in modo indipendente usando **la propria email verificata via OTP** più
un **codice PUK personale** ricevuto insieme alla licenza. L'email dell'utilizzatore **non deve
coincidere** con quella dell'acquirente: il legame utente ↔ posto viene creato al primo utilizzo
del PUK (self-claim atomico) e successive riattivazioni dallo stesso utente sono permesse.

---

## 2. Schema database

Il sistema usa **due progetti Supabase distinti**:

- **Cloud (interno alla SaaS)** — tabelle `lead_emails`, `license_consents` (OTP + consensi).
- **External (portfolio, condiviso tra tutte le SaaS)** — tabelle `licenses`, `puk_codes`,
  `license_puk_map`, `users` (licenze e utenti globali del portfolio).

### 2.1 `public.licenses` (external)

| Colonna         | Tipo          | Vincoli / Note                                    | Ruolo |
|-----------------|---------------|---------------------------------------------------|-------|
| `id`            | uuid          | PK, default `gen_random_uuid()`                   | identificatore licenza |
| `license_key`   | text          | NOT NULL — **NO UNIQUE constraint** (vedi §4)     | chiave leggibile mostrata all'utente |
| `user_email`    | text          | NOT NULL — email dell'**acquirente** (non filtro) | audit / contatto |
| `app_code`      | text          | NOT NULL                                          | prodotto associato (es. `002MnFAT`) |
| `seats`         | integer       | NOT NULL, default 1                               | numero di posti / utilizzatori |
| `is_active`     | boolean       | NOT NULL, default true                            | disabilitazione manuale |
| `expires_at`    | timestamptz   | nullable                                          | scadenza opzionale |
| `activated_at`  | timestamptz   | nullable — **DEVE esistere** (vedi §4)            | data primo claim su licenza |
| `created_at`    | timestamptz   | NOT NULL, default `now()`                         | |

### 2.2 `public.puk_codes` (external)

| Colonna              | Tipo        | Vincoli / Note                                          | Ruolo |
|----------------------|-------------|---------------------------------------------------------|-------|
| `id`                 | uuid        | PK                                                      | |
| `code`               | text        | NOT NULL, UNIQUE                                        | codice PUK personale |
| `license_id`         | uuid        | FK → `licenses(id)` (legacy diretto, ancora supportato) | link a licenza |
| `user_id`            | uuid        | FK → **`public.users(id)`** (vedi §4), nullable         | proprietario dopo claim |
| `type_product_code`  | text        | nullable                                                | filtro prodotto (es. `002MnFAT`) |
| `used`               | boolean     | NOT NULL, default false                                 | flag di utilizzo |
| `used_at`            | timestamptz | nullable                                                | timestamp claim |
| `created_at`         | timestamptz | NOT NULL, default `now()`                               | |

### 2.3 `public.license_puk_map` (external)

Tabella di legame **N:N** licenza ↔ PUK (modo canonico, sostituisce il FK diretto legacy).

| Colonna       | Tipo | Vincoli                          |
|---------------|------|----------------------------------|
| `id`          | uuid | PK                               |
| `license_id`  | uuid | FK → `licenses(id)`, NOT NULL    |
| `puk_id`      | uuid | FK → `puk_codes(id)`, NOT NULL   |

> ⚠️ **Attenzione:** non esiste attualmente un vincolo UNIQUE su questa coppia di colonne.
> Nulla impedisce di creare righe duplicate `(license_id, puk_id)` per errore applicativo o retry.
> Valutare l'aggiunta di:
> ```sql
> ALTER TABLE license_puk_map ADD CONSTRAINT uq_license_puk UNIQUE (license_id, puk_id);
> ```


### 2.4 `public.users` (external — portfolio globale)

| Colonna     | Tipo        | Vincoli                          | Ruolo |
|-------------|-------------|----------------------------------|-------|
| `id`        | uuid        | PK, default `gen_random_uuid()`  | id utente portfolio |
| `email`     | text        | NOT NULL, UNIQUE (case-insensitive)| email utilizzatore |
| `created_at`| timestamptz | default `now()`                  | |

**Nota:** `puk_codes.user_id` deve puntare a `public.users(id)`, **non** a `auth.users`.

### 2.5 `public.lead_emails` (Cloud — per SaaS)

Gestisce OTP di verifica email. Colonne principali: `email`, `verification_code`,
`is_verified`, `verified_at`, `otp_attempts`, `otp_window_start`, `source`.

### 2.6 `public.license_consents` (Cloud — per SaaS)

Traccia l'accettazione delle Condizioni d'Uso (versione + timestamp + email).

---

## 3. Trigger e funzioni database (external Supabase)

Le funzioni seguenti sono installate **una sola volta** sul progetto external condiviso da tutte
le SaaS del portfolio. Non vanno ricreate quando si aggiunge una nuova SaaS.

### 3.1 `generate_puk_code()`

Genera un codice PUK alfanumerico casuale univoco.

```sql
CREATE OR REPLACE FUNCTION public.generate_puk_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
  exists_already boolean;
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
END;
$$;
```

### 3.2 `trigger_generate_puk_codes()`

Alla `INSERT` di una nuova licenza, crea automaticamente `seats` righe in `puk_codes` e le
collega in `license_puk_map`. Copia `app_code` in `type_product_code`.

```sql
CREATE OR REPLACE FUNCTION public.trigger_generate_puk_codes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  i int;
  new_puk_id uuid;
  new_code text;
BEGIN
  FOR i IN 1..COALESCE(NEW.seats, 1) LOOP
    new_code := public.generate_puk_code();
    INSERT INTO public.puk_codes (code, license_id, type_product_code)
    VALUES (new_code, NEW.id, NEW.app_code)
    RETURNING id INTO new_puk_id;

    INSERT INTO public.license_puk_map (license_id, puk_id)
    VALUES (NEW.id, new_puk_id);
  END LOOP;
  RETURN NEW;
END;
$$;
```

### 3.3 Trigger `trg_generate_puk_codes`

```sql
CREATE TRIGGER trg_generate_puk_codes
AFTER INSERT ON public.licenses
FOR EACH ROW
EXECUTE FUNCTION public.trigger_generate_puk_codes();
```

**Effetto pratico:** creare una `licenses` con `seats = 5` produce automaticamente 5 PUK
distribuibili ai 5 utilizzatori finali.

> ⚠️ Se il codice SQL sopra differisce da quello effettivamente installato, verificare via
> `pg_get_functiondef` prima di replicare su altri ambienti.

---

## 4. Vincoli da verificare su nuovi progetti (lezioni imparate)

### 4.1 FK duplicato `puk_codes.user_id → auth.users`

Storicamente il progetto aveva un FK residuo che puntava `puk_codes.user_id` a `auth.users`.
Poiché ogni SaaS ha una propria `auth.users`, questo bloccava il claim con email non registrate
sul singolo progetto. **Deve rimanere solo il FK verso `public.users`** (portfolio globale).

Verifica:
```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.puk_codes'::regclass AND contype = 'f';
```
Se compare un FK verso `auth.users`, rimuoverlo con `ALTER TABLE ... DROP CONSTRAINT`.

### 4.2 `licenses.activated_at` deve esistere

La server function fa `select activated_at` e successivamente `UPDATE ... SET activated_at`.
Se la colonna manca, PostgREST restituisce 500 in modo poco esplicito. **Verificare
esplicitamente** che la colonna esista prima di deployare:

```sql
ALTER TABLE public.licenses
  ADD COLUMN IF NOT EXISTS activated_at timestamptz;
```

### 4.3 `license_key` non è UNIQUE

Nella schema di produzione **non c'è** vincolo `UNIQUE` su `licenses.license_key`. Attenzione in
fase di test: inserire due righe con stessa `license_key` non fallisce, ma la server function
farebbe `.limit(1).maybeSingle()` prendendo una riga arbitraria. Pulire i duplicati manualmente
prima dei test.

---

## 5. Logica applicativa — `src/lib/license.functions.ts`

Server function TanStack (`createServerFn`) che esegue la verifica end-to-end. Legge da Cloud
(`lead_emails`) e da External (`licenses`, `puk_codes`, `license_puk_map`, `users`).

```typescript
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { APP_CODE } from "@/lib/app-config";

const emailSchema = z.string().trim().toLowerCase().email().max(254);
const keySchema = z.string().trim().min(1).max(128);

type FailReason =
  | "email_not_verified"
  | "license_not_found"
  | "license_expired"
  | "puk_not_found"
  | "puk_wrong_product"
  | "puk_not_in_license"
  | "puk_claimed_by_other"
  | "server_error";

type ActivateResult =
  | { ok: true; reactivated: boolean; licenseId: string; pukId: string; userId: string }
  | { ok: false; reason: FailReason; code: string };

export const verifyAndActivateLicense = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; licenseKey: string; puk: string }) =>
    z.object({ email: emailSchema, licenseKey: keySchema, puk: keySchema }).parse(input),
  )
  .handler(async ({ data }): Promise<ActivateResult> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { supabaseExternal } = await import("@/integrations/supabase/client.external");
      const ext = supabaseExternal as unknown as { from: (t: string) => any };
      const { email, licenseKey, puk } = data;

      // STEP 1 — email deve risultare verificata su Cloud (OTP completato)
      const { data: verified, error: vErr } = await supabaseAdmin
        .from("lead_emails")
        .select("id")
        .ilike("email", email)
        .eq("is_verified", true)
        .limit(1)
        .maybeSingle();
      if (vErr) throw new Error(vErr.message);
      if (!verified) return { ok: false, reason: "email_not_verified", code: "E-001" };

      // STEP 2 — cerca la licenza per (license_key + app_code) senza filtrare per email
      //          (self-claim: l'email dell'utilizzatore ≠ acquirente).
      const { data: license, error: lErr } = await ext
        .from("licenses")
        .select("id, is_active, expires_at, activated_at")
        .eq("license_key", licenseKey)
        .eq("app_code", APP_CODE)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();
      if (lErr) throw new Error(lErr.message);
      if (!license) return { ok: false, reason: "license_not_found", code: "E-101" };
      if (license.expires_at && new Date(license.expires_at as string).getTime() <= Date.now()) {
        return { ok: false, reason: "license_expired", code: "E-103" };
      }

      // STEP 3 — cerca il PUK per codice e verifica il prodotto
      const { data: pukRow, error: pErr } = await ext
        .from("puk_codes")
        .select("id, used, user_id, type_product_code, license_id")
        .eq("code", puk)
        .limit(1)
        .maybeSingle();
      if (pErr) throw new Error(pErr.message);
      if (!pukRow) return { ok: false, reason: "puk_not_found", code: "E-201" };
      if (pukRow.type_product_code && pukRow.type_product_code !== APP_CODE) {
        return { ok: false, reason: "puk_wrong_product", code: "E-203" };
      }

      // STEP 4 — verifica che il PUK appartenga alla licenza,
      //          via license_puk_map (canonico) o via FK diretto (legacy).
      const { data: mapRow, error: mErr } = await ext
        .from("license_puk_map")
        .select("id")
        .eq("license_id", license.id)
        .eq("puk_id", pukRow.id)
        .limit(1)
        .maybeSingle();
      if (mErr) throw new Error(mErr.message);
      const linkedByMap = !!mapRow;
      const linkedByFk = pukRow.license_id === license.id;
      if (!linkedByMap && !linkedByFk) {
        return { ok: false, reason: "puk_not_in_license", code: "E-204" };
      }

      // STEP 5 — risolvi/crea l'utente nel portfolio globale (public.users)
      const { data: existingUser, error: uErr } = await ext
        .from("users")
        .select("id, email")
        .ilike("email", email)
        .limit(1)
        .maybeSingle();
      if (uErr) throw new Error(uErr.message);

      let userId: string;
      if (existingUser) {
        userId = existingUser.id as string;
      } else {
        const { data: insUser, error: insErr } = await ext
          .from("users").insert({ email }).select("id").single();
        if (insErr) throw new Error(insErr.message);
        userId = insUser.id as string;
      }

      // STEP 6 — claim atomico del PUK
      //   - se il PUK è già di un altro utente → errore
      //   - se è dello stesso utente → riattivazione permessa
      //   - se è NULL → UPDATE con guard "WHERE user_id IS NULL" per evitare race
      if (pukRow.user_id && pukRow.user_id !== userId) {
        return { ok: false, reason: "puk_claimed_by_other", code: "E-202" };
      }

      let reactivated = false;
      if (pukRow.user_id === userId) {
        reactivated = true;
      } else {
        const { data: claimed, error: claimErr } = await ext
          .from("puk_codes")
          .update({ user_id: userId, used: true, used_at: new Date().toISOString() })
          .eq("id", pukRow.id)
          .is("user_id", null)
          .select("id")
          .maybeSingle();
        if (claimErr) throw new Error(claimErr.message);
        if (!claimed) return { ok: false, reason: "puk_claimed_by_other", code: "E-202" };
      }

      // STEP 7 — marca activated_at sulla licenza al primo claim (guard IS NULL)
      if (!license.activated_at) {
        const { error: actErr } = await ext
          .from("licenses")
          .update({ activated_at: new Date().toISOString() })
          .eq("id", license.id)
          .is("activated_at", null);
        if (actErr) throw new Error(actErr.message);
      }

      return {
        ok: true,
        reactivated,
        licenseId: license.id as string,
        pukId: pukRow.id as string,
        userId,
      };
    } catch (err) {
      console.error("verifyAndActivateLicense error:", err);
      return { ok: false, reason: "server_error", code: "E-500" };
    }
  });
```

---

## 6. Codici errore

| Codice | Reason interno         | Condizione che lo scatena                                              | Messaggio utente (sintesi) |
|--------|------------------------|------------------------------------------------------------------------|----------------------------|
| E-001  | `email_not_verified`   | L'email non ha un record `is_verified=true` in `lead_emails`.          | "La tua email non risulta ancora verificata. Torna al passaggio precedente." |
| E-101  | `license_not_found`    | Nessuna `licenses` con `(license_key, app_code, is_active=true)`.      | "Il codice licenza inserito non è valido." |
| E-103  | `license_expired`      | `licenses.expires_at` presente e ≤ `now()`.                            | "Questa licenza risulta scaduta." |
| E-201  | `puk_not_found`        | Nessuna `puk_codes.code` corrispondente.                               | "Il codice PUK inserito non è valido." |
| E-202  | `puk_claimed_by_other` | `puk_codes.user_id` valorizzato con id ≠ utente corrente (o race sul claim). | "Questo PUK è già stato attivato da un altro utente." |
| E-203  | `puk_wrong_product`    | `puk_codes.type_product_code` presente e ≠ `APP_CODE`.                 | "Questo PUK non è valido per questa applicazione." |
| E-204  | `puk_not_in_license`   | PUK non collegato alla licenza (né via `license_puk_map` né via FK).   | "Questo PUK non risulta associato alla licenza inserita." |
| E-500  | `server_error`         | Eccezione runtime (rete, permessi, schema mancante, ecc.).             | "Errore tecnico imprevisto. Riprova tra qualche minuto." |

Il codice tecnico è mostrato in piccolo sotto il messaggio descrittivo.

---

## 7. UI di attivazione e gating globale

**File route attivazione:** `src/routes/attivazione.tsx` (route `/attivazione`, step 2/3).

**File gating:** `src/routes/__root.tsx` (layout root, double underscore).

### 7.1 Costanti localStorage (namespaced per app)

In `src/routes/_root.tsx` le chiavi di stato sono definite con prefisso uguale a `APP_CODE`
(`002MnFAT`):

```typescript
export const VERIFIED_EMAIL_KEY = "002MnFAT:verifiedEmail";
export const ACTIVATED_KEY      = "002MnFAT:activated";
export const LICENSE_ID_KEY     = "002MnFAT:licenseId";
export const CONSENT_KEY        = "002MnFAT:consent";
```

### 7.2 AuthGate — sequenza di accesso

Il componente `AuthGate` in `src/routes/_root.tsx` avvolge `<Outlet />` e decide se l'utente
può rimanere sulla route corrente. Logica di redirect:

1. **Email non verificata** (`VERIFIED_EMAIL_KEY` assente) → redirect a `/auth`.
2. **Email verificata ma nessuna licenza attivata** (`LICENSE_ID_KEY` assente) → redirect a
   `/attivazione`.
3. **Licenza attivata ma consenso Terms mancante** (`CONSENT_KEY` assente, route non è
   `/condizioni`) → redirect a `/condizioni`.
4. **Tutto presente** → accesso consentito alla route richiesta.

Eccezioni: le route pubbliche (es. `/auth`) e la route `/condizioni` hanno gestioni
specifiche per evitare loop di redirect.

### 7.3 Campi e flusso di `attivazione.tsx`

**Campi:**
- Email verificata (readonly, letta da `localStorage` chiave `VERIFIED_EMAIL_KEY`).
- Codice licenza (input testo).
- Codice PUK (input testo).

**Flusso:**
1. All'apertura, se non c'è email verificata in localStorage → redirect a `/auth`.
2. Al submit chiama `verifyAndActivateLicense({ email, licenseKey, puk })`.
3. Su `ok: true` salva `LICENSE_ID_KEY`, pulisce flag `ACTIVATED_KEY` e `CONSENT_KEY`, e
   naviga a `/condizioni` (step 2.5, accettazione Terms).
4. Su `ok: false` mappa `reason` → oggetto `{ message, code }` tramite `REASON_MESSAGES` e
   mostra:
   - messaggio descrittivo (destructive, `text-sm`),
   - codice tecnico in piccolo sotto (`text-xs text-muted-foreground`).
5. Su `reason === "email_not_verified"` forza redirect a `/auth`.

Bottone secondario "Cambia email" pulisce `VERIFIED_EMAIL_KEY` e riporta a `/auth`.

### 7.4 Logout / "Esci"

In `src/routes/_root.tsx` è presente un pulsante fisso "Esci" (visibile su tutte le route
protette) che rimuove tutte e 4 le chiavi localStorage e riporta l'utente a `/auth`:

```typescript
window.localStorage.removeItem(VERIFIED_EMAIL_KEY);
window.localStorage.removeItem(ACTIVATED_KEY);
window.localStorage.removeItem(LICENSE_ID_KEY);
window.localStorage.removeItem(CONSENT_KEY);
navigate({ to: "/auth", replace: true });
```


---

## 8. Checklist di replica su nuovo progetto

Ordine operativo per portare il sistema su un'altra SaaS del portfolio (es. `001SmMntnnc`):

1. **Schema external (portfolio) — GIÀ PRESENTE, non ricreare.**
   Le tabelle `licenses`, `puk_codes`, `license_puk_map`, `users` e i trigger/funzioni della
   §3 sono globali sul progetto external condiviso. Verifica solo che esistano:
   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname='public'
     AND tablename IN ('licenses','puk_codes','license_puk_map','users');
   SELECT proname FROM pg_proc WHERE proname IN ('generate_puk_code','trigger_generate_puk_codes');
   SELECT tgname FROM pg_trigger WHERE tgname='trg_generate_puk_codes';
   ```

2. **Verifica vincoli critici (§4).**
   - FK di `puk_codes.user_id` punta a `public.users`, **non** a `auth.users`.
   - Colonna `licenses.activated_at` esiste.
   - Nessun duplicato su `licenses.license_key` per la nuova SaaS.

3. **Schema Cloud (per-SaaS) — da creare.**
   Su ogni nuovo progetto Cloud crea:
   - `public.lead_emails` (OTP: `email`, `verification_code`, `is_verified`, `verified_at`,
     `otp_attempts`, `otp_window_start`, `source`).
   - `public.license_consents` (accettazione Terms: `email`, `version`, `accepted_at`).
   Ricordati GRANT + RLS come da linee guida.

4. **Secrets — aggiungi al progetto:**
   - `EXTERNAL_SUPABASE_URL`
   - `EXTERNAL_SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY` (connector)
   - `LOVABLE_API_KEY` (se serve AI)

5. **Copia file applicativi:**
   - `src/integrations/supabase/client.external.ts` — invariato.
   - `src/lib/app-config.ts` — cambia `APP_CODE`, `APP_NAME`, `TERMS_VERSION`.
   - `src/lib/license.functions.ts` — invariato (usa `APP_CODE` da `app-config`).
   - `src/lib/otp.functions.ts` — invariato (rate-limit 3/24h).
   - `src/lib/consent.functions.ts` — invariato.
   - `src/lib/terms-i18n.ts` — riscrivi il testo Terms per la nuova SaaS.
   - `src/routes/auth.tsx`, `src/routes/attivazione.tsx`, `src/routes/condizioni.tsx` —
     invariati salvo le stringhe di titolo.
   - `src/routes/_root.tsx` — copia l'`AuthGate` e le costanti di localStorage
     (`VERIFIED_EMAIL_KEY`, `LICENSE_ID_KEY`, `ACTIVATED_KEY`, `CONSENT_KEY`).
   - `src/start.ts` — includi `attachSupabaseAuth` nel `functionMiddleware`.

5bis. **NAMESPACING LOCALSTORAGE (fondamentale, non dimenticare)**

   Nel nuovo file `_root.tsx`, cambia il prefisso di TUTTE le 4 costanti localStorage da
   `002MnFAT:` al nuovo `APP_CODE` del progetto (es. `001SmMntnnc:verifiedEmail`,
   `001SmMntnnc:activated`, `001SmMntnnc:licenseId`, `001SmMntnnc:consent`). Se questo
   passaggio viene dimenticato, e in futuro un utente usa più SaaS del portfolio sullo stesso
   dominio/browser, le chiavi di sessione andrebbero in conflitto tra un'app e l'altra.

6. **Registrazione middleware bearer** (se il progetto usa server functions autenticate):
   verifica che `src/start.ts` monti `attachSupabaseAuth`.


7. **Test end-to-end — 9 scenari minimi:**
   1. **Attivazione nuova**: email verificata + licenza valida + PUK libero → `ok: true, reactivated: false`, `puk_codes.user_id` popolato, `licenses.activated_at` valorizzato.
   2. **Riattivazione stesso utente**: stessa email ripresenta lo stesso PUK → `ok: true, reactivated: true`.
   3. **PUK già claimato da altri**: PUK con `user_id` di utente diverso → `E-202`.
   4. **PUK inesistente**: codice PUK inventato → `E-201`.
   5. **Licenza inesistente**: `license_key` inventata → `E-101`.
   6. **PUK non appartenente alla licenza**: licenza + PUK validi ma non collegati → `E-204`.
   7. **PUK di altra app**: `type_product_code` ≠ `APP_CODE` corrente → `E-203`.
   8. **Licenza scaduta**: `expires_at` nel passato → `E-103`.
   9. **Email non verificata**: bypass di `/auth` con localStorage manomesso → `E-001` e redirect.

8. **Publish** e verifica funzionamento su URL stabile
   `project--<project-id>.lovable.app`.

---

*Ultimo aggiornamento: allineato al codice presente in `src/lib/license.functions.ts` alla data
di creazione del documento.*
