## Obiettivo

Assegnare un **numero univoco in apice** a **ogni etichetta testuale** dell'app (non solo ai campi input), incluse le intestazioni di sezione, gli step dello stepper, i titoli di pagina, i pulsanti, ecc. Lo schema sarà centralizzato in un unico file in modo che tu possa esportare facilmente una tabella Excel `numero → chiave → IT → EN`.

## Schema di numerazione (centralizzato)

Riscrivo `src/lib/fat-numbering.ts` come **registro unico** di tutte le etichette dell'app. Ogni voce avrà: `id` numerico univoco, `key` (chiave i18n), descrizione.

Blocchi previsti (numerazione contigua, senza buchi né duplicati):

```text
1–5    Stepper + titoli pagina + pulsanti globali (Avanti, Indietro, Reset, Genera PDF, lingua)
10     Sezione "Ditta Produttrice" (header)
11–15  Campi Ditta Produttrice (Ragione sociale, Indirizzo, Referente, Email, Telefono)
20     Sezione "Ditta Cliente" (header)
21–25  Campi Ditta Cliente
30     Sezione "Dati del Collaudo" (header)
31–35  Campi comuni (N° Disegno, N° Fabbrica/Matricola, Tag Number Cliente, Data, Luogo)
40     Sezione "Presenti al FAT" (header)
41–42  Etichette colonne presenti (Nome, Ruolo) + pulsante "Aggiungi presente"
50     Sezione "Controlli" (header pagina 2) + pulsanti (Aggiungi personalizzato, ecc.)
100+   Lista controlli (uno per ogni controllo, ID stabile per controllo)
```

I numeri dei **presenti** e dei **controlli personalizzati** sono assegnati in modo deterministico a partire dal loro indice nell'array (es. presente #N → 41 + N, controllo #N → 100 + N), così restano stabili e univoci anche aggiungendo righe.

## Modifiche ai file

1. **`src/lib/fat-numbering.ts`** — riscritto come registro `LABELS` con tutte le voci e helper `labelNumber(key)`.
2. **`src/lib/i18n.tsx`** — aggiunte traduzioni IT/EN per ogni chiave del registro (header sezioni, pulsanti, titoli, ecc.).
3. **`src/components/fat-stepper.tsx`** — numero in apice su ogni step.
4. **`src/routes/index.tsx`** — numero in apice su:
   - titolo pagina
   - header delle 4 sezioni (Produttrice, Cliente, Dati Collaudo, Presenti)
   - ogni campo input (già fatto, ma rimappato sui nuovi ID)
   - pulsanti "Aggiungi presente", "Avanti"
5. **`src/routes/controlli.tsx`** — numero in apice su titolo, header lista, pulsanti, e ogni controllo.
6. **`src/routes/report.tsx`** — numero in apice su titolo, pulsanti "Genera PDF" / "Reset".
7. **`src/routes/__root.tsx`** — numero accanto al `LangSwitcher`.

## Componente helper

Un solo componente `<Lbl id={n}>testo</Lbl>` che renderizza `<sup>n</sup>` in `8px` prima del testo, riusato ovunque (campi, header, pulsanti, step). Sostituisce `NumLabel` attuale.

## Export Excel (per uso futuro)

Il registro `LABELS` esporta anche una funzione `getLabelTable()` che restituisce `[{ id, key, it, en }]`. Aggiungo una piccola utility `src/lib/export-labels.ts` che, chiamata da console o da un bottone nascosto, scarica un CSV `labels.csv` pronto per Excel. (Se preferisci niente bottone, lo lascio solo come funzione — fammi sapere.)

## Garanzia di unicità

A bootstrap, `fat-numbering.ts` esegue un check: se trova due voci con lo stesso `id` lancia un errore in dev console. Così non potranno mai esistere due "1" o due "11" nell'app.

## Cosa NON cambia

- Logica di stato, persistenza localStorage, generazione PDF (il PDF continua a usare gli stessi dati; eventuale aggiunta dei numeri in apice nel PDF è un passo separato — dimmi se la vuoi ora).
