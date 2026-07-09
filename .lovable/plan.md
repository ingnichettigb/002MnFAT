
# Guida info — audit, riscrittura e traduzione 4 lingue

## Obiettivo

La guida attuale in `src/components/info-dialog.tsx` è testo copiato dal PDF del manuale, hard-coded in italiano. Va (1) verificata rispetto a ciò che l'app fa davvero e (2) tradotta in IT/EN/DE/ES seguendo la **lingua primaria** già gestita da `useI18n()` (`src/lib/i18n.tsx`).

## Fase 1 — Audit del comportamento reale

Leggo e confronto con la guida attuale:

- `src/routes/index.tsx` — header, `LangSwitcher`, `InfoDialog`, apertura stepper.
- `src/components/fat-stepper.tsx` — passi Dati Generali → Controlli → Report.
- `src/components/fat-toolbar.tsx` — pulsanti TEMPL / DOC / ARCH / SALVA / NEW / PDF (verifico nomi reali, ordine, comportamento).
- `src/routes/controlli.tsx` — selezione controlli, personalizzati, riordino.
- `src/routes/report.tsx` — riepilogo, generazione PDF, stato "completato".
- `src/routes/archivio.tsx` — filtri stato (Da lavorare / In lavorazione / Completati / Tutti), apri / duplica / elimina.
- `src/lib/fat-context.tsx` — dove/come vengono salvati i FAT (localStorage).
- `src/lib/generate-fat-pdf.ts` — cosa finisce nel PDF (frontespizio, capitoli per controllo, conclusioni, firme).
- `src/lib/i18n.tsx` — logica primaria/secondaria (già letto): la primaria è la lingua UI, la secondaria affianca i testi nei campi tradotti (`primaria / secondaria`).

Per ogni sezione della guida attuale segno: ✅ corretta, ✏️ da correggere, ➕ da aggiungere, ➖ da rimuovere. Il risultato dell'audit diventa la nuova struttura di contenuti.

## Fase 2 — Contenuti (bozza di sezioni)

Contenuti scritti sulla base dell'audit, non del PDF. Sezioni previste (titoli finali confermati dopo l'audit):

1. Cos'è mini FAT e a cosa serve
2. Barra lingue — primaria (badge 1) e secondaria (badge 2), come cambiano i testi
3. Header e pulsante info
4. Stepper: Dati Generali → Controlli → Report
5. Toolbar: TEMPL, DOC, ARCH, SALVA, NEW, PDF (solo quelli realmente presenti)
6. Dati Generali: Ente Costruttore, Ente Verificatore, Dati collaudo, Presenti
7. Controlli: preset, personalizzati, riordino, selezione
8. Report: riepilogo, generazione PDF, marcatura "completato"
9. Archivio: stati, apri / duplica / elimina, salvataggio in localStorage
10. Conclusioni e firme
11. Note tecniche (dati locali al browser, nessun invio server per il verbale)

## Fase 3 — i18n

Sposto ogni stringa della guida dentro `src/lib/i18n.tsx` come nuove chiavi con prefisso `guide` (es. `guideSectionLangTitle`, `guideSectionLangBody`), ognuna con i 4 campi `it / en / de / es`. Traduzioni scritte a mano (non machine translation cieca), coerenti con la terminologia già presente nel dizionario (es. "Ente Costruttore" → `manufacturerTitle`, "Controlli" → `controlsTitle`), così la guida usa gli stessi termini della UI.

Per la resa nel dialog uso **solo la lingua primaria** (`primary`), non il formato affiancato `primaria / secondaria` usato dai campi form — un testo lungo diventerebbe illeggibile. Regola esplicita nella guida: "la guida segue la lingua primaria selezionata in alto".

## Fase 4 — Refactor `info-dialog.tsx`

- Rimuovo il testo italiano hard-coded.
- Uso `const { t, primary } = useI18n();` e compongo il contenuto da chiavi `guide*`.
- I titoli di sezione sono `<h3>` con token del design system, il corpo `<p>` / `<ul>`.
- Il dialog resta `max-w-2xl`, `max-h-[85vh]`, `overflow-y-auto`, trigger `Button variant="outline" size="icon"` con `Info` lucide (già com'è).
- Aggiungo `aria-label` tradotto (`guideOpen`: "Guida" / "Guide" / "Anleitung" / "Guía").

## Dettagli tecnici

- Nessun cambio a routing, auth, backend, PDF, o toolbar: modifiche circoscritte a `src/components/info-dialog.tsx` e `src/lib/i18n.tsx`.
- Nessuna nuova dipendenza.
- Reattività: cambiando la lingua primaria dal `LangSwitcher` la guida si riaggiorna automaticamente (React re-render da context).
- Verifica finale: aprire il dialog nelle 4 lingue e controllare che ogni sezione riflette il codice attuale (toolbar, stepper, archivio).

## Fuori scopo

- Riscrittura del PDF manuale allegato.
- Modifiche alla logica di `cycleLang` o al comportamento primaria/secondaria.
- Traduzione della guida nel formato affiancato `IT / EN` (usiamo solo primaria per leggibilità).
