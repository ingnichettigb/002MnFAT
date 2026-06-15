## Modifiche al PDF — Prima pagina "Presenti al FAT"

### 1. Auto-shrink del campo "Ruolo"
In `src/lib/generate-fat-pdf.ts`, nella sezione che disegna le righe firme di prima pagina (`signRows`):
- Per la cella "Ruolo / Rolle", misurare la larghezza del testo con il font corrente.
- Se eccede la larghezza disponibile della colonna, ridurre progressivamente il font (es. da 10pt → 9 → 8 → 7, minimo 6pt) finché il testo entra su **una sola riga**.
- Se anche a 6pt non entra, troncare con `…`.
- Il font di nome+ditta resta invariato (la sua logica di troncamento della ditta è già a posto).

### 2. Composizione fissa: 3 cliente + 1 produttore (4 righe)
Sostituire la logica attuale (fino a 3 cliente) con:
- Prendere fino a **3 firmatari cliente** dall'array `orderedAttendees` (parte cliente).
- Se cliente < 3 → completare con i **primi produttori** fino ad arrivare a 4 righe totali (caso 1c).
- Se cliente ≥ 3 → aggiungere il **primo produttore** come 4ª riga.
- Se non ci sono produttori → aggiungere comunque una **4ª riga vuota** predisposta per la firma del produttore (caso 2: sì).
- Totale sempre **4 righe** sulla tabella firme di prima pagina.

### Dettagli tecnici
- File toccato: `src/lib/generate-fat-pdf.ts` (solo rendering PDF, nessuna modifica al form né al riepilogo on-screen `/report`).
- Helper `fitRoleFontSize(doc, text, maxWidth, baseSize, minSize)` che fa il loop `doc.getTextWidth()` riducendo size di 1pt.
- L'array `signRows` viene costruito così:
  1. `customer = orderedAttendees.filter(!isMfg).slice(0,3)`
  2. `mfg = orderedAttendees.filter(isMfg)`
  3. `needed = 4 - customer.length`
  4. `extra = mfg.slice(0, Math.max(1, needed))` (almeno 1 slot produttore)
  5. `rows = [...customer, ...extra]`, poi pad con `null` fino a length 4
  6. Le righe `null` vengono disegnate come riga vuota (solo bordi/sfondo, niente testo).

### Fuori scope
- Sezione 4 estesa (pagina 2) e riepilogo a schermo restano invariati nell'ordinamento già concordato.
- Logica `isMfg` / `sameCompany` già presente viene riutilizzata.
