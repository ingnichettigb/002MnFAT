## Obiettivo
Aggiungere un pulsante informazioni (icona `i`) sulla stessa riga del selettore lingua nella home. Al click apre un dialog con la guida all'uso di mini FAT (contenuto tratto dal manuale allegato).

## Modifiche

### 1. Nuovo componente `src/components/info-dialog.tsx`
- Bottone `Button` variant `outline` size `icon` con icona `Info` di lucide-react (stessa altezza dei pulsanti lingua).
- `Dialog` shadcn con `DialogContent` scrollabile (max-h ~80vh) che mostra il manuale in italiano, sezioni:
  1. Cos'è mini FAT
  2. Schermata principale (sezioni 100/200/300/400)
  3. Selezione lingua (LANG)
  4. Template (TEMPL)
  5. Documenti richiesti (DOC)
  6. Anteprima e generazione PDF
  7. Archivio FAT
  8. Salvataggio dati
  9. Flusso di lavoro consigliato
  10. Note tecniche
- Titoli `h3` semantici, elenchi puntati, tipografia con token del design system (nessun colore hardcoded).

### 2. `src/routes/index.tsx`
- Nel header allineato a `LangSwitcher`, wrap in un `div` flex con gap e aggiungere `<InfoDialog />` accanto:
  ```tsx
  <div className="flex items-center gap-2">
    <LangSwitcher />
    <InfoDialog />
  </div>
  ```

## Note
- Nessuna modifica a logica di business, i18n o backend.
- Contenuto solo in italiano (come il manuale). Se in futuro serve bilingue si potrà estendere via `t()`.
