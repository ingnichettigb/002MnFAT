## Flusso di ingresso 002MnFAT in 3 passaggi

Implementare il flusso completo di accesso (email OTP con rate limit → licenza+PUK → attivazione), sostituendo l'attuale bypass a `/fase2`.

### 1. Costante APP_CODE

**Nuovo `src/lib/app-config.ts`** — Esporta `export const APP_CODE = "002MnFAT";`. Sostituire ogni uso letterale (attualmente in `src/lib/otp.functions.ts` come `SOURCE`) con l'import di `APP_CODE`.

### 2. Schema database (migration)

Estendere `lead_emails` con:
- `otp_attempts int not null default 0`
- `otp_window_start timestamptz`

Nuove tabelle:

**`licenses`**
- `id uuid pk`
- `license_key text unique not null`
- `user_email text not null` (case-insensitive match)
- `app_code text not null`
- `is_active boolean not null default true`
- `expires_at timestamptz null`
- `activated_at timestamptz null`
- `created_at timestamptz default now()`

**`puk_codes`**
- `id uuid pk`
- `license_id uuid fk → licenses(id) on delete cascade`
- `code text not null`
- `used boolean not null default false`
- `used_at timestamptz null`
- `created_at timestamptz default now()`
- unique `(license_id, code)`

RLS: entrambe le tabelle abilitano RLS ma **nessuna policy** per anon/authenticated — l'accesso avviene solo lato server tramite `supabaseAdmin` (le server function). GRANT solo a `service_role`. `lead_emails` mantiene lo schema attuale.

### 3. Server functions (`src/lib/otp.functions.ts` + nuovo `src/lib/license.functions.ts`)

**`requestOtp`** — modificato:
1. Legge riga `lead_emails` per email (case-insensitive), prende la più recente.
2. Se `otp_window_start` è null o più vecchia di 24h → reset `otp_attempts=0`, `otp_window_start=now()`.
3. Se `otp_attempts >= 3` e finestra attiva → ritorna `{ rateLimited: true }` senza inviare.
4. Altrimenti: genera codice, invia email, upsert su una riga "corrente" per quell'email che tiene: `verification_code`, `otp_attempts+1`, `otp_window_start`, `is_verified=false`.
   - Per semplicità: mantenere una sola riga di lavoro per email (upsert su email) invece di crearne una nuova ad ogni invio. Le righe già `is_verified=true` restano intatte come archivio.

**`verifyOtp`** — invariato nella logica di verifica; su successo imposta `is_verified=true`, `verified_at=now()`.

**Nuovo `verifyLicense(email, licenseKey, puk)`** — esegue la SELECT indicata nel brief (join `licenses`+`puk_codes`, filtri: `app_code=APP_CODE`, `is_active=true`, `used=false`, email match case-insensitive con `lead_emails.is_verified=true`). Ritorna `{ ok: true, alreadyActivated: boolean, licenseId, pukId }` oppure `{ ok: false }`. Controlla anche `expires_at > now()` se non null. **Non modifica nulla.**

**Nuovo `activateLicense(licenseId, pukId)`** — solo se chiamata dopo `verifyLicense.ok`:
- Se `activated_at IS NULL` → UPDATE `activated_at=now()`.
- UPDATE `puk_codes SET used=true, used_at=now() WHERE id=$pukId AND used=false`.
- Se il PUK risulta già `used=true` prima dell'update, ritorna errore (race).

### 4. UI

**`src/routes/auth.tsx`** — rimuove il bypass dev `xxx@xxx / XXX` e il codice fisso `123456`. Diventa a due stage:
- Stage `email` → input solo email + bottone "Invia codice".
- Stage `otp` → input codice 6 cifre + reinvia + cambia email.
Su OTP verificato con successo → naviga a `/attivazione` (nuova route) portando l'email verificata (localStorage `VERIFIED_EMAIL_KEY` come già fa).
Gestisce il caso `rateLimited` mostrando il messaggio esatto richiesto dal brief.

**Nuova route `src/routes/attivazione.tsx`** — sostituisce di fatto il ruolo dell'attuale `/fase2` come passaggio 2:
- Legge email verificata da `localStorage` (se assente → redirect a `/auth`).
- Form con due campi: `license_key` e `puk` + bottone "Attiva".
- Chiama `verifyLicense`. Se ok → chiama `activateLicense` → salva flag `002MnFAT:activated=true` (+ license_key) in localStorage → naviga a `/` (app).
- Errori mostrano il messaggio del brief.

**`src/routes/__root.tsx` — `AuthGate`**:
- `PUBLIC_PATHS` = `{"/auth"}`.
- Regola nuova: se `verifiedEmail` presente ma `activated` assente e path non è `/attivazione` né `/auth` → redirect a `/attivazione`.
- Se entrambi presenti → accesso libero all'app.
- Bottone "Esci" pulisce entrambe le chiavi.

**`src/routes/fase2.tsx`** — eliminato (non più parte del flusso). Le eventuali navigazioni residue vengono aggiornate.

### Note tecniche

- Nessun cambiamento alla generazione PDF o ad altre feature.
- Le server function usano `supabaseAdmin` (già usato in `otp.functions.ts`) perché le tabelle `licenses`/`puk_codes` non hanno policy pubbliche.
- Le sessioni successive rientrano naturalmente: se `activated=true` in localStorage → app; se l'utente pulisce lo storage, rifà OTP + `verifyLicense` che trova `activated_at` già valorizzato e salta l'UPDATE su `licenses` (rimane comunque `used=true` sul PUK, quindi il match nella SELECT del passaggio 2 fallirebbe una seconda volta).

### Punto da confermare

Il brief dice: "Nelle sessioni successive basta ripetere il controllo del Passaggio 2 SENZA rifare l'UPDATE se `activated_at` è già valorizzato". Ma la SELECT del Passaggio 2 richiede `p.used = false`, quindi dopo la prima attivazione il PUK è `used=true` e la stessa query non trova più righe. Interpreto quindi: **per le sessioni successive basta che esista una licenza attiva (`is_active=true`, `expires_at` futuro o null) associata all'email verificata, senza ricontrollare il PUK**. La UI di riaccesso quindi chiederà solo l'OTP e verificherà lato server la sola licenza attiva. Confermi questa interpretazione oppure vuoi che il PUK venga richiesto ogni volta (nel qual caso il PUK non va marcato `used`)?
