
## Cosa cambio in `src/lib/generate-fat-pdf.ts`

### 1) Intestazione di pagina più compatta
Nella cornice blu in alto (Commessa / N° Disegno / N° Matricola / Tag) oggi:
- etichetta primaria a y+4.5
- etichetta secondaria a y+8.5
- valore a y+19  → c'è un vuoto grande tra etichetta e valore

Modifica:
- etichetta primaria a y+3.5
- etichetta secondaria a y+7
- **valore subito sotto a y+11.5** (font 14, grassetto)
- altezza totale `HEADER_H` ridotta da 34 a ~22 mm
- `TOP` (margine sotto header) ridotto di conseguenza, così guadagniamo ~12 mm utili su ogni pagina

Risultato: appena sotto l'etichetta si legge subito il valore; se è lungo continua sulla stessa riga (maxWidth = larghezza colonna).

### 2) Ultime 3 pagine sempre fisse, in fondo, con colore proprio
Le ultime tre pagine devono essere, in ordine:
1. **VARIE — Allegati tecnici** (nuova pagina dedicata, header colore diverso dal blu — propongo grigio scuro `[80,80,80]`)
2. **DEVIAZIONI** (header rosso scuro, già esistente)
3. **AZIONI CORRETTIVE** (header verde scuro, già esistente)

Garantisco che:
- siano sempre le ultime tre, **dopo** tutte le pagine dei controlli selezionati
- non vengano duplicate: rimuovo eventuali voci "Varie / Deviazioni / Azioni correttive" dalla lista dei controlli prima di iterare (filter su label), così non generano una pagina blu in più che le ripeteva
- la pagina "Varie — Allegati tecnici" avrà una tabella con righe vuote editabili (N° / Descrizione allegato / Rev. / Note) — confermami se i campi vanno bene così o vuoi colonne diverse

### 3) Numerazione pagine corretta
La numerazione `Pagina i di N` viene già fatta in un loop finale su tutte le pagine, quindi una volta che l'ordine fisico è giusto (controlli → Varie → Deviazioni → Azioni Correttive) anche le pagine 9 e 10 risulteranno numerate in coda automaticamente. Verifico che `pageCount` includa tutte e che non rimanga nessuna `addPage()` orfana.

### 4) Verifica
Dopo le modifiche genero un PDF di prova e controllo:
- intestazione compatta con valore subito sotto l'etichetta
- nessuna pagina ripetuta
- ordine finale: …controlli… → Varie → Deviazioni → Azioni Correttive
- numerazione progressiva corretta fino all'ultima

---

**Conferma due cose prima che proceda:**
1. La pagina "Varie — Allegati tecnici" va creata come **pagina fissa** (come Deviazioni/Azioni Correttive), giusto? E va rimossa dalla lista dei controlli per evitare duplicati.
2. Il colore dell'header della pagina "Varie" va bene grigio scuro, o ne preferisci un altro (es. arancio, viola)?
