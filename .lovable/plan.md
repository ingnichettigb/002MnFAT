# Gestione archivio FAT

Aggiungo la possibilità di salvare un FAT (sia in lavorazione che completato), riaprirlo, modificarlo, duplicarlo o eliminarlo, tramite una nuova sezione "Archivio FAT".

## Cosa vedrà l'utente

1. **Nuova voce nello stepper / home**: bottone "Archivio FAT" (con il suo numero etichetta) che apre la pagina elenco.
2. **Pagina `/archivio`** con tabella dei FAT salvati e tre filtri/tab:
   - **Da lavorare** (creato, nessun dato compilato significativo)
   - **In lavorazione** (parzialmente compilato, non ancora generato PDF)
   - **Completati** (PDF generato / contrassegnato come chiuso)
3. Ogni riga mostra: Commessa, Cliente, N° Disegno, Matricola, Tag, Data collaudo, Stato, Ultima modifica.
4. Azioni per riga: **Apri/Modifica**, **Duplica**, **Elimina**, **Genera PDF** (per i completati o pronti).
5. Bottoni nella pagina principale:
   - **Salva bozza** (in qualunque momento) → torna in archivio come "In lavorazione".
   - **Salva e chiudi** alla fine del flusso controlli → marcato "Completato".
   - **Nuovo FAT** → resetta il form e crea un nuovo record.

## Come funziona dietro le quinte (parte tecnica)

- Estendo `src/lib/fat-context.tsx`:
  - Nuovo tipo `SavedFat = { id, createdAt, updatedAt, status: "todo" | "in_progress" | "done", state: FatState }`.
  - Lo storage in `localStorage` diventa una lista (`mini-fat:archive:v1`) + un puntatore al FAT corrente (`mini-fat:current:v1`).
  - Nuove azioni del context: `saveDraft()`, `saveAsDone()`, `loadFat(id)`, `duplicateFat(id)`, `deleteFat(id)`, `newFat()`, `setStatus(id, status)`.
  - Lo stato corrente viene auto-salvato (debounced) nel record attivo, così non si perde nulla.
- Nuovo file `src/routes/archivio.tsx` con la tabella e i filtri (componenti shadcn `Table`, `Tabs`, `Button`, `AlertDialog` per conferma eliminazione).
- Nuove etichette numerate aggiunte a `src/lib/fat-numbering.ts` e tradotte in `src/lib/i18n.tsx` (IT/EN): "Archivio FAT", "Salva bozza", "Salva e chiudi", "Nuovo FAT", "Apri", "Duplica", "Elimina", "Stato", "Ultima modifica", "Da lavorare", "In lavorazione", "Completato".
- Aggiorno `src/components/fat-stepper.tsx` / `src/routes/index.tsx` / `src/routes/controlli.tsx`:
  - In alto: link ad **Archivio FAT** + **Nuovo FAT** + **Salva bozza**.
  - In `controlli.tsx` il bottone Avanti continua a generare il PDF e in più marca il FAT come "Completato".
- Lo stato "todo" viene assegnato automaticamente quando si crea un nuovo FAT vuoto; passa a "in_progress" appena un campo significativo viene compilato; diventa "done" quando si salva e chiude o si genera il PDF dall'archivio.

## File toccati

- modificati: `src/lib/fat-context.tsx`, `src/lib/fat-numbering.ts`, `src/lib/i18n.tsx`, `src/routes/index.tsx`, `src/routes/controlli.tsx`, `src/components/fat-stepper.tsx`
- creato: `src/routes/archivio.tsx`

Nessuna dipendenza backend: tutto resta in `localStorage` (coerente con l'impostazione attuale dell'app). Posso in seguito spostare l'archivio su Lovable Cloud se vorrai accedervi da più dispositivi.
