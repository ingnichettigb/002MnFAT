# Bottoni "Report PDF" (step 3) e "Genera Report FAT" (8) — stesso comportamento

## Cosa fanno oggi

- **Bottone 3** (`src/components/fat-stepper.tsx`): è un `<Link to="/report">`. Naviga e basta, non genera niente.
- **Bottone 8** (`src/routes/report.tsx` → `generateFatPdf` in `src/lib/generate-fat-pdf.ts`, righe 1330-1341):
  1. `window.open(URL.createObjectURL(blob))` → apre nuova scheda (nome blob hash es. `yjwBgyfp.pdf`)
  2. `doc.save(filename)` → scarica `mini-fat_<matricola>_<data>.pdf`
  Risultato: **un solo PDF** servito due volte.

## Modifiche

### 1. `src/lib/generate-fat-pdf.ts` — apertura con nome corretto, niente doppio file

Sostituire il blocco finale (1330-1341) così:

- Costruire il blob una volta sola.
- Creare un `<a>` con `href = blob URL` e `download = filename`, simulare il click.
- Aprire la scheda con un blob URL che ha il nome forzato tramite anchor (uso di `File` invece di `Blob`, che eredita il `name`, e `window.open` con `target="_blank"`).
- In pratica: una sola azione → il browser apre il PDF in nuova scheda con il nome `mini-fat_*.pdf` nella titlebar/download. Eliminare la chiamata `doc.save()` separata.

Tecnica concreta:
```
const blob = doc.output("blob");
const file = new File([blob], filename, { type: "application/pdf" });
const url = URL.createObjectURL(file);
const a = document.createElement("a");
a.href = url;
a.download = filename;          // forza il nome se l'utente salva
a.target = "_blank";
a.rel = "noopener noreferrer";
document.body.appendChild(a);
a.click();
a.remove();
setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
```
Nota: il nome esatto nella tab dipende dal browser, ma con `File` + `download` Chrome/Edge/Firefox mostrano `mini-fat_*.pdf` invece dell'hash, e non viene generato un secondo download.

### 2. `src/components/fat-stepper.tsx` — step 3 genera il PDF

- Accettare nelle props un opzionale `onReportClick?: () => void`.
- Se l'utente clicca lo step 3:
  - se `onReportClick` è fornito → chiamarlo (preventDefault sul Link, niente navigazione)
  - altrimenti → comportamento attuale (naviga a `/report`).
- Lo step 3 resta cliccabile sempre (oggi è già un `<Link>` su tutte le pagine).

### 3. Passare l'handler dalle pagine `/` e `/controlli`

In `src/routes/index.tsx` e `src/routes/controlli.tsx`, dove viene renderizzato `<FatStepper current={...} />`:

- Importare `useFat`, `useI18n`, `generateFatPdf`, `toast`.
- Costruire `handleGenerate` identico a quello in `report.tsx`:
  ```
  const handleGenerate = () => {
    markDone();
    toast.success(t("reportGeneratedDone"));
    generateFatPdf(state, lang, secondary);
  };
  ```
- Passarlo come `<FatStepper current={1} onReportClick={handleGenerate} />`.

In `src/routes/report.tsx` lasciare `<FatStepper current={3} />` senza handler (sei già lì, lo step 3 attivo non deve rigenerare al click — l'utente usa il bottone 8 in fondo).

## File toccati

- `src/lib/generate-fat-pdf.ts` (blocco finale 1330-1341)
- `src/components/fat-stepper.tsx` (prop + handler click su step 3)
- `src/routes/index.tsx` (passa handler)
- `src/routes/controlli.tsx` (passa handler)

Nessun cambio a routing, DB, auth, o ad altri bottoni numerati.
