Ecco il prompt da copiare/incollare nel progetto `012PedFlow`. Riproduce esattamente il flusso a 2 step (verifica email via OTP + attivazione licenza) usando lo stesso schema DB già presente sul progetto Supabase esterno `ruopxyprezzxoirfrjrm`.

---

## PROMPT DA INCOLLARE IN 012PedFlow

> Voglio implementare in questo progetto lo stesso flusso di gating a 2 step che ho già in un altro progetto Lovable. Deve funzionare esattamente uguale, cambia solo il codice app.
>
> ### Config app
> - Crea `src/lib/app-config.ts` con `export const APP_CODE = "012PedFlow";`
> - Tutte le query su `licenses` devono filtrare per `app_code = APP_CODE`.
>
> ### Backend / Secrets
> Ho già i secrets pronti in Lovable Cloud (non chiedermeli di nuovo, esistono):
> - `LOVABLE_API_KEY`, `RESEND_API_KEY` → per invio email OTP via connector Resend
> - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` → progetto Cloud di *questo* app, usato SOLO per la tabella `lead_emails` (OTP)
> - `EXTERNAL_SUPABASE_URL`, `EXTERNAL_SUPABASE_SERVICE_ROLE_KEY` → progetto Supabase esterno `ruopxyprezzxoirfrjrm` dove risiedono `licenses` e `puk_codes` (condivise fra tutte le mie app; distinte per `app_code`)
>
> Se `EXTERNAL_SUPABASE_URL` / `EXTERNAL_SUPABASE_SERVICE_ROLE_KEY` non risultano ancora settati in questo progetto, chiedimeli via `add_secret` — NON generarli, NON riusare i secrets del Cloud interno.
>
> ### Schema DB
> Tabella `lead_emails` va creata in QUESTO progetto Cloud (via migration, con GRANT + RLS abilitata, nessuna policy pubblica — accesso solo service role). Colonne:
> `id uuid pk default gen_random_uuid()`, `email text not null`, `verification_code text`, `is_verified boolean not null default false`, `verified_at timestamptz`, `otp_attempts int not null default 0`, `otp_window_start timestamptz`, `source text`, `created_at timestamptz not null default now()`.
>
> Le tabelle `licenses` e `puk_codes` esistono già nel progetto esterno `ruopxyprezzxoirfrjrm` — NON crearle qui.
>
> ### Client Supabase secondario
> Crea `src/integrations/supabase/client.external.ts` che istanzia un client service-role verso `EXTERNAL_SUPABASE_URL` / `EXTERNAL_SUPABASE_SERVICE_ROLE_KEY` (Proxy lazy, no persistSession). Server-only, import dinamico dentro gli handler.
>
> ### Server functions (TanStack `createServerFn`)
> - `src/lib/otp.functions.ts` → `requestOtp({ email })` e `verifyOtp({ email, code })`. Usa `supabaseAdmin` (Cloud interno) sulla tabella `lead_emails`. OTP 6 cifre, TTL 10 min, rate-limit 3 richieste / 24h per email. Invio email via connector Resend con `from: "012PedFlow <team@corporateboostservice.eu>"`.
> - `src/lib/license.functions.ts` → `verifyAndActivateLicense({ email, licenseKey, puk })`. Usa `supabaseAdmin` solo per verificare che `lead_emails.is_verified = true`, poi `supabaseExternal` per: cercare licenza per `license_key + app_code = "012PedFlow" + is_active`, controllare `user_email` (mismatch → E-102), `expires_at` (scaduta → E-103), cercare `puk_codes` (non trovato → E-201, già usato → E-202 salvo caso riattivazione già `activated_at`), quindi settare `activated_at` e marcare PUK `used=true, used_at=now()`. Codici errore: E-001, E-101…E-103, E-201…E-202, E-500.
>
> ### Route UI
> - `/auth` → form 2-step: (1) inserisci email → chiama `requestOtp` → (2) inserisci codice 6 cifre → chiama `verifyOtp`. Al successo salva l'email verificata in `localStorage[VERIFIED_EMAIL_KEY]` e naviga a `/attivazione`.
> - `/attivazione` → form con email verificata (readonly) + `Codice licenza` + `Codice PUK`. Header: `CardTitle="Attivazione licenza — 012PedFlow"`, `CardDescription` che inizia con `"Passaggio 2 di 2 — …"`. Al successo salva `localStorage[ACTIVATED_KEY]="1"` e naviga a `/`. Messaggi errore user-friendly in italiano mappati sui codici sopra. Link "Cambia email" che pulisce `VERIFIED_EMAIL_KEY` e torna a `/auth`.
> - In `src/routes/__root.tsx` esporta `VERIFIED_EMAIL_KEY = "verified_email:012PedFlow"` e `ACTIVATED_KEY = "activated:012PedFlow"`, e monta una guard che redirige a `/auth` se manca l'email verificata e a `/attivazione` se manca l'attivazione (esclusi `/auth` e `/attivazione`).
>
> ### Middleware / auth bearer
> Non serve `requireSupabaseAuth`: tutte le server fn sono pubbliche ma protette dalla logica (email non verificata → E-001, ecc.). Non aggiungere `attachSupabaseAuth` a `src/start.ts` se non c'è già altro che lo richiede.
>
> ### Test finale
> Dopo lo scaffolding, verifica con una `supabase--read_query` sul progetto esterno che una licenza test con `app_code = "012PedFlow"` sia leggibile via `supabaseExternal` (bypass RLS). Se non esiste ancora nessuna licenza per `012PedFlow`, dimmelo così la creo io lato progetto master.

---

Confermi? Se ok, esco da plan mode e non tocco niente qui — il prompt sopra è solo da copiare nell'altro progetto.