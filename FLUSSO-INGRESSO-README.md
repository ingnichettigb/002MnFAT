# Flusso di ingresso completo — dalla verifica email all'accesso alla SaaS

Documento di replica per altri programmi del portfolio.
Progetto di riferimento: **Mini F.A.T.** — `APP_CODE = "002MnFAT"`.

Il flusso è composto da **3 passaggi obbligatori e sequenziali**, più un gate
globale (`AuthGate`) che impedisce di saltarne uno.

```
/auth            Passaggio 1 di 3  →  verifica email con codice OTP
/attivazione     Passaggio 2 di 3  →  verifica licenza + PUK (self-claim multi-seat)
/condizioni      Passaggio 3 di 3  →  accettazione condizioni d'uso (4 lingue)
/                                     SaaS accessibile
```

---

## 0. Configurazione centrale

`src/lib/app-config.ts` — unico file da cambiare per un nuovo prodotto:

```ts
export const APP_CODE = "002MnFAT";     // codice prodotto: filtri DB, source, from email
export const APP_NAME = "Mini F.A.T.";  // nome mostrato, interpolato in {{APP_NAME}}
export const TERMS_VERSION = "v1";      // cambiandola si forza una nuova accettazione
```

### Due database Supabase distinti

| Client | File | Uso |
|---|---|---|
| Cloud (progetto locale) | `@/integrations/supabase/client.server` → `supabaseAdmin` | tabella `lead_emails` (OTP) |
| Esterno (progetto licenze condiviso) | `@/integrations/supabase/client.external` → `supabaseExternal` | `licenses`, `puk_codes`, `license_puk_map`, `users`, `license_consents` |

Il client esterno usa due secret: `EXTERNAL_SUPABASE_URL` e
`EXTERNAL_SUPABASE_SERVICE_ROLE_KEY`. Entrambi i client sono importati
**dinamicamente dentro l'handler** della server function, mai a livello di modulo.

### Chiavi localStorage (namespaced con APP_CODE)

Definite in `src/routes/__root.tsx`:

```ts
export const VERIFIED_EMAIL_KEY = "002MnFAT:verifiedEmail"; // email verificata via OTP
export const ACTIVATED_KEY      = "002MnFAT:activated";     // licenza+PUK ok
export const LICENSE_ID_KEY     = "002MnFAT:licenseId";     // uuid licenza attivata
export const CONSENT_KEY        = "002MnFAT:consent";       // condizioni accettate
```

**Obbligatorio** cambiare il prefisso in un nuovo progetto: senza namespacing, due
SaaS del portfolio sullo stesso browser/dominio si sovrascrivono la sessione.

---

## 1. PASSAGGIO 1 — Verifica email con OTP

File: `src/lib/otp.functions.ts` (logica) e `src/routes/auth.tsx` (UI).

### Parametri

```ts
const OTP_TTL_MIN       = 10;  // validità codice, in minuti
const OTP_MAX_PER_WINDOW = 3;  // massimo 3 codici
const OTP_WINDOW_HOURS   = 24; // per finestra di 24 ore
```

### Tabella `lead_emails` (DB Cloud)

| Colonna | Tipo | Note |
|---|---|---|
| `id` | uuid PK | |
| `email` | text | confronto sempre con `.ilike()` (case-insensitive) |
| `verification_code` | text | codice a 6 cifre in chiaro |
| `is_verified` | bool | |
| `verified_at` | timestamptz | |
| `created_at` | timestamptz | |
| `source` | text | valorizzato con `APP_CODE` |
| `otp_attempts` | int | contatore invii nella finestra |
| `otp_window_start` | timestamptz | inizio finestra **e** istante di invio del codice |

> `otp_window_start` ha doppia funzione: rate-limit a 24h **e** calcolo della
> scadenza dei 10 minuti. Non usare `created_at` per il TTL: la riga viene
> riutilizzata e il codice risulterebbe scaduto subito.

### `requestOtp({ email })`

Validazione input con zod: `z.string().trim().toLowerCase().email().max(254)`.

1. Legge l'ultima riga per quella email (`.ilike`, ordinata per `created_at` desc).
2. Calcola `attempts` e `windowStart`:
   - se `is_verified === true` → `attempts = 0`, `windowStart = now` (chi ha già
     verificato può sempre richiedere un nuovo codice);
   - se la finestra è scaduta (`now - windowStart > 24h`) o assente → reset a 0.
3. Se `attempts >= 3` → ritorna `{ ok:false, reason:"rate_limited", code:"E-011" }`.
4. Genera un codice a 6 cifre: `Math.floor(100000 + Math.random()*900000)`.
5. Se esiste una riga **non verificata** la aggiorna (`verification_code`,
   `otp_attempts = attempts+1`, `otp_window_start = now`); altrimenti inserisce
   una riga nuova con `is_verified=false` e `source = APP_CODE`.
6. Invia l'email. Se l'invio fallisce → `{ ok:false, reason:"send_failed", code:"E-010" }`.
7. Successo → `{ ok:true, sent:true }`.

### Invio email (connettore Resend via Lovable gateway)

```
POST https://connector-gateway.lovable.dev/resend/emails
Authorization: Bearer ${LOVABLE_API_KEY}
X-Connection-Api-Key: ${RESEND_API_KEY}
body: {
  from: `${APP_CODE} <team@corporateboostservice.eu>`,
  to: [email],
  subject: `Codice di verifica: ${code}`,
  html: <box con il codice a 32px, letter-spacing 8px, nota "scade tra 10 minuti">
}
```

### `verifyOtp({ email, code })`

Validazione: email come sopra, `code` deve matchare `/^\d{6}$/`.

1. Cerca la riga con `email ilike` **AND** `verification_code = code` **AND**
   `is_verified = false`, la più recente. Nessuna riga → `E-012`.
2. Calcola l'età del codice da `otp_window_start` (fallback `created_at`).
   Se `> 10 minuti` → `E-012` (stesso codice: non si rivela se il codice era
   giusto ma scaduto).
3. Update: `is_verified = true`, `verified_at = now()`, `otp_attempts = 0`
   (il reset libera subito la finestra dopo una verifica riuscita).
4. **Rilettura di conferma**: rilegge la riga e controlla `is_verified === true`.
   Se non confermato → `E-013`. Serve a non dichiarare verificata una email che
   in DB non lo è.
5. Successo → `{ ok:true }`.

### UI `/auth`

Tre stadi: `email` → `otp` → `done`.

- Stadio `email`: campo email + bottone "Invia codice".
- Stadio `otp`: mostra "Abbiamo inviato il codice a `<email>`", campo a 6 cifre
  (filtrato con `replace(/\D/g,'')`), bottoni "Verifica" e "Reinvia",
  link "Cambia email".
- Stadio `done`: "Email verificata con successo. Reindirizzamento…", poi dopo
  600 ms scrive `VERIFIED_EMAIL_KEY = email` e naviga a `/attivazione`.

Messaggi di errore mostrati (italiano, con codice in coda):

| Codice | Messaggio |
|---|---|
| E-010 | Impossibile inviare il codice. Verifica l'indirizzo email. |
| E-011 | Hai già ricevuto 3 codici di verifica. Riprova tra 24 ore. |
| E-012 | Codice non corretto. Riprova o richiedi un nuovo invio. |
| E-013 | Errore tecnico durante la verifica. Riprova. |

Non esiste alcuna scorciatoia di sviluppo: l'unico modo di superare il
passaggio 1 è la verifica OTP dell'email.

---

## 2. PASSAGGIO 2 — Licenza + PUK (self-claim multi-seat)

File: `src/lib/license.functions.ts` (logica), `src/routes/attivazione.tsx` (UI).

### Modello dati (DB esterno)

- `licenses`: `id`, `license_key`, `app_code`, `is_active`, `expires_at`, `activated_at`.
  Una licenza = N posti (seat).
- `puk_codes`: `id`, `code`, `used`, `used_at`, `user_id`, `type_product_code`,
  `license_id` (legacy). Un PUK = 1 posto.
- `license_puk_map`: `license_id` + `puk_id` — associa i PUK alla licenza.
  ⚠️ Nel DB attuale **non** esiste il vincolo `UNIQUE (license_id, puk_id)`.
- `users`: `id`, `email` — anagrafica globale cross-prodotto.

Il DB esterno ha colonne assenti dai tipi generati Cloud, perciò il client viene
castato una volta: `const ext = supabaseExternal as unknown as { from:(t:string)=>any }`.

### `verifyAndActivateLicense({ email, licenseKey, puk })`

Sequenza esatta dei controlli:

1. **Email verificata** — su Cloud, `lead_emails` con `email ilike` e
   `is_verified = true`. Assente → `E-001` (la UI rimanda a `/auth`).
2. **Licenza** — `licenses` filtrata per `license_key = licenseKey` **AND**
   `app_code = APP_CODE` **AND** `is_active = true`.
   Nessuna riga → `E-101`.
   *Nessun filtro su email*: è proprio questo che abilita il self-claim
   (chi compra può distribuire i codici ad altri utenti).
3. **Scadenza** — se `expires_at` valorizzata e `<= now` → `E-103`.
4. **PUK esistente** — `puk_codes` con `code = puk`. Assente → `E-201`.
5. **PUK del prodotto giusto** — se `type_product_code` è valorizzato e
   diverso da `APP_CODE` → `E-203`.
6. **PUK appartenente alla licenza** — riga in `license_puk_map`
   (`license_id` + `puk_id`) **oppure** legame legacy `puk_codes.license_id === license.id`.
   Nessuno dei due → `E-204`.
7. **Risoluzione utente** — cerca in `users` per `email ilike`; se assente lo
   inserisce e ne prende l'`id`.
8. **Claim del posto**:
   - `puk_codes.user_id` valorizzato e **diverso** dall'utente → `E-202`
     (posto già occupato da un altro);
   - `puk_codes.user_id` **uguale** all'utente → `reactivated = true`
     (stesso utente che rientra, ad es. da un altro dispositivo);
   - `puk_codes.user_id` NULL → update atomico con guardia
     `.eq('id', pukRow.id).is('user_id', null)` che imposta
     `user_id`, `used = true`, `used_at = now()`. Se l'update non restituisce
     righe significa che qualcuno l'ha reclamato nel frattempo (race) → `E-202`.
9. **Prima attivazione della licenza** — se `licenses.activated_at` è NULL,
   la valorizza con update guardato da `.is('activated_at', null)`.
10. Successo → `{ ok:true, reactivated, licenseId, pukId, userId }`.

Qualsiasi eccezione → catch globale → `E-500`.

### UI `/attivazione`

Header: `Attivazione licenza — {APP_CODE}`, descrizione "Passaggio 2 di 3".
Campi: email verificata (readonly, letta da localStorage), "Codice licenza",
"Codice PUK". Se `VERIFIED_EMAIL_KEY` manca → redirect a `/auth`.

In caso di successo, **non** scrive `ACTIVATED_KEY`: scrive `LICENSE_ID_KEY`,
rimuove `ACTIVATED_KEY` e `CONSENT_KEY`, e naviga a `/condizioni`.
`ACTIVATED_KEY` viene scritta solo dopo l'accettazione delle condizioni: così
il passaggio 3 non è aggirabile.

Messaggi di errore (italiano, discorsivi; il codice E-XXX è mostrato sotto in
carattere piccolo):

| Codice | Messaggio |
|---|---|
| E-001 | La tua email non risulta ancora verificata. Torna al passaggio precedente e completa la verifica con il codice ricevuto via email. |
| E-101 | Il codice licenza inserito non è valido. Controlla di averlo copiato correttamente dall'email di acquisto (senza spazi iniziali o finali). |
| E-103 | Questa licenza risulta scaduta. Contatta il supporto per verificare il rinnovo o l'acquisto di una nuova licenza. |
| E-201 | Il codice PUK (numero ebook) inserito non è valido. Verifica di averlo copiato correttamente dall'email di acquisto. |
| E-202 | Questo codice PUK è già stato attivato da un altro utente. Ogni codice PUK è personale e può essere usato una sola volta. Se la licenza prevede più utenti, contatta chi ha effettuato l'acquisto per ricevere un codice PUK non ancora utilizzato. |
| E-203 | Questo codice PUK non è valido per questa applicazione. Verifica di aver inserito il codice corretto per il prodotto che stai attivando. |
| E-204 | Questo codice PUK non risulta associato alla licenza inserita. Verifica che entrambi i codici provengano dalla stessa email di acquisto. |
| E-500 | Si è verificato un errore tecnico imprevisto. Riprova tra qualche minuto o contattaci indicando il codice errore (E-500). |

---

## 3. PASSAGGIO 3 — Accettazione condizioni d'uso

File: `src/lib/consent.functions.ts`, `src/components/terms-consent.tsx`,
`src/lib/terms-i18n.ts`, `src/routes/condizioni.tsx`.

### Tabella `license_consents` (DB esterno)

Colonne usate: `id`, `license_id`, `app_code`, `language`, `terms_version`,
`user_agent`, `ip_address`. Vincolo UNIQUE atteso su `(license_id, terms_version)`.

### `checkTermsConsent({ licenseId })`

Cerca una riga con `license_id = licenseId` **AND** `terms_version = TERMS_VERSION`.
Ritorna `{ accepted: boolean }`. In caso di errore ritorna `accepted:false`
(fail-safe: meglio ri-chiedere il consenso che saltarlo).

### `recordTermsConsent({ licenseId, language })`

`language` validata con `z.enum(["it","en","de","es"])`, `licenseId` con `z.string().uuid()`.

1. Rilegge la licenza da `licenses` filtrando su `id` **e** `app_code = APP_CODE`
   per prendere `app_code` server-side (non ci si fida del client).
   Licenza assente → `E-302`.
2. Raccoglie le prove del consenso dagli header della richiesta:
   `user-agent` e `x-forwarded-for` (prima voce prima della virgola) via
   `getRequestHeader` di `@tanstack/react-start/server`.
3. Insert su `license_consents`.
   - errore Postgres `23505` (unique violation) → `{ ok:true, alreadyExisted:true }`
     (consenso già presente: si prosegue);
   - altri errori → `E-301`.
4. Successo → `{ ok:true, alreadyExisted:false }`.

### Versionamento

`TERMS_VERSION` è il perno: portandola a `"v2"` la `checkTermsConsent` non trova
più il record e l'utente è costretto ad accettare di nuovo il testo aggiornato.

### Componente `<TermsConsent licenseId email initialLang onAccepted />`

- Selettore lingua a 4 bandiere (🇮🇹 🇬🇧 🇩🇪 🇪🇸) in alto a destra; lingua iniziale
  ereditata dalla lingua primaria dell'app (`useI18n().primary`).
- Titolo `"{pageTitle} — {APP_NAME}"`, sottotitolo `"{stepLabel} · {email}"`.
- Box scrollabile `max-h-[50vh] overflow-y-auto` con heading, subheading, le 9
  sezioni numerate e il footer di versione.
- `{{APP_NAME}}` sostituito a runtime: `s.replaceAll("{{APP_NAME}}", APP_NAME)`.
- Checkbox obbligatoria; il bottone "Accetta e continua" è disabilitato finché
  `!checked || loading`.
- Palette brand inline: sfondo `#06090f`, bordi/superfici `#0a2a4a`,
  accento `#b4ff3c` (titolo, bordo lingua attiva, bottone).
- Su errore mostra `errorGeneric` con il codice tra parentesi.

### Route `/condizioni`

Legge `VERIFIED_EMAIL_KEY` e `LICENSE_ID_KEY`. Senza email → `/auth`.
Senza `licenseId` (sessione legacy) → rimuove `ACTIVATED_KEY` e va a `/attivazione`.
In `onAccepted` scrive `CONSENT_KEY = "1"` **e** `ACTIVATED_KEY = "1"`, poi naviga a `/`.

---

## 4. Testo delle condizioni — struttura e traduzioni

`src/lib/terms-i18n.ts` esporta `TERMS: Record<Lang, TermsContent>` con questa forma:

```ts
type TermsContent = {
  langLabel: string;       // "Italiano" | "English" | "Deutsch" | "Español"
  pageTitle: string;       // "Condizioni d'Uso" | "Terms of Use" | "Nutzungsbedingungen" | "Condiciones de Uso"
  stepLabel: string;       // "Passaggio 3 di 3" | "Step 3 of 3" | "Schritt 3 von 3" | "Paso 3 de 3"
  intro: string;
  checkboxLabel: string;
  acceptButton: string;    // "Accetta e continua" | "Accept and continue" | "Akzeptieren und fortfahren" | "Aceptar y continuar"
  acceptingButton: string; // "Salvataggio…" | "Saving…" | "Speichern…" | "Guardando…"
  errorGeneric: string;
  content: {
    heading: string;
    subheading: string;                                 // "{{APP_NAME}} — Versione 1.0"
    sections: Array<{ title: string; body: string }>;   // 9 sezioni numerate
    footer: string;                                     // "Versione: v1 — Ultimo aggiornamento: 14 luglio 2026"
  };
};
```

Le 9 sezioni, identiche per struttura in tutte e 4 le lingue:

1. OGGETTO / SUBJECT / GEGENSTAND / OBJETO
2. LICENZA D'USO / LICENCE OF USE / NUTZUNGSLIZENZ / LICENCIA DE USO
3. MODALITÀ DI ACQUISTO E FATTURAZIONE / PURCHASE AND BILLING / KAUF- UND ABRECHNUNGSMODALITÄTEN / FORMA DE COMPRA Y FACTURACIÓN
4. USO CONSENTITO / PERMITTED USE / ZULÄSSIGE NUTZUNG / USO PERMITIDO
5. DATI E PRIVACY / DATA AND PRIVACY / DATEN UND DATENSCHUTZ / DATOS Y PRIVACIDAD
6. LIMITAZIONE DI RESPONSABILITÀ / LIMITATION OF LIABILITY / HAFTUNGSBESCHRÄNKUNG / LIMITACIÓN DE RESPONSABILIDAD
7. DURATA E RISOLUZIONE / DURATION AND TERMINATION / LAUFZEIT UND KÜNDIGUNG / DURACIÓN Y RESOLUCIÓN
8. MODIFICHE ALLE CONDIZIONI / CHANGES TO THE TERMS / ÄNDERUNGEN DER BEDINGUNGEN / MODIFICACIONES DE LAS CONDICIONES
9. LEGGE APPLICABILE E FORO COMPETENTE / APPLICABLE LAW AND JURISDICTION / ANWENDBARES RECHT UND GERICHTSSTAND / LEY APLICABLE Y JURISDICCIÓN

Riferimenti invarianti in tutte le lingue: **Dott. Ing. Nichetti Gian Battista**,
**P.IVA IT01235350194**, sede in **Soresina (CR), Italia**, brand
**CorporateBoostService**, **Paddle.com Market Limited** come Merchant of Record,
pagina **/pagamenti-merchant-of-record**, **Regolamento (UE) 2016/679 (GDPR)**,
**Foro di Cremona**.

### Testo integrale — Italiano

**CONDIZIONI D'USO DEL SOFTWARE** — {{APP_NAME}} — Versione 1.0

1. **OGGETTO** — Le presenti condizioni regolano l'utilizzo del software {{APP_NAME}} ("Software"), fornito da Dott. Ing. Nichetti Gian Battista, P.IVA IT01235350194, con sede in Soresina (CR), Italia, tramite il brand CorporateBoostService ("Fornitore").
2. **LICENZA D'USO** — Il Fornitore concede all'Utente una licenza d'uso non esclusiva, non trasferibile e limitata nel tempo, secondo i termini di validità associati alla licenza acquistata. La licenza non costituisce cessione di proprietà intellettuale sul Software, che resta di esclusiva proprietà del Fornitore.
3. **MODALITÀ DI ACQUISTO E FATTURAZIONE** — I pagamenti sono gestiti da Paddle.com Market Limited in qualità di Merchant of Record. Per dettagli consultare la pagina /pagamenti-merchant-of-record.
4. **USO CONSENTITO** — L'Utente si impegna a utilizzare il Software esclusivamente per le finalità previste, a non tentare di decompilare, modificare o distribuire il Software, e a non condividere le proprie credenziali di accesso.
5. **DATI E PRIVACY** — Il trattamento dei dati personali è disciplinato dalla Privacy Policy disponibile sul sito, in conformità al Regolamento (UE) 2016/679 (GDPR).
6. **LIMITAZIONE DI RESPONSABILITÀ** — Il Software è fornito "così com'è". Il Fornitore non garantisce l'assenza di errori o interruzioni del servizio e non risponde di danni indiretti, salvo dolo o colpa grave.
7. **DURATA E RISOLUZIONE** — La licenza ha validità secondo quanto indicato al momento dell'acquisto. Il Fornitore si riserva il diritto di sospendere l'accesso in caso di violazione delle presenti condizioni.
8. **MODIFICHE ALLE CONDIZIONI** — In caso di modifiche sostanziali, sarà richiesta nuova accettazione.
9. **LEGGE APPLICABILE E FORO COMPETENTE** — Legge italiana. Foro di Cremona, salvo diversa disposizione inderogabile a tutela del consumatore.

*Versione: v1 — Ultimo aggiornamento: 14 luglio 2026*

Etichette IT: intro "Per completare l'attivazione, leggi e accetta le condizioni
d'uso del software." · checkbox "Ho letto e accetto le condizioni d'uso" ·
errore "Impossibile registrare il consenso. Riprova tra qualche istante."

### Testo integrale — English

**SOFTWARE TERMS OF USE** — {{APP_NAME}} — Version 1.0

1. **SUBJECT** — These terms govern the use of the software {{APP_NAME}} ("Software"), provided by Dott. Ing. Nichetti Gian Battista, VAT No. IT01235350194, with registered office in Soresina (CR), Italy, under the CorporateBoostService brand ("Supplier").
2. **LICENCE OF USE** — The Supplier grants the User a non-exclusive, non-transferable licence to use the Software, limited in time according to the validity terms associated with the purchased licence. The licence does not constitute a transfer of intellectual property rights over the Software, which remain the exclusive property of the Supplier.
3. **PURCHASE AND BILLING** — Payments are handled by Paddle.com Market Limited acting as Merchant of Record. For details see the page /pagamenti-merchant-of-record.
4. **PERMITTED USE** — The User undertakes to use the Software solely for its intended purposes, not to attempt to decompile, modify or distribute the Software, and not to share their access credentials.
5. **DATA AND PRIVACY** — The processing of personal data is governed by the Privacy Policy available on the website, in compliance with Regulation (EU) 2016/679 (GDPR).
6. **LIMITATION OF LIABILITY** — The Software is provided "as is". The Supplier does not warrant that it will be free from errors or service interruptions and shall not be liable for indirect damages, save for wilful misconduct or gross negligence.
7. **DURATION AND TERMINATION** — The licence is valid for the period indicated at the time of purchase. The Supplier reserves the right to suspend access in the event of a breach of these terms.
8. **CHANGES TO THE TERMS** — In the event of material changes, renewed acceptance will be required.
9. **APPLICABLE LAW AND JURISDICTION** — Italian law shall apply. The Court of Cremona shall have jurisdiction, without prejudice to any mandatory consumer-protection provisions.

*Version: v1 — Last updated: 14 July 2026*

Etichette EN: intro "To complete activation, please read and accept the software
terms of use." · checkbox "I have read and accept the terms of use" ·
errore "Unable to record your consent. Please try again shortly."

### Testo integrale — Deutsch

**NUTZUNGSBEDINGUNGEN DER SOFTWARE** — {{APP_NAME}} — Version 1.0

1. **GEGENSTAND** — Diese Bedingungen regeln die Nutzung der Software {{APP_NAME}} ("Software"), die von Dott. Ing. Nichetti Gian Battista, USt-IdNr. IT01235350194, mit Sitz in Soresina (CR), Italien, unter der Marke CorporateBoostService ("Anbieter") bereitgestellt wird.
2. **NUTZUNGSLIZENZ** — Der Anbieter gewährt dem Nutzer eine nicht ausschließliche, nicht übertragbare und zeitlich begrenzte Nutzungslizenz gemäß den mit der erworbenen Lizenz verbundenen Gültigkeitsbedingungen. Die Lizenz stellt keine Übertragung der geistigen Eigentumsrechte an der Software dar, die im ausschließlichen Eigentum des Anbieters verbleiben.
3. **KAUF- UND ABRECHNUNGSMODALITÄTEN** — Die Zahlungen werden von Paddle.com Market Limited als Merchant of Record abgewickelt. Einzelheiten finden Sie auf der Seite /pagamenti-merchant-of-record.
4. **ZULÄSSIGE NUTZUNG** — Der Nutzer verpflichtet sich, die Software ausschließlich für die vorgesehenen Zwecke zu verwenden, nicht zu versuchen, sie zu dekompilieren, zu verändern oder zu verbreiten, und seine Zugangsdaten nicht weiterzugeben.
5. **DATEN UND DATENSCHUTZ** — Die Verarbeitung personenbezogener Daten unterliegt der auf der Website verfügbaren Datenschutzerklärung, in Übereinstimmung mit der Verordnung (EU) 2016/679 (DSGVO).
6. **HAFTUNGSBESCHRÄNKUNG** — Die Software wird "wie besehen" bereitgestellt. Der Anbieter übernimmt keine Gewähr für Fehlerfreiheit oder ununterbrochene Verfügbarkeit und haftet nicht für indirekte Schäden, außer bei Vorsatz oder grober Fahrlässigkeit.
7. **LAUFZEIT UND KÜNDIGUNG** — Die Lizenz gilt für den zum Zeitpunkt des Kaufs angegebenen Zeitraum. Der Anbieter behält sich das Recht vor, den Zugang bei Verstoß gegen diese Bedingungen zu sperren.
8. **ÄNDERUNGEN DER BEDINGUNGEN** — Bei wesentlichen Änderungen ist eine erneute Zustimmung erforderlich.
9. **ANWENDBARES RECHT UND GERICHTSSTAND** — Es gilt italienisches Recht. Gerichtsstand ist Cremona, vorbehaltlich zwingender verbraucherschützender Bestimmungen.

*Version: v1 — Letzte Aktualisierung: 14. Juli 2026*

Etichette DE: intro "Um die Aktivierung abzuschließen, lesen und akzeptieren Sie
bitte die Nutzungsbedingungen der Software." · checkbox "Ich habe die
Nutzungsbedingungen gelesen und akzeptiere sie" · errore "Die Einwilligung konnte
nicht gespeichert werden. Bitte versuchen Sie es in Kürze erneut."

### Testo integrale — Español

**CONDICIONES DE USO DEL SOFTWARE** — {{APP_NAME}} — Versión 1.0

1. **OBJETO** — Las presentes condiciones regulan el uso del software {{APP_NAME}} ("Software"), suministrado por Dott. Ing. Nichetti Gian Battista, NIF IT01235350194, con sede en Soresina (CR), Italia, a través de la marca CorporateBoostService ("Proveedor").
2. **LICENCIA DE USO** — El Proveedor concede al Usuario una licencia de uso no exclusiva, no transferible y limitada en el tiempo, según los términos de validez asociados a la licencia adquirida. La licencia no constituye una cesión de la propiedad intelectual sobre el Software, que sigue siendo propiedad exclusiva del Proveedor.
3. **FORMA DE COMPRA Y FACTURACIÓN** — Los pagos son gestionados por Paddle.com Market Limited en calidad de Merchant of Record. Para más detalles consulta la página /pagamenti-merchant-of-record.
4. **USO PERMITIDO** — El Usuario se compromete a utilizar el Software exclusivamente para los fines previstos, a no intentar descompilar, modificar o distribuir el Software y a no compartir sus credenciales de acceso.
5. **DATOS Y PRIVACIDAD** — El tratamiento de los datos personales se rige por la Política de Privacidad disponible en el sitio web, de conformidad con el Reglamento (UE) 2016/679 (RGPD).
6. **LIMITACIÓN DE RESPONSABILIDAD** — El Software se suministra "tal cual". El Proveedor no garantiza la ausencia de errores o interrupciones del servicio y no responde de los daños indirectos, salvo dolo o culpa grave.
7. **DURACIÓN Y RESOLUCIÓN** — La licencia tiene la validez indicada en el momento de la compra. El Proveedor se reserva el derecho a suspender el acceso en caso de incumplimiento de estas condiciones.
8. **MODIFICACIONES DE LAS CONDICIONES** — En caso de modificaciones sustanciales, será necesaria una nueva aceptación.
9. **LEY APLICABLE Y JURISDICCIÓN** — Se aplica la ley italiana. Fuero de Cremona, salvo disposición imperativa distinta en protección del consumidor.

*Versión: v1 — Última actualización: 14 de julio de 2026*

Etichette ES: intro "Para completar la activación, lee y acepta las condiciones de
uso del software." · checkbox "He leído y acepto las condiciones de uso" ·
errore "No se ha podido registrar el consentimiento. Inténtalo de nuevo en unos
instantes."

---

## 5. Il gate globale — `AuthGate` in `src/routes/__root.tsx`

Wrappa `<Outlet />` e viene rieseguito a ogni cambio di `pathname`.

```ts
const PUBLIC_PATHS   = new Set(["/auth"]);
const ACTIVATION_PATH = "/attivazione";
const CONSENT_PATH    = "/condizioni";
```

Sequenza decisionale (primo match vince):

1. `pathname` è pubblico (`/auth`) → **consenti**.
2. `VERIFIED_EMAIL_KEY` assente → redirect `/auth`.
3. `pathname === /condizioni`:
   - `LICENSE_ID_KEY` assente → pulisce `ACTIVATED_KEY` e `CONSENT_KEY`, redirect `/attivazione`;
   - altrimenti → **consenti**.
4. `LICENSE_ID_KEY` presente **e** `CONSENT_KEY` assente **e** non sei su `/attivazione`
   → redirect `/condizioni`.
5. `ACTIVATED_KEY` assente **e** non sei su `/attivazione` → redirect `/attivazione`.
6. Altrimenti → **consenti**.

Finché il check non è completato il gate ritorna `null` (nessun flash di contenuto
protetto). Su tutte le pagine non pubbliche mostra un bottone fisso **"Esci"**
in alto a destra che rimuove tutte e 4 le chiavi localStorage e torna a `/auth`.

---

## 6. Checklist di replica su un nuovo programma

1. Copia i file: `src/lib/app-config.ts`, `src/lib/otp.functions.ts`,
   `src/lib/license.functions.ts`, `src/lib/consent.functions.ts`,
   `src/lib/terms-i18n.ts`, `src/components/terms-consent.tsx`,
   `src/routes/auth.tsx`, `src/routes/attivazione.tsx`, `src/routes/condizioni.tsx`,
   più il blocco `AuthGate` in `src/routes/__root.tsx`.
2. Cambia `APP_CODE`, `APP_NAME`, `TERMS_VERSION` in `app-config.ts`.
3. **Cambia il prefisso delle 4 chiavi localStorage** (`<APP_CODE>:verifiedEmail`,
   `:activated`, `:licenseId`, `:consent`). Se lo dimentichi, due SaaS del
   portfolio sullo stesso browser si sovrascrivono la sessione.
4. Crea nel DB Cloud la tabella `lead_emails` con tutte le colonne, incluse
   `otp_attempts` e `otp_window_start` (con GRANT e RLS).
5. Imposta i secret: `EXTERNAL_SUPABASE_URL`, `EXTERNAL_SUPABASE_SERVICE_ROLE_KEY`,
   `RESEND_API_KEY` (via connettore), `LOVABLE_API_KEY`.
6. Nel DB esterno: inserisci le `licenses` con il nuovo `app_code`, genera i
   `puk_codes` con `type_product_code = <APP_CODE>` e popola `license_puk_map`.
7. Cambia il mittente email `from` e i testi delle sezioni se il prodotto ha
   condizioni diverse; mantieni il placeholder `{{APP_NAME}}`.
8. Aggiorna i `head()` delle 3 route con il nome del nuovo prodotto.
9. **Non introdurre scorciatoie di bypass** in `auth.tsx`: il funnel deve essere l'unica via d'accesso.
10. Test end-to-end: email nuova → OTP → licenza+PUK → condizioni → app;
    poi ripulisci il localStorage e verifica che ogni redirect scatti correttamente.

---

## 7. Riepilogo codici di errore

| Codice | Passaggio | Significato |
|---|---|---|
| E-010 | 1 | Invio email fallito |
| E-011 | 1 | Rate limit: 3 codici in 24 ore |
| E-012 | 1 | Codice OTP errato o scaduto (>10 min) |
| E-013 | 1 | Salvataggio della verifica non confermato in DB |
| E-001 | 2 | Email non verificata |
| E-101 | 2 | Licenza inesistente/non attiva per questo `app_code` |
| E-103 | 2 | Licenza scaduta |
| E-201 | 2 | PUK inesistente |
| E-202 | 2 | PUK già reclamato da un altro utente (anche in race) |
| E-203 | 2 | PUK di un altro prodotto |
| E-204 | 2 | PUK non associato alla licenza |
| E-500 | 2 | Errore server imprevisto |
| E-301 | 3 | Insert del consenso fallito |
| E-302 | 3 | Licenza non trovata in fase di consenso |
