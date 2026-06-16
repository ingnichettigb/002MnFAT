## Obiettivo

Il bottone **8 — Genera Report FAT** deve, oltre a generare il PDF, **salvare definitivamente** il FAT marcandolo come "completato" (status `done`).

## Comportamento attuale vs nuovo

| | Oggi | Nuovo |
|---|---|---|
| Salvataggio | `saveDraft()` (bozza, status resta `in_progress`) | `markDone()` (status → `done`) |
| Generazione PDF | sì (download + apertura browser) | sì (invariato) |
| Toast | "Report in generazione…" | "Report generato e FAT completato" |
| Rigenerazione su FAT già `done` | consentita | consentita (resta `done`, ri-scarica PDF) |
| Modificabilità dopo | — | Il FAT resta modificabile; se l'utente cambia un campo lo status torna a `in_progress` (logica già esistente in `updateActiveState`) |

## Modifiche

**File: `src/routes/report.tsx`**
- In `handleGenerate`: sostituire `saveDraft()` con `markDone()`.
- Aggiornare il toast in "Report generato — FAT contrassegnato come completato" (con chiave i18n).

**File: `src/lib/i18n.tsx`**
- Aggiungere chiave `reportGeneratedDone` (IT: "Report generato — FAT completato", EN: "Report generated — FAT marked as done").

Nessuna modifica alla logica di `markDone` (già presente in `fat-context.tsx` e già preserva i dati / consente modifiche successive che riportano lo status a `in_progress`).

## Note

- Nessun cambiamento al PDF, ai form, o all'archivio.
- La rigenerazione su un FAT `done` chiama di nuovo `markDone()` (idempotente: resta `done`, aggiorna solo `updatedAt`).