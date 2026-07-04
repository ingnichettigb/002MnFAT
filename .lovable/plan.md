## Dialog di conferma dopo generazione PDF

Mostrare un dialog modale ben visibile dopo la generazione del PDF con il nome del file, l'indicazione che è stato salvato nella cartella Download del browser, e un bottone "Prosegui" per chiudere.

### Modifiche

**`src/lib/generate-fat-pdf.ts`** — Far ritornare a `generateFatPdf` il nome del file generato (`filename`), senza altri cambiamenti alla logica di salvataggio.

**Nuovo `src/components/pdf-saved-dialog.tsx`** — Componente che esporta:
- `<PdfSavedDialog />` — un `<Dialog>` shadcn controllato che mostra:
  - titolo: "PDF generato"
  - icona check verde
  - testo: "Il file **`<filename>`** è stato salvato nella cartella **Download** del tuo browser (o nella cartella che hai impostato come predefinita per i download)."
  - bottone primario "Prosegui" che chiude il dialog
- Un hook `usePdfSavedDialog()` che restituisce `{ showPdfSaved(filename), dialog }` per uso semplice.

**`src/routes/report.tsx`**, **`src/routes/index.tsx`**, **`src/routes/controlli.tsx`** — In ognuno dei tre punti che chiamano `generateFatPdf(...)`:
- Usare `usePdfSavedDialog()`.
- Catturare il filename ritornato e chiamare `showPdfSaved(filename)`.
- Renderizzare `{dialog}` nel JSX della pagina.
- Rimuovere/sostituire eventuali `toast(...)` ridondanti relativi al PDF generato.

Nessuna modifica alla logica di generazione PDF, al PDF stesso, o ad altri flussi.
