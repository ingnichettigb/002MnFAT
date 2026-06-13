## Obiettivo

Permettere all'utente di riordinare i controlli tramite drag & drop sia nella pagina `/controlli` sia nella pagina `/report`. Gli ultimi 3 controlli — **Varie / allegati tecnici**, **Elenco deviazioni / non conformità**, **Azioni correttive** — restano fissi in fondo e non sono spostabili (nemmeno tra loro). L'ordine scelto viene rispettato anche nei capitoli del PDF.

## Modifiche

### 1. `src/lib/fat-numbering.ts`
- Esportare una costante `LOCKED_TAIL_IDS` con gli id dei 3 controlli fissi in fondo, nell'ordine richiesto: `varie` → `deviazioni` → `azioni_correttive` (id reali da verificare al momento dell'implementazione leggendo il file).

### 2. `src/lib/fat-context.tsx`
- Aggiungere azione `reorderControls(orderedIds: string[])` che riordina l'array `controls` mantenendo:
  - i controlli non presenti in `orderedIds` nella loro posizione relativa originale,
  - i 3 id di `LOCKED_TAIL_IDS` sempre in coda nell'ordine fissato.
- Garantire che ogni nuovo controllo aggiunto in futuro non finisca mai dopo i 3 fissi.

### 3. Dipendenza
- Installare `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (accessibile, supporta tastiera, pattern standard con shadcn).

### 4. Componente condiviso `src/components/sortable-controls-list.tsx`
- Lista ordinabile generica che riceve:
  - `items`: controlli ordinabili (tutti tranne i 3 fissi),
  - `lockedTail`: i 3 controlli fissi,
  - `onReorder(newOrderedIds)`,
  - `renderItem(control)`: come renderizzare la riga (checkbox + label nella pagina controlli, solo numero + label nel report).
- Maniglia di trascinamento ⠿ (icona `GripVertical` di lucide) a sinistra di ogni riga ordinabile.
- Le righe `lockedTail` vengono rese sotto, senza maniglia, con un'icona lucchetto (`Lock`) e tooltip "Posizione fissa / Feste Position".

### 5. `src/routes/controlli.tsx`
- Sostituire la lista attuale dei controlli con `SortableControlsList`.
- Drag attivo su tutti i controlli (selezionati e non) tranne i 3 fissi.
- Il toggle di selezione resta sulla riga/checkbox.

### 6. `src/routes/report.tsx`
- Sostituire l'`<ol>` dei `selected` con `SortableControlsList` in modalità sola-lettura per la selezione (mostra solo i controlli selezionati, numerati nell'ordine corrente).
- Drag attivo sui selezionati tranne i 3 fissi (se presenti in selezione).

### 7. `src/lib/generate-fat-pdf.ts`
- Nessuna modifica logica: già itera `state.controls.filter(c => c.selected)` nell'ordine dell'array. Verificare che tutti i punti di iterazione (indice capitolo, TOC, contenuto) usino lo stesso ordine.

### 8. i18n (`src/lib/i18n.tsx`)
- Aggiungere chiavi: `dragToReorder` ("Trascina per riordinare" / "Zum Sortieren ziehen" / EN / ES) e `lockedPosition` ("Posizione fissa" / "Feste Position" / ...).

## Comportamento UX

- Cursor `grab` sulla maniglia, `grabbing` durante il drag.
- Animazione di transizione standard `@dnd-kit/sortable`.
- Supporto tastiera (Space per afferrare, frecce per spostare, Space per rilasciare).
- I 3 fissi sono visivamente separati da un sottile divisore con etichetta "Sezioni finali / Endabschnitte".

## Verifica

- Riordinare in `/controlli`, navigare a `/report`: l'ordine è preservato.
- Riordinare in `/report`, generare PDF: i capitoli del PDF seguono il nuovo ordine; i 3 fissi sono sempre gli ultimi 3 capitoli.
- Drag su un controllo fisso: nessuna risposta (handle assente).
- Drop di un controllo ordinabile in coda: non può superare la posizione del primo dei 3 fissi.
